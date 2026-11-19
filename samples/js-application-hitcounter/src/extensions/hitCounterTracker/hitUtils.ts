/**
 * Pure helper functions for the HitCounter tracker.
 *
 * Kept free of SPFx and browser globals so they can be unit tested in Node.
 * Written for the SPFx 1.21 "es5" lib: no startsWith/endsWith/includes,
 * padStart, Math.imul or Array.findIndex.
 */

/** Minimum gap before the same page can be counted again (scope section 7). */
export const DEDUPE_WINDOW_MS: number = 30 * 1000;

/** Prefix of the 12 reusable monthly lists (scope section 6.1). */
export const LIST_TITLE_PREFIX: string = 'hitcounter_';

/** One recorded page view. P1 only logs it; P3 writes it to the monthly list. */
export interface IHitRecord {
  /** Title of the monthly list the row belongs in, e.g. hitcounter_11. */
  listTitle: string;
  siteId: string;
  webId: string;
  siteUrl: string;
  pageKey: string;
  pageUrl: string;
  pageTitle: string;
  /** Client UTC date, yyyyMMdd. */
  hitDate: string;
  /** Client UTC timestamp, ISO 8601. The server's Created time is authoritative. */
  clientTimestampUtc: string;
}

function pad2(value: number): string {
  return value < 10 ? '0' + value : String(value);
}

function stringEndsWith(value: string, suffix: string): boolean {
  return value.length >= suffix.length &&
    value.substring(value.length - suffix.length) === suffix;
}

function stringStartsWith(value: string, prefix: string): boolean {
  return value.substring(0, prefix.length) === prefix;
}

/** Removes trailing slashes, keeping a lone "/". */
function trimTrailingSlash(path: string): string {
  let result: string = path;
  while (result.length > 1 && stringEndsWith(result, '/')) {
    result = result.substring(0, result.length - 1);
  }
  return result;
}

/** UTC date key, yyyyMMdd. */
export function toUtcDateKey(date: Date): string {
  return String(date.getUTCFullYear()) + pad2(date.getUTCMonth() + 1) + pad2(date.getUTCDate());
}

/** Title of the monthly list for a date, using the UTC month: hitcounter_01 to hitcounter_12. */
export function monthListTitle(date: Date): string {
  return LIST_TITLE_PREFIX + pad2(date.getUTCMonth() + 1);
}

/**
 * Normalises a page address for counting: origin + path, lower case,
 * no query string, no fragment, no trailing slash.
 */
export function normalisePageUrl(origin: string, pathname: string): string {
  return (trimTrailingSlash(origin) + trimTrailingSlash(pathname || '/')).toLowerCase();
}

/**
 * Decides whether a location is a modern site page the tracker should count.
 *
 * Counted: pages in the web's Site Pages library (.aspx) and the web's root
 * address (which serves the home page).
 * Not counted: edit mode, list and library views, _layouts pages, anything
 * outside the current web.
 *
 * @param pathname    window.location.pathname
 * @param search      window.location.search
 * @param webServerRelativeUrl  pageContext.web.serverRelativeUrl, e.g. "/sites/hr" or "/"
 */
export function isTrackablePage(pathname: string, search: string, webServerRelativeUrl: string): boolean {
  const path: string = trimTrailingSlash((pathname || '/').toLowerCase());
  const webPath: string = trimTrailingSlash((webServerRelativeUrl || '/').toLowerCase());

  if (isEditMode(search)) {
    return false;
  }
  if (path.indexOf('/_layouts/') !== -1 || path.indexOf('/_vti_bin/') !== -1) {
    return false;
  }

  // Web root, which serves the welcome page.
  if (path === webPath) {
    return true;
  }

  const sitePagesPrefix: string = (webPath === '/' ? '' : webPath) + '/sitepages/';
  if (!stringStartsWith(path, sitePagesPrefix)) {
    return false;
  }
  // Library views of Site Pages itself (SitePages/Forms/AllPages.aspx) are not pages.
  if (stringStartsWith(path, sitePagesPrefix + 'forms/')) {
    return false;
  }
  return stringEndsWith(path, '.aspx');
}

/** True when the path is the web's root address, which serves the web's home page. */
export function isWebRoot(pathname: string, webServerRelativeUrl: string): boolean {
  return trimTrailingSlash((pathname || '/').toLowerCase()) === trimTrailingSlash((webServerRelativeUrl || '/').toLowerCase());
}

/**
 * The path to count a view of the web's root address under: its home page,
 * e.g. /sites/hr + "SitePages/Home.aspx" gives /sites/hr/SitePages/Home.aspx,
 * so the home page counts as one page whichever address was used. Keeps the
 * root path when the home page isn't a Site Pages .aspx page (or is unknown).
 */
export function homePagePath(webServerRelativeUrl: string, welcomePage: string | undefined): string {
  const webPath: string = trimTrailingSlash(webServerRelativeUrl || '/');
  const page: string = (welcomePage || '').replace(/^\/+/, '');
  if (!/^sitepages\/[^?#]+\.aspx$/i.test(page)) {
    return webPath || '/';
  }
  return (webPath === '/' || webPath === '' ? '' : webPath) + '/' + page;
}

/** True when the query string puts the page in edit mode (?Mode=Edit). */
export function isEditMode(search: string): boolean {
  const query: string = (search || '').toLowerCase();
  return /[?&]mode=edit(&|$)/.test(query);
}

/** True when the current web is the configured central HitCounter site, which is not tracked. */
export function isSameSite(webAbsoluteUrl: string, centralSiteUrl: string | undefined): boolean {
  if (!centralSiteUrl) {
    return false;
  }
  return trimTrailingSlash(webAbsoluteUrl.toLowerCase()) === trimTrailingSlash(centralSiteUrl.toLowerCase());
}

/** Name of the app catalog property (storage entity) that points every tracker at the central site. */
export const CENTRAL_SITE_PROPERTY: string = 'HitCounterCentralSiteUrl';

/** How long the tracker reuses a central site it read (per browser tab). */
export const CENTRAL_CACHE_MS: number = 30 * 60 * 1000;
/** How long it reuses "no central site set", so a newly set one is picked up soon. */
export const CENTRAL_EMPTY_CACHE_MS: number = 5 * 60 * 1000;

/**
 * The cached tenant property value if still fresh, otherwise undefined
 * (read it again). Only successful reads are ever cached, so a one-off
 * failed request can't leave a tab saving to the wrong site. Entries from
 * older builds (a bare string) are treated as stale.
 */
export function cachedCentralProperty(raw: string | undefined, now: number): string | undefined {
  let entry: { v?: unknown; at?: unknown };
  try {
    entry = JSON.parse(raw || '');
  } catch {
    return undefined;
  }
  if (!entry || typeof entry !== 'object' || typeof entry.v !== 'string' || typeof entry.at !== 'number') {
    return undefined;
  }
  const age: number = now - entry.at;
  const limit: number = entry.v ? CENTRAL_CACHE_MS : CENTRAL_EMPTY_CACHE_MS;
  return age >= 0 && age < limit ? entry.v : undefined;
}

/** The cache entry for a successful read ('' = no central site set). */
export function centralCacheEntry(value: string, now: number): string {
  return JSON.stringify({ v: value, at: now });
}

/** Where hits go, and whether pages on the central site itself are counted. */
export interface ICentralConfig {
  centralSiteUrl: string;
  trackCentralSite: boolean;
  source: 'extension' | 'tenant-property' | 'this-site';
}

/**
 * Parses the app catalog property. Accepts a plain URL, or JSON
 * {"centralSiteUrl": "...", "trackCentralSite": false}. Returns undefined when
 * the value is empty or not an https URL.
 */
export function parseCentralProperty(value: string | undefined): { centralSiteUrl: string; trackCentralSite: boolean } | undefined {
  const raw: string = (value || '').trim();
  if (!raw) {
    return undefined;
  }
  let url: string = raw;
  let track: boolean = true;
  if (raw.charAt(0) === '{') {
    try {
      const parsed: { centralSiteUrl?: unknown; trackCentralSite?: unknown } = JSON.parse(raw);
      url = typeof parsed.centralSiteUrl === 'string' ? parsed.centralSiteUrl.trim() : '';
      if (parsed.trackCentralSite === false) {
        track = false;
      }
    } catch {
      return undefined;
    }
  }
  if (!/^https:\/\/[^\s/]+\/\S*$/i.test(url + '/')) {
    return undefined;
  }
  return { centralSiteUrl: trimTrailingSlash(url), trackCentralSite: track };
}

/**
 * Picks the central site: the extension's own property first (set per
 * Tenant Wide Extensions entry), then the app catalog property, then this
 * site (single-site mode).
 */
export function resolveCentralConfig(
  extensionCentralUrl: string | undefined,
  extensionTrackCentral: boolean | undefined,
  tenantPropertyValue: string | undefined,
  thisSiteUrl: string
): ICentralConfig {
  const own: string = (extensionCentralUrl || '').trim();
  if (own) {
    return { centralSiteUrl: trimTrailingSlash(own), trackCentralSite: extensionTrackCentral !== false, source: 'extension' };
  }
  const fromTenant: { centralSiteUrl: string; trackCentralSite: boolean } | undefined = parseCentralProperty(tenantPropertyValue);
  if (fromTenant) {
    return { centralSiteUrl: fromTenant.centralSiteUrl, trackCentralSite: fromTenant.trackCentralSite, source: 'tenant-property' };
  }
  return { centralSiteUrl: trimTrailingSlash(thisSiteUrl), trackCentralSite: true, source: 'this-site' };
}

/** True when a hit on this site should be saved under the config. */
export function shouldTrackSite(thisSiteUrl: string, config: ICentralConfig): boolean {
  return config.trackCentralSite || !isSameSite(thisSiteUrl, config.centralSiteUrl);
}

/**
 * 32-bit FNV-1a, with the multiply written as shifts so it needs no Math.imul.
 */
function fnv1a32(value: string, offsetBasis: number): number {
  let hash: number = offsetBasis >>> 0;
  for (let i: number = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
  }
  return hash >>> 0;
}

function toHex8(value: number): string {
  const hex: string = (value >>> 0).toString(16);
  return '00000000'.substring(hex.length) + hex;
}

/**
 * Stable 64-bit page key (16 hex characters) from the normalised page URL.
 * Not a security hash: it only gives the page a short, fixed-length identifier.
 */
export function pageKeyFor(normalisedPageUrl: string): string {
  return toHex8(fnv1a32(normalisedPageUrl, 0x811c9dc5)) + toHex8(fnv1a32(normalisedPageUrl, 0x01000193));
}

/** Longest wait for the browser title to catch up after in-page navigation. */
export const TITLE_WAIT_MS: number = 5000;

/**
 * The last page the tracker knows about: the page at first load, each recorded
 * page, and each skipped page. title is undefined when it isn't known for sure
 * (skipped pages, where the title may still have been stale).
 */
export interface IKnownTitle {
  path: string;
  title: string | undefined;
}

/**
 * Decides whether document.title can be trusted for the page at currentPath.
 *
 * After in-page (SPA) navigation SharePoint changes the address first and the
 * browser title later, sometimes seconds later on a slow connection.
 *
 * @param known         last known page (see IKnownTitle), or undefined
 * @param baselineTitle document.title when the navigation event fired, or
 *                      undefined for the first load (no navigation yet)
 * @param currentPath   lower-case window.location.pathname now
 * @param currentTitle  document.title now
 * @returns 'use' when document.title can be read now, 'wait' otherwise.
 *          The caller stops waiting after TITLE_WAIT_MS and uses the current
 *          title, which covers two pages sharing the same title.
 */
export function titleReadiness(
  known: IKnownTitle | undefined,
  baselineTitle: string | undefined,
  currentPath: string,
  currentTitle: string
): 'use' | 'wait' {
  // Same page as the known one, whose title is known: nothing has changed.
  if (known && known.path === currentPath && known.title !== undefined) {
    return 'use';
  }
  // First load: the server rendered the correct title.
  if (baselineTitle === undefined) {
    return 'use';
  }
  // The title has changed since the navigation began.
  if (currentTitle && currentTitle !== baselineTitle) {
    return 'use';
  }
  // The title had already changed before the navigation event fired.
  if (known && known.title !== undefined && baselineTitle !== known.title) {
    return 'use';
  }
  return 'wait';
}

/** Truncates a page title to the 255-character limit of a single-line column. */
export function truncateTitle(title: string): string {
  const clean: string = (title || '').replace(/\s+/g, ' ').trim();
  return clean.length > 255 ? clean.substring(0, 255) : clean;
}

/**
 * Remembers recently counted pages so repeated navigation events for the same
 * page within the dedupe window count once.
 */
export class HitDeduper {
  private _lastSeen: { [pageKey: string]: number } = {};
  private readonly _windowMs: number;

  constructor(windowMs: number = DEDUPE_WINDOW_MS) {
    this._windowMs = windowMs;
  }

  /** Returns true, and remembers the page, if it should be counted now. */
  public shouldRecord(pageKey: string, nowMs: number): boolean {
    const last: number | undefined = this._lastSeen[pageKey];
    if (last !== undefined && nowMs - last < this._windowMs) {
      return false;
    }
    this._lastSeen[pageKey] = nowMs;
    this._prune(nowMs);
    return true;
  }

  private _prune(nowMs: number): void {
    for (const key in this._lastSeen) {
      if (Object.prototype.hasOwnProperty.call(this._lastSeen, key) &&
          nowMs - this._lastSeen[key] >= this._windowMs) {
        delete this._lastSeen[key];
      }
    }
  }
}
