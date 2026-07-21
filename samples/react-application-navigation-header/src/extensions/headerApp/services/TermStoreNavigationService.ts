import { spfi, SPFx, SPFI } from '@pnp/sp';
import '@pnp/sp/navigation';
import '@pnp/sp/webs';
import type { IMenuNode, IMenuNodeCollection } from '@pnp/sp/navigation';

interface ITaxonomyTerm {
  id: string;
  labels?: Array<{ name: string; isDefault?: boolean }>;
  properties?: Array<{ key: string; value: string }>;
  
  localProperties?: Array<{ key: string; value: string }> | Record<string, string>;
  children?: ITaxonomyTerm[];
  childrenCount?: number;
  isDeprecated?: boolean;
  
  descriptions?: Array<{ languageTag: string; description: string }>;
}

function getTermLabel(term: ITaxonomyTerm): string {
  const defaultLabel = term.labels?.find((label) => label.isDefault);
  return defaultLabel?.name ?? term.labels?.[0]?.name ?? 'Unknown';
}

function getTermProperties(term: ITaxonomyTerm): Record<string, string> {
  const result: Record<string, string> = {};

  const localPropsArray = Array.isArray(term.localProperties) ? term.localProperties : [];
  for (const prop of [...(term.properties ?? []), ...localPropsArray]) {
    if (prop?.key) {
      result[prop.key] = prop.value ?? '';
    }
  }

  if (term.localProperties && !Array.isArray(term.localProperties)) {
    const dict = term.localProperties as Record<string, string>;
    for (const key in dict) {
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        result[key] = dict[key] ?? '';
      }
    }
  }
  return result;
}
import type { INavigationItem, INavigationItemMeta } from '../models/INavigationItem';
import type { INavigationProvider } from './INavigationProvider';

import type { IHeaderFeatures } from '../models/IHeaderFeatures';
import { parseFeatureFlagsFromProperties } from '../models/IHeaderFeatures';
import { PLACEHOLDER_NAVIGATION_ITEMS } from '../data/placeholderNavigation';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationDiagnostic } from '../utils/navigationTelemetry';
import { reportError } from '../utils/errorReporting';
import { spGetWithRetry } from '../utils/spHttpRetry';
import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { Log } from '@microsoft/sp-core-library';

const NAVIGATION_CACHE_TTL_MS = 1000 * 60 * 5;
const NAVIGATION_FETCH_DEPTH = 10;
const DEFAULT_SORT_ORDER = 999999;
const DEFAULT_MENU_STATE_PROVIDER = 'GlobalNavSiteMapProvider';
const CACHE_CLEAR_QUERY_FLAG = 'headerRefresh';
const KNOWN_MENU_STATE_PROVIDERS: ReadonlySet<string> = new Set<string>([
  'GlobalNavSiteMapProvider',
  'CurrentNavSiteMapProvider',
  'GlobalNavigationSwitchableProvider',
  'CurrentNavigationSwitchableProvider'
]);

const TERM_ENRICHMENT_CACHE_PREFIX = 'header-term-enrichment-v1:';
const TERM_ENRICHMENT_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

interface ITermEnrichmentCacheEntry {
  cachedAt: number;
  labels?: ITaxonomyTerm['labels'];
  properties?: ITaxonomyTerm['properties'];
  localProperties?: ITaxonomyTerm['localProperties'];
}

export class TermStoreNavigationService implements INavigationProvider {
  public readonly providerName: string = 'taxonomy';
  private _cachedSnapshot?: INavigationItem[];
  private _cacheTimestamp: number = 0;
  private _sp?: SPFI;
  private _cachedMenuCollection?: IMenuNodeCollection;
  private _cachedNodesById: Map<string, IMenuNode> = new Map<string, IMenuNode>();
  
  private _termIdByNodeId: Map<string, string> = new Map<string, string>();
  
  private _activeProvider: 'termset' | 'menustate' = 'menustate';
  private _navigationPromise?: Promise<INavigationItem[]>;
  
  private _childrenPromiseByParentKey: Map<string, Promise<INavigationItem[]>> = new Map<string, Promise<INavigationItem[]>>();

  public constructor(
    private readonly _context: ApplicationCustomizerContext,
    private readonly _menuStateProviderName: string = DEFAULT_MENU_STATE_PROVIDER,
    private readonly _termSetId?: string
  ) {}

  public getCachedNavigationSnapshot(): INavigationItem[] | undefined {
    if (this._isCacheBypassRequested()) {
      this.clearCache();
    }

    if (this._cachedSnapshot && Date.now() - this._cacheTimestamp < NAVIGATION_CACHE_TTL_MS) {

      return this._cachedSnapshot.slice();
    }

    return undefined;
  }

  public getImmediateNavigationSnapshot(): INavigationItem[] {
    return this.getCachedNavigationSnapshot() ?? this._getPlaceholderNavigation();
  }

  public clearCache(): void {
    this._cachedSnapshot = undefined;
    this._cacheTimestamp = 0;
    this._cachedMenuCollection = undefined;
    this._cachedNodesById = new Map<string, IMenuNode>();
    this._termIdByNodeId = new Map<string, string>();
    this._childrenPromiseByParentKey = new Map<string, Promise<INavigationItem[]>>();
    this._activeProvider = 'menustate';
  }

  private _isCacheBypassRequested(): boolean {
    if (typeof window === 'undefined' || !window.location.search) {
      return false;
    }

    return new URLSearchParams(window.location.search).has(CACHE_CLEAR_QUERY_FLAG);
  }

  public async getNavigation(): Promise<INavigationItem[]> {
    const cached = this.getCachedNavigationSnapshot();
    if (cached) {
      return cached;
    }

    if (!this._navigationPromise) {
      this._navigationPromise = (async (): Promise<INavigationItem[]> => {
        try {
          const items = await this._loadNavigationWithPnP();
          this._cachedSnapshot = items;
          this._cacheTimestamp = Date.now();
          return items;
        } catch (error: unknown) {
          reportError(error, { action: 'navigation-load-failed', level: 'service' });
          return this._getPlaceholderNavigation();
        } finally {
          this._navigationPromise = undefined;
        }
      })();
    }

    const navigationPromise: Promise<INavigationItem[]> = this._navigationPromise;
    const items = await navigationPromise;
    return items.map((item) => this._cloneItem(item));
  }

  public async getChildren(parentKey: string): Promise<INavigationItem[]> {
    if (this._activeProvider === 'termset') {
      return this._getTermChildren(parentKey);
    }

    if (!this._cachedMenuCollection) {
      Log.warn('header', 'getChildren called before navigation loaded');
      return [];
    }

    const parentNode = this._cachedNodesById.get(parentKey);
    if (!parentNode?.Nodes) {
      return [];
    }

    return parentNode.Nodes.map((node: IMenuNode, index: number) => {
      const item = this._mapMenuNodeToNavigationItemFlat(node, this._createNavigationNodeId(node, parentKey, index));
      item.children = node.Nodes
        ? node.Nodes.map((child: IMenuNode, childIndex: number) =>
            this._mapMenuNodeToNavigationItemFlat(child, this._createNavigationNodeId(child, item.id, childIndex))
          )
        : [];
      item.hasChildren = item.children.length > 0;
      return item;
    });
  }

  private async _getTermChildren(parentKey: string): Promise<INavigationItem[]> {
    const termId = this._termIdByNodeId.get(parentKey);
    if (!termId) {
      Log.warn('header', `getChildren: no term mapped for node "${parentKey}"`);
      return [];
    }

    const inFlight = this._childrenPromiseByParentKey.get(parentKey);
    if (inFlight) {
      return inFlight;
    }

    const promise = (async (): Promise<INavigationItem[]> => {
      try {
        const childTerms = await this._fetchTerms(`/sets/${this._termSetId}/terms/${termId}/children`);
        return childTerms
          .filter((term) => !term.isDeprecated)
          .map((term, index) => this._mapTermToNavigationItemFlat(term, `${parentKey}/${index}`));
      } catch (error: unknown) {
        reportError(error, { action: 'term-children-load-failed', level: 'service', itemId: parentKey });
        return [];
      } finally {
        this._childrenPromiseByParentKey.delete(parentKey);
      }
    })();

    this._childrenPromiseByParentKey.set(parentKey, promise);
    return promise;
  }

  private _getSp(): SPFI {
    if (!this._sp) {
      this._sp = spfi().using(SPFx(this._context));
    }

    return this._sp;
  }

  private async _loadNavigationWithPnP(): Promise<INavigationItem[]> {

    if (this._termSetId) {
      const fromTermSet = await this._loadNavigationFromTermSet();
      if (fromTermSet.length > 0) {
        this._activeProvider = 'termset';
        return fromTermSet;
      }

      emitNavigationDiagnostic({
        action: 'term-set-empty-trying-menu-state',
        level: 'service',
        termSetName: this._termSetId,
        reason: this._menuStateProviderName
      });
    }

    this._activeProvider = 'menustate';
    try {
      const fromMenuState = await this._loadNavigationFromMenuState();
      if (fromMenuState.length > 0) {
        return fromMenuState;
      }
    } catch (error: unknown) {

      reportError(error, { action: 'menu-state-load-failed', level: 'service', severity: 'warning' });
    }

    return this._getPlaceholderNavigation();
  }

  
  private _getMenuStateProvider(): string {
    if (KNOWN_MENU_STATE_PROVIDERS.has(this._menuStateProviderName)) {
      return this._menuStateProviderName;
    }

    Log.warn('header', `Unknown navigationProviderName "${this._menuStateProviderName}"; using ${DEFAULT_MENU_STATE_PROVIDER}`);
    emitNavigationDiagnostic({
      action: 'invalid-nav-provider',
      level: 'service',
      reason: this._menuStateProviderName,
      metadata: { coercedTo: DEFAULT_MENU_STATE_PROVIDER }
    });
    return DEFAULT_MENU_STATE_PROVIDER;
  }

  private async _loadNavigationFromMenuState(): Promise<INavigationItem[]> {
    const sp = this._getSp();
    const provider = this._getMenuStateProvider();
    const menuCollection = await sp.navigation.getMenuState(undefined, NAVIGATION_FETCH_DEPTH, provider);
    this._cachedMenuCollection = menuCollection;
    this._cachedNodesById = new Map<string, IMenuNode>();

    if (!menuCollection.Nodes || menuCollection.Nodes.length === 0) {
      Log.warn('header', `Menu state provider "${provider}" returned no navigation nodes`);
      return [];
    }

    const rootProps = (menuCollection as unknown as { CustomProperties?: unknown[] }).CustomProperties ?? [];
    const rootFeatures = parseFeatureFlagsFromProperties(this._parseCustomProperties(rootProps));

    return menuCollection.Nodes.map((node: IMenuNode, index: number) => {
      const item = this._mapMenuNodeToNavigationItemFlat(node, this._createNavigationNodeId(node, undefined, index));
      item.features = { ...rootFeatures, ...item.features };
      return item;
    });
  }

  
  private async _loadNavigationFromTermSet(): Promise<INavigationItem[]> {
    try {

      const terms = await this._fetchTerms(`/sets/${this._termSetId}/children`);

      if (terms.length === 0) {
        Log.warn('header', `Term set ${this._termSetId} returned no terms`);
        emitNavigationDiagnostic({
          action: 'term-set-empty',
          level: 'service',
          termSetName: this._termSetId,
          reason: 'no-terms-returned'
        });
        return [];
      }

      const rootItems = terms
        .filter((term) => !term.isDeprecated)
        .map((term, index) => this._mapTermToNavigationItemFlat(term, `root/${index}`));

      const rootFeatures = rootItems[0]?.features ?? {};
      return rootItems.map((item) => ({ ...item, features: { ...rootFeatures, ...item.features } }));
    } catch (error: unknown) {
      reportError(error, { action: 'term-set-load-failed', level: 'service', termSetName: this._termSetId });
      return [];
    }
  }

  
  private async _fetchTerms(relativePath: string): Promise<ITaxonomyTerm[]> {

    const selectFields = 'id,labels,properties,localProperties,descriptions,childrenCount,isDeprecated';
    const childSelect = `children($select=${selectFields};$expand=children($select=${selectFields}))`;

    let terms: ITaxonomyTerm[] = [];

    try {
      const url = `${this._getWebUrl()}/_api/v2.1/termStore${relativePath}?$select=${selectFields}&$expand=${childSelect}`;
      const response = await spGetWithRetry(this._context.spHttpClient, url);
      if (response.ok) {
        const data = await response.json();
        terms = Array.isArray(data?.value) ? (data.value as ITaxonomyTerm[]) : (data && !Array.isArray(data) ? [data as ITaxonomyTerm] : []);
      }
    } catch { void 0; }

    if (terms.length === 0) {
      try {
        const url = `${this._getWebUrl()}/_api/v2.1/termStore${relativePath}?$select=${selectFields}`;
        const response = await spGetWithRetry(this._context.spHttpClient, url);
        if (response.ok) {
          const data = await response.json();
          terms = Array.isArray(data?.value) ? (data.value as ITaxonomyTerm[]) : (data && !Array.isArray(data) ? [data as ITaxonomyTerm] : []);
        }
      } catch { void 0; }
    }

    if (terms.length === 0) {
      return [];
    }

    const termsNeedingEnrichment = terms.filter(
      (term) => term.id && (!term.labels || term.labels.length === 0)
    );

    const ENRICHMENT_CONCURRENCY = 6;
    for (let i = 0; i < termsNeedingEnrichment.length; i += ENRICHMENT_CONCURRENCY) {
      const batch = termsNeedingEnrichment.slice(i, i + ENRICHMENT_CONCURRENCY);
      await Promise.all(batch.map((term) => this._enrichTerm(term)));
    }

    return terms;
  }

  private _getEnrichmentCacheKey(termId: string): string {
    return `${TERM_ENRICHMENT_CACHE_PREFIX}${this._termSetId}:${termId}`;
  }

  private _tryApplyEnrichmentFromCache(term: ITaxonomyTerm): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    try {
      const raw = window.localStorage.getItem(this._getEnrichmentCacheKey(term.id));
      if (!raw) {
        return false;
      }

      const entry = JSON.parse(raw) as ITermEnrichmentCacheEntry;
      if (!entry || typeof entry.cachedAt !== 'number' || Date.now() - entry.cachedAt >= TERM_ENRICHMENT_CACHE_TTL_MS) {
        return false;
      }

      if (entry.labels) { term.labels = entry.labels; }
      if (entry.properties) { term.properties = entry.properties; }
      if (entry.localProperties) { term.localProperties = entry.localProperties; }
      return !!term.labels && term.labels.length > 0;
    } catch {
      return false;
    }
  }

  private _writeEnrichmentCache(term: ITaxonomyTerm): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      const entry: ITermEnrichmentCacheEntry = {
        cachedAt: Date.now(),
        labels: term.labels,
        properties: term.properties,
        localProperties: term.localProperties
      };
      window.localStorage.setItem(this._getEnrichmentCacheKey(term.id), JSON.stringify(entry));
    } catch { void 0; }
  }

  private async _enrichTerm(term: ITaxonomyTerm): Promise<void> {
    if (!term.id || !this._termSetId) { return; }

    if (this._tryApplyEnrichmentFromCache(term)) {
      return;
    }

    try {
      const termUrl = `${this._getWebUrl()}/_api/v2.1/termStore/sets/${this._termSetId}/terms/${term.id}?$select=id,labels,properties,localProperties`;
      const termResponse = await spGetWithRetry(this._context.spHttpClient, termUrl);
      if (termResponse.ok) {
        const termData = await termResponse.json();
        if (termData?.labels) { term.labels = termData.labels; }
        if (termData?.properties) { term.properties = termData.properties; }
        if (termData?.localProperties) { term.localProperties = termData.localProperties; }
        if (term.labels && term.labels.length > 0) {
          this._writeEnrichmentCache(term);
        }
        return;
      }
    } catch { void 0; }

    try {
      const sessionUrl = `${this._getWebUrl()}/_api/SP.Taxonomy.TaxonomySession/GetTermSetsById('${this._termSetId}')/terms/getById('${term.id}')`;
      const sessionResponse = await spGetWithRetry(this._context.spHttpClient, sessionUrl);
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        if (sessionData?.Name) {
          term.labels = [{ name: sessionData.Name, isDefault: true }];
        }

        const propsUrl = `${this._getWebUrl()}/_api/SP.Taxonomy.TaxonomySession/GetTermSetsById('${this._termSetId}')/terms/getById('${term.id}')/localCustomProperties`;
        const propsResponse = await spGetWithRetry(this._context.spHttpClient, propsUrl);
        if (propsResponse.ok) {
          const propsData = await propsResponse.json();
          if (propsData) {
            const localProps: Array<{ key: string; value: string }> = [];
            const propObj = propsData.d?.results ?? propsData.value ?? propsData;
            if (Array.isArray(propObj)) {
              for (const p of propObj) {
                if (p.Key && p.Value !== undefined) {
                  localProps.push({ key: p.Key, value: String(p.Value) });
                }
              }
            } else if (typeof propObj === 'object') {
              for (const key in propObj) {
                if (key.startsWith('_Sys_Nav_')) {
                  localProps.push({ key, value: String(propObj[key]) });
                }
              }
            }
            if (localProps.length > 0) {
              term.localProperties = localProps;
            }
          }
        }
      }

      if (term.labels && term.labels.length > 0) {
        this._writeEnrichmentCache(term);
      }
    } catch {

      if (!term.labels || term.labels.length === 0) {
        term.labels = [{ name: (term as unknown as { name?: string }).name ?? 'Unnamed', isDefault: true }];
      }
    }
  }

  private _mapTermToNavigationItemFlat(term: ITaxonomyTerm, nodeId: string): INavigationItem {
    this._termIdByNodeId.set(nodeId, term.id);

    const props = getTermProperties(term);

    const description = term.descriptions?.[0]?.description ?? '';
    const url = sanitizeUrl(
      props._Sys_Nav_SimpleLinkUrl
        ?? props._Sys_Nav_TargetUrl
        ?? props.SimpleUrl
        ?? props.Url
        ?? (description && /^https?:\/\//.test(description) ? description : undefined)
    );
    const hasChildren = (term.childrenCount ?? (term.children ?? []).filter((child) => !child.isDeprecated).length) > 0;

    return this._buildNavigationItem({
      id: nodeId,
      label: getTermLabel(term),
      url,
      props,
      hasChildren,
      children: []
    });
  }

  private _mapMenuNodeToNavigationItemFlat(node: IMenuNode, nodeId: string): INavigationItem {
    this._cachedNodesById.set(nodeId, node);

    const props = this._parseCustomProperties(node.CustomProperties ?? []);
    const url = sanitizeUrl(node.SimpleUrl ?? undefined);
    const hasNestedNodes = !!(node.Nodes && node.Nodes.length > 0);

    return this._buildNavigationItem({
      id: nodeId,
      label: node.Title ?? 'Unknown',
      url,
      props,
      hasChildren: hasNestedNodes,
      children: []
    });
  }

  
  private _buildNavigationItem(params: {
    id: string;
    label: string;
    url: string | undefined;
    props: Record<string, string>;
    hasChildren: boolean;
    children: INavigationItem[];
  }): INavigationItem {
    const { id, label, url, props, hasChildren, children } = params;
    const isExternal = url ? this._isExternalUrl(url) : false;
    const order = parseInt(props.Order ?? props.SortOrder ?? String(DEFAULT_SORT_ORDER), 10);
    const featuredRank = parseInt(props.FeaturedRank ?? String(DEFAULT_SORT_ORDER), 10);
    const meta = this._buildMeta(props);
    const features: IHeaderFeatures = parseFeatureFlagsFromProperties(props);

    return {
      id,
      label,
      url,
      description: props.Description ?? '',
      group: props.Group ?? 'Explore',
      groupOrder: props.GroupOrder ? this._parseArrayProperty(props.GroupOrder) : undefined,
      order: isNaN(order) ? DEFAULT_SORT_ORDER : order,
      featured: !!props.Featured,
      featuredRank: isNaN(featuredRank) ? DEFAULT_SORT_ORDER : featuredRank,
      overviewTitle: props.OverviewTitle ?? '',
      overviewDescription: props.OverviewDescription ?? '',
      matchUrls: this._parseArrayProperty(props.MatchUrls ?? ''),
      isExternal,
      hasChildren,
      children,
      iconName: props.IconName || undefined,
      meta: this._hasAnyValue(meta as unknown as Record<string, string | undefined>) ? meta : undefined,
      features: Object.keys(features).length > 0 ? features : undefined
    };
  }

  private _buildMeta(props: Record<string, string>): INavigationItemMeta {
    return {
      title: props.MetaTitle || undefined,
      description: props.MetaDescription || undefined,
      keywords: props.MetaKeywords || undefined,
      ogImage: props.MetaOgImage || undefined,
      ogType: props.MetaOgType || undefined,
      robots: props.MetaRobots || undefined,
      canonical: props.MetaCanonical || undefined
    };
  }

  private _getWebUrl(): string {
    return this._context.pageContext.web.absoluteUrl?.replace(/\/+$/, '') ?? '';
  }

  private _createNavigationNodeId(node: IMenuNode, parentId: string | undefined, index: number): string {
    const rawSegment = node.Key || node.FriendlyUrlSegment || node.Title || `node-${index}`;
    const normalizedSegment = rawSegment
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `node-${index}`;

    return parentId
      ? `${parentId}/${index}-${normalizedSegment}`
      : `root/${index}-${normalizedSegment}`;
  }

  private _parseCustomProperties(customProperties: unknown[]): Record<string, string> {
    const result: Record<string, string> = {};

    for (const prop of customProperties) {
      if (prop && typeof prop === 'object') {
        const record = prop as { Key?: unknown; Value?: unknown };
        const key = String(record.Key ?? '');
        const value = String(record.Value ?? '');
        if (key) {
          result[key] = value;
        }
      }
    }

    return result;
  }

  private _hasAnyValue(record: Record<string, string | undefined>): boolean {
    for (const key in record) {
      if (Object.prototype.hasOwnProperty.call(record, key) && record[key]) {
        return true;
      }
    }
    return false;
  }

  private _parseArrayProperty(value: string): string[] {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    }
  }

  private _getPlaceholderNavigation(): INavigationItem[] {
    return PLACEHOLDER_NAVIGATION_ITEMS.map((item) => this._cloneItem(item));
  }

  private _cloneItem(item: INavigationItem): INavigationItem {
    return {
      ...item,
      matchUrls: item.matchUrls ? [...item.matchUrls] : undefined,
      groupOrder: item.groupOrder ? [...item.groupOrder] : undefined,
      isExternal: item.url ? this._isExternalUrl(item.url) : item.isExternal,
      hasChildren: item.hasChildren ?? item.children.length > 0,
      children: item.children.map((child) => this._cloneItem(child))
    };
  }

  private _isExternalUrl(url: string): boolean {
    try {
      return new URL(url, window.location.origin).origin !== window.location.origin;
    } catch {
      return false;
    }
  }
}
