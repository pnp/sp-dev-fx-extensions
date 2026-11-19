import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { DigestCache, IDigestCache, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { isThrottled, retryDelayMs } from '../../shared/throttle';
import {
  ADMIN_CHECK_KEY, BACKGROUND_START_DELAY_MS, IAdminCheck, LAST_UPDATE_KEY,
  cachedAdmin, isAdminMask, readLocal, updateDue, writeLocal
} from '../../shared/backgroundGate';
// Type only: the module itself is loaded on demand, for central admins.
import type { IBackgroundResult } from './backgroundJob';

import {
  CENTRAL_SITE_PROPERTY,
  HitDeduper,
  cachedCentralProperty,
  centralCacheEntry,
  homePagePath,
  isWebRoot,
  ICentralConfig,
  IHitRecord,
  IKnownTitle,
  isTrackablePage,
  resolveCentralConfig,
  shouldTrackSite,
  monthListTitle,
  normalisePageUrl,
  pageKeyFor,
  TITLE_WAIT_MS,
  titleReadiness,
  toUtcDateKey,
  truncateTitle
} from './hitUtils';

/** True when this code runs in the main browser window, not inside a frame. */
function isTopWindow(): boolean {
  try {
    return window.self === window.top;
  } catch {
    // Reading window.top can throw when the parent is on another origin: that is a frame.
    return false;
  }
}

/**
 * Per-tab cache of the app catalog property, so it isn't read on every page.
 * Holds only successful reads, with a time limit (see cachedCentralProperty).
 */
const SESSION_KEY: string = 'hitcounter.centralProperty';

function readSessionValue(): string | undefined {
  try {
    const raw: string | null = window.sessionStorage.getItem(SESSION_KEY);
    return cachedCentralProperty(raw === null ? undefined : raw, new Date().getTime());
  } catch {
    return undefined;
  }
}

function clearSessionValue(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage blocked: nothing was cached.
  }
}

function writeSessionValue(value: string): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, centralCacheEntry(value, new Date().getTime()));
  } catch {
    // Storage blocked: the property is simply read again next page load.
  }
}

const LOG_SOURCE: string = 'HitCounterTracker';
const CONSOLE_PREFIX: string = '[HitCounter]';

/** Waits for navigation events to settle, since SPFx can raise several per navigation. */
const SETTLE_DELAY_MS: number = 300;

/** How often to check whether the browser title has caught up after SPA navigation. */
const TITLE_POLL_MS: number = 250;

/** Wait before the single retry of a failed write. */
const RETRY_DELAY_MS: number = 2000;
/** Saving a page view is tried at most this many times. */
const MAX_ATTEMPTS: number = 3;
/** Window property claimed by the first tracker copy on a page. */
const ACTIVE_TRACKER_KEY: string = '__hitCounterTrackerActive';
/** Per-tab cache of each web's home page (RootFolder.WelcomePage), keyed by web ID. */
const HOME_PAGE_KEY_PREFIX: string = 'hitcounter.homePage|';
/** After "list not found" (404), page views aren't saved for this long, then saving is tried again. */
const WRITE_PAUSE_AFTER_404_MS: number = 2 * 60 * 1000;
/** Longest throttling wait for one page view's retry. */
const TRACKER_MAX_WAIT_MS: number = 30000;

/**
 * Properties set in ClientSideComponentProperties (elements.xml, the Tenant
 * Wide Extensions list, or serve.json when debugging).
 */
export interface IHitCounterTrackerApplicationCustomizerProperties {
  /**
   * Absolute URL of the central HitCounter site. When empty, the app catalog
   * property HitCounterCentralSiteUrl is used, then this site (single-site mode).
   */
  centralSiteUrl?: string;
  /** With centralSiteUrl: whether pages on the central site itself are counted. Default true. */
  trackCentralSite?: boolean;
  /** Logs every decision to the console, including skipped pages. Default false. */
  debug?: boolean;
}

/**
 * Tracker: builds a hit for every counted page view, including SPA
 * navigation, and adds it as a row to this month's list on the central site
 * (or this site in single-site mode). Nothing here blocks page rendering.
 */
export default class HitCounterTrackerApplicationCustomizer
  extends BaseApplicationCustomizer<IHitCounterTrackerApplicationCustomizerProperties> {

  private _deduper: HitDeduper = new HitDeduper();
  private _settleTimer: number | undefined;
  private _hitCount: number = 0;
  /** Last page the tracker knows about, so a stale title after SPA navigation can be detected. */
  private _knownTitle: IKnownTitle | undefined;
  /** True when the pending evaluation was triggered by a navigation event. */
  private _pendingFromNavigation: boolean = false;
  /** document.title when that navigation event fired (before the page updated it). */
  private _pendingBaselineTitle: string | undefined;
  /** Set when the central site refuses a write (401/403), so no more are attempted this page session. */
  private _writesDisabled: boolean = false;
  /**
   * After a 404 (list not there: Set up not finished, an archive recreating the
   * list, or the central site moved) writes pause until this time, then the
   * central site is looked up again. ms since 1970; 0 = not paused.
   */
  private _writesPausedUntil: number = 0;
  private _config: Promise<ICentralConfig> | undefined;
  private _backgroundTimer: number | undefined;
  /** The background summary job while it runs, so a closing page can free its lock. */
  private _backgroundJob: { releaseOnUnload(): void } | undefined;
  private readonly _onPageHide: () => void = (): void => {
    if (this._backgroundJob) {
      this._backgroundJob.releaseOnUnload();
    }
  };

  public onInit(): Promise<void> {
    // The tracker can be registered twice on one page: installed on the site
    // AND added tenant-wide. Each copy has its own deduper, so the first copy
    // claims the page and any later copy stands down (no double counting).
    const page: { [key: string]: unknown } = window as unknown as { [key: string]: unknown };
    if (page[ACTIVE_TRACKER_KEY] && page[ACTIVE_TRACKER_KEY] !== this) {
      this._debug('Another HitCounter tracker is already running on this page; this copy stays idle.');
      return Promise.resolve();
    }
    page[ACTIVE_TRACKER_KEY] = this;

    Log.info(LOG_SOURCE, 'Initialised');
    this._debug('Initialised. Properties:', this.properties);

    // At first load the server has rendered the correct title for this page.
    this._knownTitle = {
      path: (window.location.pathname || '/').toLowerCase(),
      title: document.title
    };

    // Raised on SPA navigation. In practice it is also raised after the first
    // load, so the deduper absorbs any duplicate for the same page.
    this.context.application.navigatedEvent.add(this, this._onNavigated);

    // Cover the first page load in case navigatedEvent is not raised for it.
    this._schedule(false);

    // Central admins only: bring stored totals up to date in the background,
    // well after the page has loaded (scope 13).
    if (isTopWindow()) {
      this._backgroundTimer = window.setTimeout(() => {
        this._backgroundTimer = undefined;
        this._backgroundUpdate().catch(() => { /* handled inside */ });
      }, BACKGROUND_START_DELAY_MS);
    }

    return Promise.resolve();
  }

  protected onDispose(): void {
    const page: { [key: string]: unknown } = window as unknown as { [key: string]: unknown };
    if (page[ACTIVE_TRACKER_KEY] !== this) {
      return; // This copy stood down in onInit and never started.
    }
    delete page[ACTIVE_TRACKER_KEY];
    this.context.application.navigatedEvent.remove(this, this._onNavigated);
    if (this._settleTimer !== undefined) {
      window.clearTimeout(this._settleTimer);
    }
    if (this._backgroundTimer !== undefined) {
      window.clearTimeout(this._backgroundTimer);
    }
    this._onPageHide();
    window.removeEventListener('pagehide', this._onPageHide);
    this._debug('Disposed after recording', this._hitCount, 'hit(s)');
  }

  // ------------------------------------------------- background updates

  /**
   * Runs the summary job for a central admin, at most every 15 minutes per
   * browser (scope 13). Everyone else stops at a cached "not an admin" answer:
   * one small request a day. The job code is downloaded only for admins.
   * Never throws.
   */
  private async _backgroundUpdate(): Promise<void> {
    try {
      if (document.visibilityState === 'hidden') {
        return; // Opened in a background tab: the next page view tries again.
      }
      // Without working localStorage the 15-minute and once-a-day limits can't
      // be kept, so do nothing rather than check on every page.
      writeLocal('hitcounter.storageTest', '1');
      if (readLocal('hitcounter.storageTest') !== '1') {
        return;
      }
      if (!updateDue(readLocal(LAST_UPDATE_KEY), new Date().getTime())) {
        this._debug('Background update: last one was under 15 minutes ago');
        return;
      }
      const config: ICentralConfig = await this._getConfig(this.context.pageContext.web.absoluteUrl);
      const central: string = config.centralSiteUrl;
      const user: string = this.context.pageContext.user.loginName || '';
      let isAdmin: boolean | undefined = cachedAdmin(readLocal(ADMIN_CHECK_KEY), central, user, new Date().getTime());
      if (isAdmin === undefined) {
        isAdmin = await this._checkAdmin(central);
        if (isAdmin === undefined) {
          return; // Network trouble: ask again on a later page.
        }
        const entry: IAdminCheck = { centralSiteUrl: central, user, isAdmin, checkedAt: new Date().getTime() };
        writeLocal(ADMIN_CHECK_KEY, JSON.stringify(entry));
      }
      if (!isAdmin) {
        return;
      }
      // Another tab may have started one meanwhile; then claim the slot for this browser.
      if (!updateDue(readLocal(LAST_UPDATE_KEY), new Date().getTime())) {
        return;
      }
      writeLocal(LAST_UPDATE_KEY, String(new Date().getTime()));
      this._debug('Background update: starting on', central);
      const background: typeof import('./backgroundJob') = await import(
        /* webpackChunkName: 'hitcounter-background' */ './backgroundJob');
      const digests: IDigestCache = this.context.serviceScope.consume(DigestCache.serviceKey);
      window.addEventListener('pagehide', this._onPageHide);
      const outcome: IBackgroundResult = await background.runBackgroundUpdate(this.context.spHttpClient, central,
        this.context.pageContext.user.displayName, () => digests.fetchDigest(central),
        (job: { releaseOnUnload(): void } | undefined) => { this._backgroundJob = job; });
      window.removeEventListener('pagehide', this._onPageHide);
      this._debug('Background update:', outcome.outcome, outcome.result || '');
    } catch (error) {
      window.removeEventListener('pagehide', this._onPageHide);
      this._debug('Background update failed', error);
    }
  }

  /** True/false from the central site's permissions; undefined if it couldn't be read. */
  private async _checkAdmin(centralSiteUrl: string): Promise<boolean | undefined> {
    try {
      const response: SPHttpClientResponse = await this.context.spHttpClient.get(
        `${centralSiteUrl}/_api/web/effectiveBasePermissions`,
        SPHttpClient.configurations.v1,
        { headers: { 'Accept': 'application/json;odata=nometadata', 'odata-version': '3.0' } });
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        return false; // No access to the central site: not an admin.
      }
      return response.ok ? isAdminMask(await response.json()) : undefined;
    } catch {
      return undefined;
    }
  }

  private _onNavigated(): void {
    this._schedule(true);
  }

  /** Waits for navigation events to settle, then evaluates the page once. */
  private _schedule(fromNavigation: boolean): void {
    // Keep the title from the FIRST navigation event of a burst: later events
    // may arrive after the page has already updated it.
    if (fromNavigation && !this._pendingFromNavigation) {
      this._pendingFromNavigation = true;
      this._pendingBaselineTitle = document.title;
    }
    if (this._settleTimer !== undefined) {
      window.clearTimeout(this._settleTimer);
    }
    this._settleTimer = window.setTimeout(() => {
      const baseline: string | undefined = this._pendingFromNavigation ? this._pendingBaselineTitle : undefined;
      this._settleTimer = undefined;
      this._pendingFromNavigation = false;
      this._pendingBaselineTitle = undefined;
      this._evaluate(baseline);
    }, SETTLE_DELAY_MS);
  }

  /**
   * Decides whether the current location counts, then records it. Never throws.
   * @param baselineTitle document.title when the navigation began; undefined for first load.
   */
  private _evaluate(baselineTitle: string | undefined): void {
    try {
      const location: Location = window.location;
      const web = this.context.pageContext.web;
      const path: string = (location.pathname || '/').toLowerCase();

      // Only count views in the main browser window. SharePoint also loads
      // pages inside frames (for example the Copilot side panel, chat.aspx),
      // where the tracker would otherwise count a second, invisible view.
      if (!isTopWindow()) {
        this._debug('Skipped: page is inside a frame', location.pathname);
        return;
      }

      // Guard against a stale page context after SPA navigation to another web.
      const webPath: string = (web.serverRelativeUrl || '/').toLowerCase();
      if (webPath !== '/' && path !== webPath && path.indexOf(webPath + '/') !== 0) {
        this._debug('Skipped: page context web', web.serverRelativeUrl, 'does not match', location.pathname);
        this._knownTitle = { path, title: undefined };
        return;
      }

      if (!isTrackablePage(location.pathname, location.search, web.serverRelativeUrl)) {
        this._debug('Skipped: not a counted page', location.pathname + location.search);
        this._knownTitle = { path, title: undefined };
        return;
      }

      // The address and time are fixed now, so a quick onward navigation still
      // counts this page. Only the title may need to wait for the page to set it.
      const now: Date = new Date();
      const origin: string = location.origin;
      const siteId: string = this.context.pageContext.site.id.toString();
      const webId: string = web.id.toString();
      const siteUrl: string = web.absoluteUrl;
      // The site's root address shows its home page: count it under the home
      // page's own address, so the home page is one page however it's opened.
      this._countedPath(location.pathname, web.serverRelativeUrl, siteUrl, webId).then((countedPath: string) => {
        const pageUrl: string = normalisePageUrl(origin, countedPath);
        const pageKey: string = pageKeyFor(pageUrl);
        if (!this._deduper.shouldRecord(pageKey, now.getTime())) {
          this._debug('Skipped: same page counted within the last 30 seconds', pageUrl);
          this._knownTitle = { path, title: undefined };
          return;
        }
        this._waitForTitle(path, baselineTitle, (pageTitle: string) => {
          this._record({
            listTitle: monthListTitle(now),
            siteId,
            webId,
            siteUrl,
            pageKey,
            pageUrl,
            pageTitle,
            hitDate: toUtcDateKey(now),
            clientTimestampUtc: now.toISOString()
          });
        });
      }).catch((error: unknown) => Log.warn(LOG_SOURCE, `Hit evaluation failed: ${error}`));
    } catch (error) {
      // Tracking must never affect the page.
      Log.warn(LOG_SOURCE, `Hit evaluation failed: ${error}`);
    }
  }

  /**
   * The path a view is counted under: the visited path, except that a web's
   * root address is replaced by its home page (RootFolder.WelcomePage). The
   * home page is looked up once per web and kept for the tab; if the lookup
   * fails, the root address is used for that view and the lookup is retried
   * on the next one. Never rejects.
   */
  private _countedPath(pathname: string, webServerRelativeUrl: string, webAbsoluteUrl: string, webId: string): Promise<string> {
    if (!isWebRoot(pathname, webServerRelativeUrl)) {
      return Promise.resolve(pathname);
    }
    const key: string = HOME_PAGE_KEY_PREFIX + webId;
    let cached: string | undefined;
    try {
      const value: string | null = window.sessionStorage.getItem(key);
      cached = value === null ? undefined : value;
    } catch {
      cached = undefined;
    }
    if (cached !== undefined) {
      return Promise.resolve(homePagePath(webServerRelativeUrl, cached));
    }
    return this.context.spHttpClient.get(`${webAbsoluteUrl}/_api/web/RootFolder?$select=WelcomePage`, SPHttpClient.configurations.v1,
      { headers: { 'Accept': 'application/json;odata=nometadata', 'odata-version': '3.0' } })
      .then((response: SPHttpClientResponse) => response.ok ? response.json() : undefined)
      .then((folder: { WelcomePage?: string } | undefined) => {
        if (!folder) {
          return pathname;
        }
        const welcome: string = folder.WelcomePage || '';
        try {
          window.sessionStorage.setItem(key, welcome);
        } catch {
          // Storage blocked: looked up again next time.
        }
        this._debug('Home page of', webAbsoluteUrl, 'is', welcome || '(none)');
        return homePagePath(webServerRelativeUrl, welcome);
      })
      .catch(() => pathname);
  }

  /**
   * Calls done with the page's title once document.title can be trusted.
   * After SPA navigation it waits for the title to change from the previous
   * page's, up to TITLE_WAIT_MS. Gives an empty title if the user leaves first,
   * or if the title never changes (e.g. two pages with the same title, where
   * the current title is then correct anyway).
   */
  private _waitForTitle(path: string, baselineTitle: string | undefined, done: (title: string) => void): void {
    const started: number = new Date().getTime();
    const check = (): void => {
      try {
        const currentPath: string = (window.location.pathname || '/').toLowerCase();
        if (currentPath !== path) {
          this._debug('Title unknown: left the page before its title loaded', path);
          done('');
          return;
        }
        const currentTitle: string = document.title;
        const timedOut: boolean = new Date().getTime() - started >= TITLE_WAIT_MS;
        if (titleReadiness(this._knownTitle, baselineTitle, path, currentTitle) === 'use' || timedOut) {
          if (timedOut) {
            this._debug('Title did not change within', TITLE_WAIT_MS, 'ms; using current title', currentTitle);
          }
          this._knownTitle = { path, title: currentTitle };
          done(truncateTitle(currentTitle));
          return;
        }
        window.setTimeout(check, TITLE_POLL_MS);
      } catch (error) {
        Log.warn(LOG_SOURCE, `Title wait failed: ${error}`);
        done('');
      }
    };
    check();
  }

  /**
   * Works out where hits go, once per page session (and cached for the
   * browser session): the extension property, then the app catalog property,
   * then this site. Never rejects.
   */
  private _getConfig(thisSiteUrl: string): Promise<ICentralConfig> {
    if (!this._config) {
      this._config = this._loadConfig(thisSiteUrl);
    }
    return this._config;
  }

  private async _loadConfig(thisSiteUrl: string): Promise<ICentralConfig> {
    if ((this.properties.centralSiteUrl || '').trim()) {
      return resolveCentralConfig(this.properties.centralSiteUrl, this.properties.trackCentralSite, undefined, thisSiteUrl);
    }
    let value: string | undefined = readSessionValue();
    if (value === undefined) {
      try {
        const response: SPHttpClientResponse = await this.context.spHttpClient.get(
          `${thisSiteUrl}/_api/web/GetStorageEntity('${CENTRAL_SITE_PROPERTY}')`,
          SPHttpClient.configurations.v1,
          { headers: { 'Accept': 'application/json;odata=nometadata', 'odata-version': '3.0' } });
        if (response.ok) {
          const entity: { Value?: string } = await response.json();
          value = entity && entity.Value ? entity.Value : '';
          writeSessionValue(value); // Only a successful read is cached.
        } else {
          this._debug('Could not read the app catalog property (status ' + response.status + '); using this site for this page only');
          value = '';
        }
      } catch (error) {
        this._debug('Could not read the app catalog property; using this site for this page only', error);
        value = '';
      }
    }
    const config: ICentralConfig = resolveCentralConfig(undefined, undefined, value, thisSiteUrl);
    this._debug('Central site', config.centralSiteUrl, '(from ' + config.source + ')', 'track central site:', config.trackCentralSite);
    return config;
  }

  private _record(hit: IHitRecord): void {
    this._hitCount++;
    this._debug('Hit #' + this._hitCount, hit);
    if (this._writesDisabled) {
      return;
    }
    if (new Date().getTime() < this._writesPausedUntil) {
      this._debug('Not saved: paused after "list not found"; trying again after', new Date(this._writesPausedUntil).toLocaleTimeString());
      return;
    }
    this._getConfig(hit.siteUrl).then((config: ICentralConfig) => {
      if (!shouldTrackSite(hit.siteUrl, config)) {
        this._debug('Not saved: this is the central site and it is set not to be tracked');
        return;
      }
      return this._write(hit, config.centralSiteUrl, 1);
    }).catch(() => { /* handled inside */ });
  }

  /**
   * Adds the hit as a row in this month's list on the central site. Uses
   * JSON light (odata=nometadata), so no list item type name is needed.
   * SPHttpClient fetches the request digest for the target site itself.
   * One retry for network or server errors. No access (401/403) stops writes
   * for this page session, so a user without access isn't hammered; "list not
   * found" (404) only pauses them for a few minutes, since it is usually
   * temporary (Set up still running, a list being recreated by an archive).
   */
  private async _write(hit: IHitRecord, target: string, attempt: number): Promise<void> {
    const url: string = `${target}/_api/web/lists/getbytitle('${encodeURIComponent(hit.listTitle.replace(/'/g, "''"))}')/items`;
    let delay: number = RETRY_DELAY_MS;
    try {
      const response: SPHttpClientResponse = await this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'odata-version': '3.0'
        },
        body: JSON.stringify({
          SiteId: hit.siteId,
          SiteUrl: hit.siteUrl,
          PageKey: hit.pageKey,
          PageUrl: hit.pageUrl,
          PageTitle: hit.pageTitle,
          HitDate: hit.hitDate
        })
      });
      if (response.ok) {
        this._debug('Saved hit to', target, hit.listTitle);
        return;
      }
      const status: number = response.status;
      if (status === 404) {
        this._writesPausedUntil = new Date().getTime() + WRITE_PAUSE_AFTER_404_MS;
        // The central site may have changed: look it up again after the pause.
        this._config = undefined;
        clearSessionValue();
        this._debug('Hit not saved: list not found (404) - pausing writes for',
          WRITE_PAUSE_AFTER_404_MS / 1000, 's, then checking the central site again', await response.text());
        return;
      }
      if (status === 401 || status === 403) {
        this._writesDisabled = true;
        Log.warn(LOG_SOURCE, `Hit not saved (${status}); HitCounter writes are off for this page session.`);
        this._debug('Hit refused with status', status, '- writes disabled for this page session', await response.text());
        return;
      }
      if (isThrottled(status)) {
        // SharePoint is busy: wait as long as it asks (capped, the user may leave the page).
        delay = retryDelayMs(response.headers.get('Retry-After') || undefined, attempt, new Date().getTime(), TRACKER_MAX_WAIT_MS);
        this._debug(`Throttled (${status}); retrying in ${delay} ms`);
      }
      throw new Error(`HTTP ${status}`);
    } catch (error) {
      if (attempt < MAX_ATTEMPTS) {
        window.setTimeout(() => { this._write(hit, target, attempt + 1).catch(() => { /* handled inside */ }); }, delay);
        return;
      }
      Log.warn(LOG_SOURCE, `Hit not saved: ${error}`);
      this._debug('Hit not saved after retry', error);
    }
  }

  private _debug(...args: unknown[]): void {
    // Also on when this browser has localStorage hitcounter.debug = 1 (for checking a tenant-wide install).
    if (this.properties.debug || readLocal('hitcounter.debug') === '1') {
      console.debug(CONSOLE_PREFIX, ...args);
    }
  }
}
