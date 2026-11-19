import { SPHttpClient } from '@microsoft/sp-http';
import { SpRest } from '../../../shared/spRest';
import { PermissionKind, SUMMARY_LIST, hasPermission } from '../../../shared/schema';

export type SiteAccess = 'owner' | 'not-owner' | 'no-access' | 'error';

export interface ITrackedSite {
  siteId: string;
  siteUrl: string;
  name: string;
}

const OWNED_CACHE_KEY: string = 'hitcounter.ownedSites';
/** "Caches the result briefly" (scope 8.1): long enough to avoid re-checking on every visit. */
const OWNED_CACHE_MINUTES: number = 30;

export interface ISiteOwnership {
  siteUrl: string;
  access: SiteAccess;
  detail: string;
}

/**
 * Works out which tracked sites the signed-in user owns (scope P2d / F8):
 * site owners see only their own sites' totals. "Owner" = Manage Permissions
 * and Manage Web on the site, the same test Set up uses. A site the user
 * can't open at all must come back as no-access, never as an error.
 */
export class SiteOwnership {
  private readonly _client: SPHttpClient;
  private readonly _central: SpRest;
  private readonly _cache: { [url: string]: ISiteOwnership } = {};

  constructor(client: SPHttpClient, central: SpRest) {
    this._client = client;
    this._central = central;
  }

  /**
   * Sites with page views this year or last year, from their yearly rows in
   * HitCounter_Summary. One query on the indexed PeriodKey column, so it
   * stays under the list view threshold however large the list grows.
   */
  public async trackedSiteList(now: Date = new Date()): Promise<ITrackedSite[]> {
    const year: number = now.getUTCFullYear();
    const filter: string = `PeriodKey eq '${year}' or PeriodKey eq '${year - 1}'`;
    const rows: { value: { Scope?: string; SiteId?: string; SiteUrl?: string; SiteName?: string }[] } = await this._central.get(
      `/_api/web/lists/getbytitle('${SpRest.quote(SUMMARY_LIST)}')/items?$select=Scope,SiteId,SiteUrl,SiteName` +
      `&$filter=${encodeURIComponent(filter)}&$top=5000`);
    const seen: { [siteId: string]: boolean } = {};
    const sites: ITrackedSite[] = [];
    for (const row of rows.value) {
      const url: string = (row.SiteUrl || '').trim().replace(/\/+$/, '');
      if (row.Scope === 'Site' && row.SiteId && url && !seen[row.SiteId]) {
        seen[row.SiteId] = true;
        sites.push({ siteId: row.SiteId, siteUrl: url, name: row.SiteName || url });
      }
    }
    return sites;
  }

  /** Tracked site addresses plus the central site itself (for "Which sites do I own?"). */
  public async trackedSites(): Promise<string[]> {
    const seen: { [url: string]: boolean } = {};
    const sites: string[] = [];
    const addSite = (url: string): void => {
      if (url && !seen[url.toLowerCase()]) {
        seen[url.toLowerCase()] = true;
        sites.push(url);
      }
    };
    addSite(this._central.webUrl);
    (await this.trackedSiteList()).forEach((s: ITrackedSite) => addSite(s.siteUrl));
    return sites;
  }

  /**
   * The tracked sites this user owns (scope 8.1, site owner step 2). Checks
   * six sites at a time and keeps the answer for OWNED_CACHE_MINUTES in this
   * tab, so it stays correct when owners change without re-checking on every
   * visit. A display filter, not a security boundary (scope 9.4).
   */
  public async ownedSites(userKey: string, onProgress?: (done: number, total: number) => void): Promise<ITrackedSite[]> {
    const sites: ITrackedSite[] = await this.trackedSiteList();
    const cached: { [siteId: string]: boolean } = SiteOwnership._readCache(userKey);
    const results: { [siteId: string]: boolean } = {};
    const toCheck: ITrackedSite[] = sites.filter((s: ITrackedSite) => {
      if (Object.prototype.hasOwnProperty.call(cached, s.siteId)) {
        results[s.siteId] = cached[s.siteId];
        return false;
      }
      return true;
    });
    let done: number = 0;
    let next: number = 0;
    const lane = async (): Promise<void> => {
      while (next < toCheck.length) {
        const site: ITrackedSite = toCheck[next++];
        results[site.siteId] = (await this.check(site.siteUrl)).access === 'owner';
        done++;
        if (onProgress) {
          onProgress(done, toCheck.length);
        }
      }
    };
    const lanes: Promise<void>[] = [];
    for (let i = 0; i < Math.min(6, toCheck.length); i++) {
      lanes.push(lane());
    }
    await Promise.all(lanes);
    SiteOwnership._writeCache(userKey, results);
    return sites.filter((s: ITrackedSite) => results[s.siteId]);
  }

  private static _readCache(userKey: string): { [siteId: string]: boolean } {
    try {
      const raw: string | null = window.sessionStorage.getItem(OWNED_CACHE_KEY);
      const parsed: { user?: string; at?: number; results?: { [siteId: string]: boolean } } = raw ? JSON.parse(raw) : {};
      if (parsed.user === userKey && parsed.at && new Date().getTime() - parsed.at < OWNED_CACHE_MINUTES * 60000 && parsed.results) {
        return parsed.results;
      }
    } catch {
      // No cache: check again.
    }
    return {};
  }

  private static _writeCache(userKey: string, results: { [siteId: string]: boolean }): void {
    try {
      window.sessionStorage.setItem(OWNED_CACHE_KEY, JSON.stringify({ user: userKey, at: new Date().getTime(), results }));
    } catch {
      // Storage blocked: checks simply repeat next time.
    }
  }

  /** One permission check per site, cached for the life of the page. */
  public async check(siteUrl: string): Promise<ISiteOwnership> {
    const key: string = siteUrl.toLowerCase();
    if (this._cache[key]) {
      return this._cache[key];
    }
    const rest: SpRest = new SpRest(this._client, siteUrl);
    let result: ISiteOwnership;
    try {
      const mask: { Low: string; High: string } = await rest.get('/_api/web/effectiveBasePermissions');
      const owner: boolean = hasPermission(mask, PermissionKind.ManagePermissions) && hasPermission(mask, PermissionKind.ManageWeb);
      const canOpen: boolean = hasPermission(mask, PermissionKind.ViewPages);
      result = {
        siteUrl,
        access: owner ? 'owner' : canOpen ? 'not-owner' : 'no-access',
        detail: owner ? 'Owner' : canOpen ? 'Can open the site, not an owner' : 'No access to the site'
      };
    } catch (error) {
      const status: number | undefined = (error as { status?: number }).status;
      if (status === 401 || status === 403 || status === 404) {
        result = { siteUrl, access: 'no-access', detail: `No access to the site (${status})` };
      } else {
        result = { siteUrl, access: 'error', detail: (error as Error).message || String(error) };
      }
    }
    this._cache[key] = result;
    return result;
  }
}
