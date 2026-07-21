import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import type { INavigationItem } from '../models/INavigationItem';
import type { INavigationProvider } from './INavigationProvider';
import { PLACEHOLDER_NAVIGATION_ITEMS } from '../data/placeholderNavigation';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationDiagnostic } from '../utils/navigationTelemetry';
import { reportError } from '../utils/errorReporting';
import { spGetWithRetry } from '../utils/spHttpRetry';
import { saveFileWithETagConcurrency } from '../utils/spFileConcurrency';
import { sanitizeNavigationItems } from '../utils/navigationFileValidation';

const NAVIGATION_CACHE_TTL_MS = 1000 * 60 * 5;
const DEFAULT_FILE_NAME = 'navigation.json';
const DEFAULT_FOLDER = 'SiteAssets';

export interface INavigationFile {
  version: number;
  updatedBy?: string;
  updatedAt?: string;
  items: INavigationFileItem[];
}

export interface INavigationFileItem {
  id: string;
  label: string;
  url?: string;
  description?: string;
  group?: string;
  order?: number;
  featured?: boolean;
  featuredRank?: number;
  overviewTitle?: string;
  overviewDescription?: string;
  matchUrls?: string[];
  isExternal?: boolean;
  iconName?: string;
  children?: INavigationFileItem[];
}

export class JsonFileNavigationService implements INavigationProvider {
  public readonly providerName: string = 'jsonFile';
  private _cachedSnapshot?: INavigationItem[];
  private _cacheTimestamp: number = 0;
  private _navigationPromise?: Promise<INavigationItem[]>;
  
  private _lastKnownETag?: string;

  public constructor(
    private readonly _context: ApplicationCustomizerContext,
    private readonly _homeUrl: string,
    private readonly _fileName: string = DEFAULT_FILE_NAME,
    private readonly _folder: string = DEFAULT_FOLDER
  ) {}

  public getCachedNavigationSnapshot(): INavigationItem[] | undefined {
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
    this._navigationPromise = undefined;
  }

  public async getNavigation(): Promise<INavigationItem[]> {
    const cached = this.getCachedNavigationSnapshot();
    if (cached) {
      return cached;
    }

    if (!this._navigationPromise) {
      this._navigationPromise = (async (): Promise<INavigationItem[]> => {
        try {
          const file = await this._loadNavigationFile();
          const items = this._mapFileToNavigationItems(file);
          this._cachedSnapshot = items;
          this._cacheTimestamp = Date.now();
          return items;
        } catch (error: unknown) {
          reportError(error, { action: 'json-navigation-load-failed', level: 'service' });
          return this._getPlaceholderNavigation();
        } finally {
          this._navigationPromise = undefined;
        }
      })();
    }

    const items = await this._navigationPromise;
    return items.map((item) => this._cloneItem(item));
  }

  public async getChildren(_parentKey: string): Promise<INavigationItem[]> {

    return [];
  }

  
  public async saveNavigation(items: INavigationItem[], updatedBy?: string): Promise<void> {
    const file: INavigationFile = {
      version: 1,
      updatedBy,
      updatedAt: new Date().toISOString(),
      items: items.map((item) => this._mapItemToFileItem(item))
    };

    const folderServerRelativeUrl = this._getFolderServerRelativeUrl();
    const body = JSON.stringify(file, null, 2);

    try {
      const result = await saveFileWithETagConcurrency(
        this._context.spHttpClient,
        this._homeUrl,
        folderServerRelativeUrl,
        this._fileName,
        body,
        this._lastKnownETag,
        'Updated via header editor'
      );
      this._lastKnownETag = result.etag;
    } catch (error: unknown) {
      reportError(error, { action: 'json-navigation-save-failed', level: 'service', rethrow: true });
    }

    this.clearCache();
  }

  private async _loadNavigationFile(): Promise<INavigationFile> {
    const fileServerRelativeUrl = `${this._getFolderServerRelativeUrl()}/${this._fileName}`;
    const fileUrl = `${this._homeUrl}/_api/web/getfilebyserverrelativeurl('${fileServerRelativeUrl}')/$value`;

    const response = await spGetWithRetry(this._context.spHttpClient, fileUrl);

    if (!response.ok) {
      if (response.status === 404) {

        this._lastKnownETag = undefined;
        emitNavigationDiagnostic({
          action: 'json-navigation-file-missing',
          level: 'service',
          metadata: { fileUrl }
        });
        return { version: 1, items: [] };
      }
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    this._lastKnownETag = response.headers.get('ETag') ?? undefined;

    const text = await response.text();
    if (!text.trim()) {
      return { version: 1, items: [] };
    }

    try {
      const parsed = JSON.parse(text) as Partial<INavigationFile> | null;
      if (!parsed || !Array.isArray(parsed.items)) {
        throw new Error('Invalid navigation file: missing items array');
      }

      const { items, warnings } = sanitizeNavigationItems(parsed.items);
      if (warnings.length > 0) {
        emitNavigationDiagnostic({
          action: 'json-navigation-validation-warnings',
          level: 'service',
          reason: warnings.slice(0, 5).join(' | '),
          metadata: { totalWarnings: warnings.length, fileUrl }
        });
      }

      return {
        version: parsed.version ?? 1,
        updatedBy: parsed.updatedBy,
        updatedAt: parsed.updatedAt,
        items
      };
    } catch (parseError) {
      reportError(parseError, { action: 'json-navigation-parse-failed', level: 'service', severity: 'warning' });
      return { version: 1, items: [] };
    }
  }

  private _mapFileToNavigationItems(file: INavigationFile): INavigationItem[] {
    return file.items.map((item) => this._mapFileItemToNavigationItem(item));
  }

  private _mapFileItemToNavigationItem(item: INavigationFileItem): INavigationItem {
    const url = sanitizeUrl(item.url);
    return {
      id: item.id,
      label: item.label,
      url,
      description: item.description ?? '',
      group: item.group ?? 'Explore',
      order: item.order ?? 999999,
      featured: !!item.featured,
      featuredRank: item.featuredRank ?? 999999,
      overviewTitle: item.overviewTitle ?? '',
      overviewDescription: item.overviewDescription ?? '',
      matchUrls: item.matchUrls ? [...item.matchUrls] : undefined,
      isExternal: url ? this._isExternalUrl(url) : false,
      hasChildren: !!item.children && item.children.length > 0,
      children: (item.children ?? []).map((child) => this._mapFileItemToNavigationItem(child))
    };
  }

  private _mapItemToFileItem(item: INavigationItem): INavigationFileItem {
    return {
      id: item.id,
      label: item.label,
      url: item.url,
      description: item.description || undefined,
      group: item.group,
      order: item.order,
      featured: item.featured,
      featuredRank: item.featuredRank,
      overviewTitle: item.overviewTitle,
      overviewDescription: item.overviewDescription,
      matchUrls: item.matchUrls,
      isExternal: item.isExternal,
      iconName: item.iconName,
      children: item.children.map((child) => this._mapItemToFileItem(child))
    };
  }

  private _getFolderServerRelativeUrl(): string {
    try {
      return `${new URL(this._homeUrl).pathname.replace(/\/+$/, '')}/${this._folder}`;
    } catch {
      return `/${this._folder}`;
    }
  }

  private _getPlaceholderNavigation(): INavigationItem[] {
    return PLACEHOLDER_NAVIGATION_ITEMS.map((item) => this._cloneItem(item));
  }

  private _cloneItem(item: INavigationItem): INavigationItem {
    return {
      ...item,
      matchUrls: item.matchUrls ? [...item.matchUrls] : undefined,
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