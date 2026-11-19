import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import { escape } from '@microsoft/sp-lodash-subset';
import { DigestCache, IDigestCache } from '@microsoft/sp-http';

import styles from './HitCounterDashboardWebPart.module.scss';
import { SpRest } from '../../shared/spRest';
import { IHitCounterSettings, SCHEMA_VERSION, allListDefinitions, defaultSettings } from '../../shared/schema';
import { IProgress, ISetupStatus, Provisioner } from './setup/Provisioner';
import { AccessCheck, IAccessReport, ICheckResult } from './setup/AccessCheck';
import { ISiteOwnership, ITrackedSite, SiteOwnership } from './setup/SiteOwnership';
import { IJobResult, SummaryJob } from './job/SummaryJob';
import { IHistory, SummaryReader } from './job/SummaryReader';
import { LiveFeed } from './job/LiveFeed';
import { ILifecycleView, LifecycleReader } from './job/LifecycleReader';
import { Archiver } from './setup/Archiver';
import { IRetentionResult, Retention } from './setup/Retention';
import { CentralSite, ICentralSiteStatus } from './setup/CentralSite';
import { Exporter } from './job/Exporter';
import { LAST_UPDATE_KEY, writeLocal } from '../../shared/backgroundGate';
import { ExportDetail, IExportRequest, IPageRow, dayInput, exportFileName, pagesCsv, rangeProblem, totalsCsv } from '../../shared/exportCsv';
import { IActiveList, IArchiveList, IArchiveRecord, LIST_ITEM_LIMIT, STRONG_WARNING_ROWS, deleteAfter, nextUseOfMonth } from '../../shared/listLifecycle';
import {
  ICount, IDashboardModel, IPoint, ISiteInfo, ISiteRow, SITES_SHOWN, SiteSortKey,
  buildDashboard, filterSites, formatCount, relativeTime, safeHref, sortSiteRows
} from '../../shared/dashboardModel';

/** The site search box appears once there are more sites than this. */
const SEARCH_FROM: number = 5;
/** Smallest warning size accepted (small values are for testing). */
const MIN_WARNING_ROWS: number = 1000;
const MAX_RETENTION_YEARS: number = 50;
const MONTH_NAMES: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
import { VIEWS, VISITORS, columnChart, donutChart, legend, siteColour, sparkline, topPagesChart, trendChart } from './dashboard/charts';

const LIVE_REFRESH_MS: number = 60000;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IHitCounterDashboardWebPartProps {}

type ViewState =
  { kind: 'loading' } |
  { kind: 'no-access'; setUp: boolean; noOwnedSites?: boolean } |
  { kind: 'owner-checking'; done: number; total: number } |
  { kind: 'owner' } |
  { kind: 'archive-confirm'; lists: IActiveList[] } |
  { kind: 'archiving'; log: IProgress[] } |
  { kind: 'archived'; log: IProgress[]; error: string | undefined } |
  { kind: 'recycle-confirm'; archive: IArchiveList } |
  { kind: 'recycled'; message: string; error: boolean } |
  { kind: 'central-confirm'; central: ICentralSiteStatus; track: boolean } |
  { kind: 'central-saving' } |
  { kind: 'status'; status: ISetupStatus } |
  { kind: 'running'; log: IProgress[] } |
  { kind: 'finished'; log: IProgress[]; error: string | undefined } |
  { kind: 'checking'; results: ICheckResult[] } |
  { kind: 'checked'; report: IAccessReport | undefined; results: ICheckResult[]; error: string | undefined; testRows: number | undefined; note: string | undefined } |
  { kind: 'ownership'; rows: ISiteOwnership[]; running: boolean; error: string | undefined } |
  { kind: 'error'; message: string };

/**
 * HitCounter dashboard for central admins: KPI tiles, trend, monthly,
 * site-share and top-page charts with live figures (scope F8, F9, 8.1),
 * plus the Set up HitCounter screen (scope F6).
 */
export default class HitCounterDashboardWebPart extends BaseClientSideWebPart<IHitCounterDashboardWebPartProps> {

  private _view: ViewState = { kind: 'loading' };
  private _provisioner: Provisioner | undefined;
  private _accessCheck: AccessCheck | undefined;
  private _ownership: SiteOwnership | undefined;
  private _reader: SummaryReader | undefined;
  private _job: SummaryJob | undefined;
  private _isOwner: boolean = false;
  private _history: IHistory | undefined;
  private _jobRunning: boolean = false;
  private _jobMessage: string = '';
  private _jobFailed: boolean = false;
  private _historyError: string = '';
  private _lifecycleReader: LifecycleReader | undefined;
  private _lifecycle: ILifecycleView | undefined;
  private _lifecycleError: string = '';
  private _savedSettings: IHitCounterSettings | undefined;
  private _archiver: Archiver | undefined;
  private _retention: Retention | undefined;
  private _centralSite: CentralSite | undefined;
  /** The tenant property and app catalog access, read in the background for Setup and checks. */
  private _central: ICentralSiteStatus | undefined;
  private _centralError: string = '';
  /** Result of the last "Make this the central site", shown in Setup and checks. */
  private _centralNote: { text: string; error: boolean } | undefined;
  private _exporter: Exporter | undefined;
  /** CSV export form (scope N1), kept across re-renders. */
  private _export: { detail: ExportDetail; from: string; to: string; pages: boolean; busy: boolean; message: string; error: boolean } = {
    detail: 'day',
    from: dayInput(new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1))),
    to: dayInput(new Date()),
    pages: false,
    busy: false,
    message: '',
    error: false
  };
  /** Lists ticked for archiving, by list ID. */
  private _archivePick: { [listId: string]: boolean } = {};

  private _live: LiveFeed | undefined;
  private _liveState: 'off' | 'starting' | 'on' | 'failed' = 'off';
  private _liveError: string = '';
  private _livePolled: Date | undefined;
  private _timer: number | undefined;
  private _selection: string = '';
  /** Site owner view: the tracked sites this user owns (undefined for central admins). */
  private _ownedSites: ITrackedSite[] | undefined;
  private _sites: ISiteInfo[] = [];
  private _siteFilter: string = '';
  private _sort: { key: SiteSortKey; descending: boolean } = { key: 'yearViews', descending: true };
  private _showAllSites: boolean = false;
  private _dark: boolean = false;
  /** Open/closed state of <details> sections, kept across re-renders. */
  private _open: { [key: string]: boolean } = {};
  /** Chart drawers for the current render, keyed by data-chart. */
  private _charts: { [key: string]: (width: number) => string } = {};
  private _resizeTimer: number | undefined;
  /** Page closed or refreshed mid-update: free the lock so the next load needn't wait. */
  private readonly _onPageHide: () => void = (): void => {
    if (this._job) {
      this._job.releaseOnUnload();
    }
  };
  private readonly _onResize: () => void = (): void => {
    window.clearTimeout(this._resizeTimer);
    this._resizeTimer = window.setTimeout(() => this._drawCharts(), 150);
  };
  private readonly _onVisible: () => void = (): void => {
    if (document.visibilityState === 'visible') {
      this._pollLive().catch(() => { /* handled inside */ });
    }
  };

  protected async onInit(): Promise<void> {
    await super.onInit();
    const rest: SpRest = new SpRest(this.context.spHttpClient, this.context.pageContext.web.absoluteUrl);
    rest.onThrottle = (waitMs: number): void => {
      if (this._jobRunning) {
        this._jobMessage = `SharePoint asked HitCounter to slow down; carrying on in ${Math.ceil(waitMs / 1000)}s...`;
        this._refreshStatusView();
      }
    };
    this._provisioner = new Provisioner(rest, this.context.pageContext.aadInfo.tenantId.toString());
    this._accessCheck = new AccessCheck(rest);
    this._ownership = new SiteOwnership(this.context.spHttpClient, rest);
    this._reader = new SummaryReader(rest);
    this._lifecycleReader = new LifecycleReader(rest);
    this._live = new LiveFeed(rest);
    const webUrl: string = this.context.pageContext.web.absoluteUrl;
    const digests: IDigestCache = this.context.serviceScope.consume(DigestCache.serviceKey);
    this._job = new SummaryJob(rest, this.context.spHttpClient, this.context.pageContext.user.displayName,
      () => digests.fetchDigest(webUrl));
    this._archiver = new Archiver(rest, this._provisioner, this._job, this.context.pageContext.user.displayName);
    this._retention = new Retention(rest, this.context.pageContext.user.displayName);
    this._centralSite = new CentralSite(this.context.spHttpClient, rest);
    this._exporter = new Exporter(rest);
    this._wireDelegatedEvents();
    window.addEventListener('resize', this._onResize);
    window.addEventListener('pagehide', this._onPageHide);
    // Load after the first render; never block the page.
    this._load().catch(() => { /* handled inside _load */ });
  }

  protected onDispose(): void {
    this._stopLive();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pagehide', this._onPageHide);
    this._onPageHide();
    window.clearTimeout(this._resizeTimer);
    super.onDispose();
  }

  public render(): void {
    if (!this.domElement) {
      return;
    }
    // Re-renders replace the HTML: remember which control had focus (and the
    // caret in the search box) so typing or keyboard use isn't interrupted.
    const active: Element | null = document.activeElement;
    let focusSelector: string = '';
    let caret: number | undefined;
    if (active && this.domElement.contains(active)) {
      for (const attr of ['data-site-search', 'data-site-select', 'data-sort', 'data-export', 'data-action']) {
        const value: string | null = active.getAttribute(attr);
        if (value !== null) {
          focusSelector = `[${attr}="${value}"]`;
          break;
        }
      }
      if (active.getAttribute('data-site-search') !== null) {
        caret = (active as HTMLInputElement).selectionStart || 0;
      }
    }
    this.domElement.innerHTML = `<section class="${styles.hc}" data-hc-theme="${this._dark ? 'dark' : 'light'}">${this._view.kind === 'status' || this._view.kind === 'owner'
      ? this._renderBody()
      : `<div class="${styles.narrow}">${this._renderBody()}</div>`}<div class="${styles.tip}" data-tip-box="1" aria-hidden="true"></div></section>`;
    this._wireEvents();
    this._drawCharts();
    if (focusSelector) {
      const again: HTMLElement | null = this.domElement.querySelector(focusSelector);
      if (again) {
        again.focus();
        if (caret !== undefined) {
          (again as HTMLInputElement).setSelectionRange(caret, caret);
        }
      }
    }
  }

  protected onAfterResize(): void {
    this._drawCharts();
  }

  // --------------------------------------------------------------- loading

  private async _load(): Promise<void> {
    this._setView({ kind: 'loading' });
    try {
      const provisioner: Provisioner = this._provisioner as Provisioner;
      const isOwner: boolean = await provisioner.currentUserIsOwner();
      this._isOwner = isOwner;
      if (!isOwner) {
        // Not a central admin: maybe an owner of tracked sites (scope 8.1).
        this._setView({ kind: 'owner-checking', done: 0, total: 0 });
        let owned: ITrackedSite[] | undefined;
        try {
          owned = await (this._ownership as SiteOwnership).ownedSites(this.context.pageContext.user.loginName,
            (done: number, total: number) => this._setView({ kind: 'owner-checking', done, total }));
        } catch {
          owned = undefined; // Summary unreadable: HitCounter isn't set up, or no access.
        }
        if (owned && owned.length > 0) {
          this._ownedSites = owned;
          this._setView({ kind: 'owner' });
          await this._readTotals();
          return;
        }
        let setUp: boolean = !!owned;
        if (!setUp) {
          try {
            setUp = (await provisioner.getStatus()).state !== 'not-set-up';
          } catch {
            // Normal users may not be able to read the lists; that's fine.
          }
        }
        this._setView({ kind: 'no-access', setUp, noOwnedSites: !!owned });
        return;
      }
      const status: ISetupStatus = await provisioner.getStatus();
      this._setView({ kind: 'status', status });
      if (status.state === 'ready') {
        // Show the stored totals straight away, add live figures, then bring
        // the stored totals up to date in the background (scope 8.1).
        await this._readTotals();
        this._startLive().catch(() => { /* handled inside */ });
        this._readLifecycle().catch(() => { /* handled inside */ });
        this._readCentral().catch(() => { /* handled inside */ });
        this._runJob(status.settings ? status.settings.adminContact : '').catch(() => { /* handled inside */ });
      }
    } catch (error) {
      this._setView({ kind: 'error', message: String(error && (error as Error).message ? (error as Error).message : error) });
    }
  }

  private _setView(view: ViewState): void {
    this._view = view;
    this.render();
  }

  /** Re-renders only if the status screen is showing, so background work never replaces another screen. */
  private _refreshStatusView(): void {
    if (this._view.kind === 'status' || this._view.kind === 'owner') {
      this.render();
    }
  }

  private async _readTotals(): Promise<void> {
    try {
      this._history = await (this._reader as SummaryReader).read();
      this._historyError = '';
    } catch (error) {
      // Kept apart from the job's messages so it stays visible, and the
      // dashboard still shows live figures (current periods) without history.
      this._historyError = `Couldn't read the stored totals: ${String((error as Error).message || error)}`;
      if (!this._history) {
        this._history = { rows: [], lastUpdatedUtc: '', adminContact: '' };
      }
    }
    this._refreshStatusView();
  }

  // ------------------------------------------------------- list lifecycle

  /** Saved settings, kept from the last status read so other screens (Archive) can use them. */
  private _settings(): IHitCounterSettings {
    if (this._view.kind === 'status' && this._view.status.settings) {
      this._savedSettings = this._view.status.settings;
    }
    return this._savedSettings || defaultSettings();
  }

  /** Monthly list sizes and archives (scope 8.3), for the size warning and the lists section. */
  private async _readLifecycle(): Promise<void> {
    try {
      this._lifecycle = await (this._lifecycleReader as LifecycleReader).read(this._settings().sizeWarningRows);
      this._lifecycleError = '';
    } catch (error) {
      this._lifecycleError = `Couldn't read the monthly lists: ${String((error as Error).message || error)}`;
    }
    this._refreshStatusView();
  }

  // ---------------------------------------------------------- central site

  private async _readCentral(): Promise<void> {
    try {
      this._central = await (this._centralSite as CentralSite).status(this._settings().trackCentralSite);
      this._centralError = '';
    } catch (error) {
      this._centralError = `Couldn't read the central site setting: ${String((error as Error).message || error)}`;
    }
    this._refreshStatusView();
  }

  /** "Central site" part of Setup and checks: which site every tracker saves to, and the button to change it. */
  private _renderCentral(): string {
    const c: ICentralSiteStatus | undefined = this._central;
    const note: string = this._centralNote
      ? `<p class="${this._centralNote.error ? styles.softError : styles.ok}">${escape(this._centralNote.text)}</p>`
      : '';
    if (!c) {
      return `<fieldset class="${styles.settings}"><legend>Central site</legend>${note}
        <p class="${this._centralError ? styles.softError : styles.muted}">${escape(this._centralError || 'Checking the central site...')}</p></fieldset>`;
    }
    const link = (url: string): string => safeHref(url)
      ? `<a href="${escape(safeHref(url))}" target="_blank" rel="noopener">${escape(url)}</a>` : escape(url);
    const own: string = c.trackCentralSite === false ? 'Pages on the central site itself are not counted.' : 'Pages on the central site itself are counted too.';
    let state: string;
    switch (c.state) {
      case 'not-set':
        state = `<p>No central site is set, so each tracked site saves its page views to its own HitCounter lists (if it has them).
          Make this site the central site to collect page views from every tracked site here.</p>`;
        break;
      case 'this-site':
        state = `<p class="${styles.ok}">This site is the central site. Every tracker saves page views here. ${escape(own)}</p>`;
        break;
      case 'this-site-out-of-date':
        state = `<p class="${styles.warn}">This site is the central site, but the tenant setting ${c.trackCentralSite
          ? 'counts' : 'does not count'} this site's own pages, unlike "Also track page views on this site" in Settings. Update it to match.</p>`;
        break;
      case 'other-site':
        state = `<p>The central site is ${link(c.centralSiteUrl as string)}. Trackers save page views there, not here.</p>`;
        break;
      default:
        state = `<p class="${styles.warn}">The tenant property ${escape('HitCounterCentralSiteUrl')} is set to something HitCounter can't read, so trackers save page views to their own sites.</p>`;
    }
    if (c.state === 'this-site') {
      return `<fieldset class="${styles.settings}"><legend>Central site</legend>${note}${state}</fieldset>`;
    }
    if (!c.appCatalogUrl) {
      return `<fieldset class="${styles.settings}"><legend>Central site</legend>${note}${state}
        <p class="${styles.muted}">This tenant has no app catalog, which is where the central site setting is kept. A SharePoint admin must create one first.</p></fieldset>`;
    }
    const catalog: string = c.appCatalogUrl;
    let access: string = '';
    if (c.access === 'no-access') {
      access = `<p class="${styles.muted}">Only a SharePoint admin who is also an admin of the app catalog (${link(catalog)}) can change this.</p>`;
    } else if (c.access === 'scripts-blocked') {
      access = `<div class="${styles.banner}">
          <strong>The app catalog blocks custom scripts, and while it does SharePoint won't save this setting, even for admins.</strong>
          <ol>
            <li>Allow custom scripts on the app catalog for a short while. In the SharePoint admin center: Sites, Active sites, select the app catalog, then Settings, Custom scripts: Allowed.
              Or in SharePoint Online PowerShell: <code>Set-SPOSite ${escape(catalog)} -DenyAddAndCustomizePages 0</code></li>
            <li>It can take a few minutes to apply. Then click <strong>Check again</strong>.</li>
            <li>Make this the central site.</li>
            <li>SharePoint blocks custom scripts again by itself within 24 hours. To block them straight away:
              <code>Set-SPOSite ${escape(catalog)} -DenyAddAndCustomizePages 1</code></li>
          </ol>
        </div>`;
    }
    const label: string = c.state === 'this-site-out-of-date' ? 'Update the central site' : 'Make this the central site';
    return `<fieldset class="${styles.settings}"><legend>Central site</legend>${note}${state}${access}
      <div class="${styles.actions}">
        <button class="${styles.secondary}" data-action="central-start"${c.access === 'ok' ? '' : ' disabled'}>${label}</button>
        <button class="${styles.secondary}" data-action="central-check">Check again</button>
      </div></fieldset>`;
  }

  private _renderCentralConfirm(c: ICentralSiteStatus, track: boolean): string {
    const here: string = this.context.pageContext.web.absoluteUrl;
    const before: string = c.state === 'other-site' && c.centralSiteUrl
      ? `<li>Page views stop going to ${escape(c.centralSiteUrl)}. Totals already stored there stay there; HitCounter doesn't move them.</li>`
      : c.state === 'not-set' || c.state === 'unreadable'
        ? '<li>Sites that saved page views to their own HitCounter lists keep those totals there; new page views come here.</li>'
        : '';
    return `<h3 class="${styles.cardTitle}">${c.state === 'this-site-out-of-date' ? 'Update the central site' : 'Make this the central site'}</h3>
      <p>This sets the tenant property <code>HitCounterCentralSiteUrl</code> on the app catalog to <strong>${escape(here)}</strong>.</p>
      <ul>
        <li>The tracker on every site saves page views to this site's lists.</li>
        <li>${track ? 'Pages on this site are counted too.' : 'Pages on this site are not counted.'} (Settings: "Also track page views on this site".)</li>
        ${before}
        <li>Browser tabs that are already open keep using the old setting until they're closed: the tracker reads it once per tab.</li>
      </ul>
      <div class="${styles.actions}">
        <button class="${styles.primary}" data-action="central-run">${c.state === 'this-site-out-of-date' ? 'Update' : 'Make this the central site'}</button>
        <button class="${styles.secondary}" data-action="reload">Cancel</button>
      </div>`;
  }

  private async _makeCentral(c: ICentralSiteStatus, track: boolean): Promise<void> {
    this._setView({ kind: 'central-saving' });
    try {
      await (this._centralSite as CentralSite).makeThisSiteCentral(c.appCatalogUrl as string, track);
      this._centralNote = { text: 'Saved: this site is now the central site.', error: false };
    } catch (error) {
      this._centralNote = { text: String((error as Error).message || error), error: true };
    }
    this._open.setup = true;
    this._central = undefined;
    await this._load();
  }

  /** Banner above the figures when a monthly list is getting large (scope 8.3 steps 3 and 5). */
  private _sizeBanner(): string {
    const lc: ILifecycleView | undefined = this._lifecycle;
    if (!lc || lc.warnings.length === 0) {
      return '';
    }
    const now: Date = new Date();
    const strong: boolean = lc.warnings.some((l: IActiveList) => l.warning === 'strong');
    const items: string = lc.warnings.map((l: IActiveList) => {
      const due: Date = nextUseOfMonth(l.month, now);
      const when: string = l.archivable
        ? `Archive it before ${due.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' })}, when its month comes round again.`
        : 'It is this month\'s list, so it can be archived once this month ends.';
      return `<li><strong>${escape(l.title)}</strong> has ${l.itemCount.toLocaleString()} rows. ${escape(when)}</li>`;
    }).join('');
    return `<div class="${strong ? styles.bannerStrong : styles.banner}" role="alert">
        <strong>${strong
          ? `A monthly list is close to SharePoint's limit of ${LIST_ITEM_LIMIT.toLocaleString()} rows. When a list reaches it, new page views fail. Archive it now.`
          : `A monthly list has reached ${this._settings().sizeWarningRows.toLocaleString()} rows (the warning size).`}</strong>
        <ul>${items}</ul>
        <span>See Monthly lists and archives below.</span>
      </div>`;
  }

  /** Central admins: the 12 active lists and the archives (scope 8.3-8.5). */
  private _renderLists(): string {
    const lc: ILifecycleView | undefined = this._lifecycle;
    const open: boolean = !!this._open.lists;
    let body: string;
    if (this._lifecycleError) {
      body = `<p class="${styles.softError}">${escape(this._lifecycleError)}</p>`;
    } else if (!lc) {
      body = `<p class="${styles.muted}">Reading the monthly lists...</p>`;
    } else {
      const settings: IHitCounterSettings = this._settings();
      const years = (l: { firstYear?: number; lastYear?: number }): string =>
        l.firstYear === undefined ? '' : l.lastYear !== undefined && l.lastYear !== l.firstYear ? `${l.firstYear} to ${l.lastYear}` : String(l.firstYear);
      const state = (l: IActiveList): string => l.warning === 'strong'
        ? `<span class="${styles.softError}">Near SharePoint's limit</span>`
        : l.warning === 'warn' ? `<span class="${styles.warn}">Past warning size</span>`
          : l.archivable ? '' : `<span class="${styles.muted}">${l.itemCount === 0 ? 'Empty' : 'This month'}</span>`;
      const pick = (l: IActiveList): string => l.archivable
        ? `<input type="checkbox" data-archive-pick="${escape(l.id)}" aria-label="Archive ${escape(l.title)}"${this._archivePick[l.id] ? ' checked' : ''} />`
        : '';
      const active: string = lc.active.map((l: IActiveList) =>
        `<tr${l.warning !== 'none' ? ` class="${styles.flagRow}"` : ''}><td>${pick(l)}</td><td>${escape(l.title)}</td><td>${MONTH_NAMES[l.month - 1]}</td>` +
        `<td class="${styles.num}">${l.itemCount.toLocaleString()}</td><td>${escape(years(l))}</td><td>${state(l)}</td></tr>`).join('');
      const picked: number = lc.active.filter((l: IActiveList) => l.archivable && this._archivePick[l.id]).length;
      const archives: string = lc.archives.length === 0
        ? `<p class="${styles.muted}">No archives yet.</p>`
        : `<table class="${styles.siteTable}"><thead><tr><th>Archive</th><th class="${styles.num}">Rows</th><th>Archived</th><th>Deleted after</th><th></th></tr></thead><tbody>${
          lc.archives.map((a: IArchiveList) => {
            const record: IArchiveRecord | undefined = lc.records[a.id.toLowerCase()];
            const due: Date | undefined = record ? deleteAfter(record.archivedUtc, settings.archiveRetentionYears) : undefined;
            return `<tr><td>${escape(a.title)}</td><td class="${styles.num}">${a.itemCount.toLocaleString()}</td>` +
              `<td>${record ? escape(new Date(record.archivedUtc).toLocaleDateString()) : '<span class="' + styles.muted + '">Not recorded</span>'}</td>` +
              `<td>${due ? escape(due.toLocaleDateString()) : '<span class="' + styles.muted + '">Unknown</span>'}</td>` +
              `<td><button class="${styles.linkButton}" data-archive-delete="${escape(a.id)}">Delete</button></td></tr>`;
          }).join('')}</tbody></table>`;
      body = `<p class="${styles.muted}">Rows build up in each monthly list year after year until a central admin archives it.
          Warning size: ${settings.sizeWarningRows.toLocaleString()} rows. Archives are deleted ${settings.archiveRetentionYears} year(s) after archiving.
          Both can be changed under Setup and checks.</p>
        <div class="${styles.tableScroll}"><table class="${styles.siteTable}">
          <thead><tr><th><span class="${styles.visuallyHidden}">Archive</span></th><th>List</th><th>Month</th><th class="${styles.num}">Rows</th><th>Years held</th><th></th></tr></thead>
          <tbody>${active}</tbody>
        </table></div>
        <p class="${styles.muted}">Tick finished months to archive their raw rows. This month's list and empty lists can't be archived.</p>
        <div class="${styles.actions}">
          <button class="${styles.secondary}" data-action="archive-start"${picked === 0 ? ' disabled' : ''}>Archive selected${picked > 0 ? ` (${picked})` : ''}</button>
        </div>
        <h4 class="${styles.subTitle}">Archives</h4>${archives}`;
    }
    return `<details class="${styles.details}" data-open-key="lists"${open ? ' open' : ''}>
        <summary>Monthly lists and archives${lc && lc.warnings.length > 0 ? ` (${lc.warnings.length} warning${lc.warnings.length === 1 ? '' : 's'})` : ''}</summary>
        <div class="${styles.detailsBody}">${body}</div>
      </details>`;
  }

  // ------------------------------------------------------------ live figures

  private async _startLive(): Promise<void> {
    if (this._liveState === 'starting' || this._liveState === 'on') {
      return;
    }
    this._liveState = 'starting';
    this._refreshStatusView();
    try {
      await (this._live as LiveFeed).start();
      this._liveState = 'on';
      this._liveError = '';
      this._livePolled = new Date();
    } catch (error) {
      this._liveState = 'failed';
      this._liveError = String((error as Error).message || error);
    }
    this._refreshStatusView();
    if (this._timer === undefined) {
      // Refresh about every minute while the tab is visible (scope 8.1 step 3).
      this._timer = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          this._pollLive().catch(() => { /* handled inside */ });
        }
      }, LIVE_REFRESH_MS);
      document.addEventListener('visibilitychange', this._onVisible);
    }
  }

  private async _pollLive(): Promise<void> {
    if (this._view.kind !== 'status' || this._view.status.state !== 'ready') {
      return;
    }
    if (this._liveState === 'failed') {
      this._liveState = 'off';
      await this._startLive();
      return;
    }
    if (this._liveState !== 'on' || (this._livePolled && new Date().getTime() - this._livePolled.getTime() < LIVE_REFRESH_MS / 2)) {
      return;
    }
    try {
      await (this._live as LiveFeed).poll();
      this._livePolled = new Date();
      this._liveError = '';
    } catch (error) {
      this._liveError = String((error as Error).message || error);
    }
    this._refreshStatusView();
  }

  private _stopLive(): void {
    if (this._timer !== undefined) {
      window.clearInterval(this._timer);
      this._timer = undefined;
    }
    document.removeEventListener('visibilitychange', this._onVisible);
  }

  /** Recycles archives past the retention period; returns a sentence for the status line ('' if none). */
  private async _runRetention(): Promise<string> {
    try {
      const r: IRetentionResult = await (this._retention as Retention).run(this._settings().archiveRetentionYears);
      let text: string = '';
      if (r.recycled.length > 0) {
        text += ` Moved ${r.recycled.length} archive(s) past the retention period to the recycle bin: ${r.recycled.join(', ')}.`;
      }
      r.kept.forEach((k: { title: string; reason: string }) => { text += ` Kept ${k.title}: ${k.reason}.`; });
      return text;
    } catch (error) {
      return ` Archive retention check failed: ${String((error as Error).message || error)}.`;
    }
  }

  private async _runJob(adminContact: string): Promise<void> {
    if (this._jobRunning) {
      return;
    }
    this._jobRunning = true;
    this._jobFailed = false;
    // Counts as this browser's update, so the tracker's background update waits 15 minutes.
    writeLocal(LAST_UPDATE_KEY, String(new Date().getTime()));
    this._jobMessage = 'Updating totals...';
    this._refreshStatusView();
    try {
      const result: IJobResult = await (this._job as SummaryJob).run(adminContact, (message: string) => {
        this._jobMessage = `Updating totals: ${message}`;
        this._refreshStatusView();
      });
      if (result.status === 'locked') {
        // The lock may be your own: another tab, or a page closed or refreshed
        // mid-update. Either way it frees up by itself within 3 minutes.
        this._jobMessage = result.lockedBy === this.context.pageContext.user.displayName
          ? 'Another tab of yours, or a page you refreshed while it was updating, holds the update. It frees up within 3 minutes; live figures are unaffected.'
          : `${result.lockedBy || 'Another central admin'} is updating the stored totals right now. Live figures are unaffected.`;
      } else {
        this._jobMessage = result.rowsCounted === 0
          ? `Totals are up to date (checked in ${result.seconds}s).`
          : `Updated: counted ${result.rowsCounted} new page view(s)${result.rowsSkipped ? `, skipped ${result.rowsSkipped} with a wrong date` : ''}${result.rowsRepeated
            ? `, ignored ${result.rowsRepeated} repeat(s) (same person and page within 30 seconds)` : ''} in ${result.seconds}s.`;
        // Archive retention (scope 8.5) after each successful run.
        this._jobMessage += await this._runRetention();
      }
      await this._readTotals();
      await this._readLifecycle(); // Row counts have moved on.
    } catch (error) {
      this._jobFailed = true;
      this._jobMessage = `Updating totals failed: ${String((error as Error).message || error)}. Nothing is lost; the next update carries on from where this one stopped.`;
    }
    this._jobRunning = false;
    this._refreshStatusView();
  }

  // ---------------------------------------------------------------- views

  private _renderBody(): string {
    const view: ViewState = this._view;
    const header: string = `<h2 class="${styles.title}">HitCounter</h2>`;

    switch (view.kind) {
      case 'loading':
        return `${header}<p class="${styles.muted}">Loading...</p>`;

      case 'no-access':
        return `${header}<p class="${styles.muted}">${view.noOwnedSites
          ? 'The HitCounter dashboard shows figures to HitCounter admins and to owners of tracked sites. You don\'t own any site with page views this year or last year.'
          : view.setUp
            ? 'The HitCounter dashboard is for HitCounter admins and owners of tracked sites.'
            : 'HitCounter isn\'t set up on this site yet. A site owner can set it up here.'}</p>
          ${view.setUp ? this._accessCheckIntro() : ''}`;

      case 'archive-confirm':
        return `${header}<h3 class="${styles.cardTitle}">Archive ${view.lists.length} monthly list${view.lists.length === 1 ? '' : 's'}</h3>
          <ul>${view.lists.map((l: IActiveList) =>
            `<li><strong>${escape(l.title)}</strong> (${MONTH_NAMES[l.month - 1]}, ${l.itemCount.toLocaleString()} rows)</li>`).join('')}</ul>
          <p>Archiving:</p>
          <ul>
            <li>first brings the stored totals up to date and checks that every row is counted;</li>
            <li>renames each list after the years it holds (for example hitcounter_10_2026) and moves its web address to match;</li>
            <li>removes everyone's access except this site's Owners, so the raw rows are read-only and readable by central admins only;</li>
            <li>creates a new empty list for that month.</li>
          </ul>
          <p><strong>The dashboard's totals do not change.</strong> The raw rows are deleted
            ${this._settings().archiveRetentionYears} year(s) after archiving (the retention period under Setup and checks).</p>
          <div class="${styles.actions}">
            <button class="${styles.primary}" data-action="archive-run">Archive ${view.lists.length} list${view.lists.length === 1 ? '' : 's'}</button>
            <button class="${styles.secondary}" data-action="reload">Cancel</button>
          </div>`;

      case 'archiving':
        return `${header}<p>Archiving. Keep this page open.</p>${this._renderLog(view.log, true)}`;

      case 'archived':
        return `${header}${view.error
          ? `<p class="${styles.softError}">Archive stopped: ${escape(view.error)}</p><p class="${styles.muted}">Nothing is lost. Every step is safe to repeat: fix the problem and run Archive again.</p>`
          : `<p class="${styles.ok}">Archive finished.</p>`}
          ${this._renderLog(view.log, false)}
          <button class="${styles.secondary}" data-action="reload">Back to the dashboard</button>`;

      case 'recycle-confirm':
        return `${header}<h3 class="${styles.cardTitle}">Delete archive ${escape(view.archive.title)}</h3>
          <p>This deletes the archive's ${view.archive.itemCount.toLocaleString()} raw rows before the end of the retention period.
            The list goes to this site's recycle bin, where a site owner can restore it for up to 93 days.</p>
          <p><strong>The dashboard's totals do not change.</strong> HitCounter first checks that every row in the archive was counted, and keeps it if not.</p>
          <div class="${styles.actions}">
            <button class="${styles.primary}" data-action="recycle-run">Delete archive</button>
            <button class="${styles.secondary}" data-action="reload">Cancel</button>
          </div>`;

      case 'recycled':
        return `${header}<p class="${view.error ? styles.softError : styles.ok}">${escape(view.message)}</p>
          <button class="${styles.secondary}" data-action="reload">Back to the dashboard</button>`;

      case 'central-confirm':
        return header + this._renderCentralConfirm(view.central, view.track);

      case 'central-saving':
        return `${header}<p>Saving the central site...</p>`;

      case 'owner-checking':
        return `${header}<p class="${styles.muted}">Finding the sites you own${view.total > 0 ? `: checked ${view.done} of ${view.total}` : ''}...</p>`;

      case 'owner':
        return `${header}${this._renderDashboard()}
          <details class="${styles.details}" data-open-key="owner-help"${this._open['owner-help'] ? ' open' : ''}>
            <summary>Problems?</summary>
            <div class="${styles.detailsBody}">${this._accessCheckIntro()}</div>
          </details>`;

      case 'checking':
        return `${header}<p>Checking your access. Keep this page open.</p>${this._renderResults(view.results, true)}`;

      case 'checked':
        return header + this._renderChecked(view);

      case 'ownership':
        return header + this._renderOwnership(view.rows, view.running, view.error);

      case 'error':
        return `${header}<p class="${styles.softError}">Couldn't load HitCounter: ${escape(view.message)}</p>
          <button class="${styles.secondary}" data-action="reload">Try again</button>`;

      case 'status':
        return header + this._renderStatus(view.status);

      case 'running':
        return `${header}<p>Setting up HitCounter. Keep this page open.</p>${this._renderLog(view.log, true)}`;

      case 'finished':
        return `${header}${view.error
          ? `<p class="${styles.softError}">Set up stopped: ${escape(view.error)}</p><p class="${styles.muted}">Nothing is lost. Fix the problem and run Set up again: it carries on from where it stopped.</p>`
          : '<p class="' + styles.ok + '">HitCounter is set up.</p>'}
          ${this._renderLog(view.log, false)}
          <button class="${styles.secondary}" data-action="reload">Back to status</button>`;

      default:
        return header;
    }
  }

  private _renderStatus(status: ISetupStatus): string {
    const settings: IHitCounterSettings = status.settings || defaultSettings();
    const total: number = allListDefinitions().length;
    const libraries: number = allListDefinitions().filter((d: { baseTemplate: number }) => d.baseTemplate === 101).length;
    const what: string = `${total - libraries} lists and ${libraries} ${libraries === 1 ? 'library' : 'libraries'}`;
    let summary: string;
    let buttonLabel: string;
    switch (status.state) {
      case 'not-set-up':
        summary = `<p>HitCounter isn't set up on this site yet. Set up creates ${what} here, all hidden, a "HitCounter Add" permission level, and the permissions described below.</p>`;
        buttonLabel = 'Set up HitCounter';
        break;
      case 'needs-update':
        summary = `<p class="${styles.warn}">HitCounter needs an update${status.missingLists.length > 0
          ? `: ${status.missingLists.length} of ${total} lists are missing (${escape(status.missingLists.join(', '))})`
          : status.installedSchemaVersion !== undefined
            ? ` from version ${status.installedSchemaVersion} to ${SCHEMA_VERSION}`
            : ': its settings are missing'}.</p>`;
        buttonLabel = 'Update HitCounter';
        break;
      default:
        summary = `<p class="${styles.ok}">HitCounter is set up (version ${SCHEMA_VERSION}, ${what}).</p>`;
        buttonLabel = 'Check and repair';
    }

    const setup: string = `${summary}
      <fieldset class="${styles.settings}">
        <legend>Settings</legend>
        <label class="${styles.field}">
          <span>Who can record page views</span>
          <select data-setting="recordHitsBy">
            <option value="everyone" selected>All internal users (Everyone except external users)</option>
            <option disabled>A security group (later)</option>
            <option disabled>This site's own groups (later)</option>
          </select>
        </label>
        <label class="${styles.check}">
          <input type="checkbox" data-setting="trackCentralSite" ${settings.trackCentralSite ? 'checked' : ''} />
          <span>Also track page views on this site</span>
        </label>
        <label class="${styles.check}">
          <input type="checkbox" data-setting="backgroundUpdates" ${settings.backgroundUpdates ? 'checked' : ''} />
          <span>Update stored totals in the background while this site's owners browse SharePoint (at most every 15 minutes, so site owners' figures stay fresh without opening this dashboard)</span>
        </label>
        <label class="${styles.field}">
          <span>Admin contact shown to site owners (optional)</span>
          <input type="text" data-setting="adminContact" maxlength="200" value="${escape(settings.adminContact)}" placeholder="Name or email" />
        </label>
        <label class="${styles.field}">
          <span>Warn when a monthly list reaches this many rows</span>
          <input type="number" data-setting="sizeWarningRows" min="${MIN_WARNING_ROWS}" max="${STRONG_WARNING_ROWS}" step="1000" value="${settings.sizeWarningRows}" />
        </label>
        <label class="${styles.field}">
          <span>Delete archives this many years after archiving</span>
          <input type="number" data-setting="archiveRetentionYears" min="1" max="${MAX_RETENTION_YEARS}" step="1" value="${settings.archiveRetentionYears}" />
        </label>
      </fieldset>
      ${status.state === 'ready' ? this._renderCentral() : ''}
      <details class="${styles.details}">
        <summary>What Set up creates</summary>
        <ul>
          <li><strong>12 monthly lists</strong> (hitcounter_01 to hitcounter_12): all internal users can add rows and read only their own.</li>
          <li><strong>HitCounter_Summary</strong>: totals only, readable by all internal users.</li>
          <li><strong>HitCounter_PageSummary</strong>, <strong>HitCounter_State</strong>, <strong>HitCounter_Working</strong>: this site's owners only.</li>
          <li>All are hidden and excluded from search. Site members and visitors get no other access to them.</li>
        </ul>
      </details>
      <div class="${styles.actions}">
        <button class="${styles.primary}" data-action="setup">${buttonLabel}</button>
        ${status.state === 'ready' ? `<button class="${styles.secondary}" data-action="check">Check my access</button>
        <button class="${styles.secondary}" data-action="ownership">Which sites do I own?</button>` : ''}
      </div>`;

    if (status.state !== 'ready') {
      return `<div class="${styles.narrow}">${setup}</div>`;
    }
    return `${this._renderDashboard()}
      <div class="${styles.narrow}">${this._renderLists()}</div>
      <details class="${styles.details} ${styles.narrow}" data-open-key="setup"${this._open.setup ? ' open' : ''}>
        <summary>Setup and checks</summary>
        <div class="${styles.detailsBody}">${setup}</div>
      </details>`;
  }

  // ------------------------------------------------------------- dashboard

  private _renderDashboard(): string {
    const history: IHistory | undefined = this._history;
    if (!history) {
      return `<p class="${styles.muted}">Loading totals...</p>${this._jobLine()}`;
    }
    // Site owner view (scope 9.2): owned sites only, added together; no
    // all-sites totals, page-level figures, live figures or admin actions.
    const owned: ITrackedSite[] | undefined = this._view.kind === 'owner' ? this._ownedSites : undefined;
    const ownerView: boolean = !!owned;
    const m: IDashboardModel = ownerView
      ? buildDashboard(history.rows, undefined, this._selection, new Date(), {
        onlySites: (owned as ITrackedSite[]).map((s: ITrackedSite) => s.siteId),
        allLabel: 'All my sites'
      })
      : buildDashboard(history.rows, this._live ? this._live.state : undefined, this._selection, new Date());
    if (this._selection && !m.selection) {
      this._selection = ''; // The chosen site is no longer tracked.
    }
    const allSites: boolean = !m.selection;
    const allLabel: string = ownerView ? 'All my sites' : 'All sites';
    const days14: IPoint[] = m.days.slice(-14);
    const yesterday: IPoint = m.days[m.days.length - 2];

    this._sites = m.sites;
    // With many sites, a search box narrows the picker and the sites table.
    const search: string = m.sites.length > SEARCH_FROM
      ? `<input type="search" class="${styles.search}" data-site-search="1" placeholder="Find a site" aria-label="Find a site" value="${escape(this._siteFilter)}" />`
      : '';
    const toolbar: string = `<div class="${styles.toolbar}">
        ${search}<label><span class="${styles.muted}">Site </span><select data-site-select="1" aria-label="Site">${this._siteOptions(m.selection, allLabel)}</select></label>
        ${ownerView ? '' : `${this._liveBadge()}
        <span class="${styles.toolbarSpacer}"></span>
        <button class="${styles.secondary}" data-action="update-totals" ${this._jobRunning ? 'disabled' : ''}>Update stored totals</button>`}
      </div>`;

    const kpi = (label: string, value: number, sub: string, colour: string, spark: number[]): string =>
      `<div class="${styles.card} ${styles.kpi}" style="--kpi:${colour}">
        <div class="${styles.kpiLabel}">${escape(label)}</div>
        <div class="${styles.kpiValue}">${formatCount(value)}</div>
        <div class="${styles.kpiSub}">${escape(sub)}</div>
        ${sparkline(spark, colour)}
      </div>`;
    const kpis: string = `<div class="${styles.kpis}">
        ${kpi('Page views today', m.today.views, `Yesterday ${formatCount(yesterday.views)}`, VIEWS, days14.map((p: IPoint) => p.views))}
        ${kpi('Visitors today', m.today.visitors, `Yesterday ${formatCount(yesterday.visitors)}`, VISITORS, days14.map((p: IPoint) => p.visitors))}
        ${kpi('Page views this month', m.month.views, `This year ${formatCount(m.year.views)}`, VIEWS, m.months.map((p: IPoint) => p.views))}
        ${kpi('Visitors this month', m.month.visitors, `This year ${formatCount(m.year.visitors)}`, VISITORS, m.months.map((p: IPoint) => p.visitors))}
      </div>`;

    const card = (title: string, sub: string, body: string, extra: string = '', wide: boolean = false): string =>
      `<div class="${styles.card}${wide ? ' ' + styles.wide : ''}">
        <div class="${styles.cardHead}"><h3 class="${styles.cardTitle}">${escape(title)}</h3><span class="${styles.cardSub}">${escape(sub)}</span></div>
        ${extra}${body}
      </div>`;

    const noViews: boolean = m.year.views === 0 && m.days.every((p: IPoint) => p.views === 0);
    const trend: string = card('Page views and visitors', `Last 30 days, per day (UTC) · ${m.selectionName}`,
      noViews ? `<p class="${styles.empty}">No page views in the last 30 days.</p>`
        : this._chartHost('trend', (w: number) => trendChart(m.days, `Page views and visitors per day for the last 30 days, ${m.selectionName}`, w)) +
          this._pointTable('trend', m.days, 'Day'),
      legend([{ label: 'Page views', colour: VIEWS, line: true }, { label: 'Visitors', colour: VISITORS, line: true }]), true);

    const months: string = card('Page views by month', `Last 12 months · ${m.selectionName}`,
      m.months.every((p: IPoint) => p.views === 0) ? `<p class="${styles.empty}">No page views in the last 12 months.</p>`
        : this._chartHost('months', (w: number) => columnChart(m.months, `Page views per month for the last 12 months, ${m.selectionName}`, w)) +
          this._pointTable('months', m.months, 'Month'));

    const share: string = allSites && (!ownerView || m.sites.length > 1)
      ? card('Share of page views', ownerView ? 'This month, by your sites' : 'This month, by site',
        m.share.length === 0 ? `<p class="${styles.empty}">No page views this month yet.</p>`
          : donutChart(m.share, 'Share of this month\'s page views by site'))
      : '';

    const pages: string = ownerView ? '' : card('Top pages', `This month · ${m.selectionName}`,
      m.topPages.length === 0
        ? `<p class="${styles.empty}">${this._liveState === 'failed' ? 'Top pages need the live figures, which couldn\'t load.'
          : this._liveState === 'on' ? 'No page views this month yet.' : 'Loading top pages...'}</p>`
        : topPagesChart(m.topPages, allSites));

    const cell = (c: ICount): string =>
      `<td class="${styles.num}">${c.views.toLocaleString()}</td><td class="${styles.num}">${c.visitors.toLocaleString()}</td>`;
    const siteRow = (r: ISiteRow, total: boolean): string =>
      `<tr${total ? ` class="${styles.totalRow}"` : ''}><td><span class="${styles.siteName}">${total ? ''
        : `<span class="${styles.keyDot}" style="background:${siteColour(r.site.colour)}"></span>`}${safeHref(r.site.url)
          ? `<a href="${escape(safeHref(r.site.url))}" target="_blank" rel="noopener">${escape(r.site.name)}</a>`
          : escape(r.site.name)}</span></td>${cell(r.today)}${cell(r.month)}${cell(r.year)}</tr>`;
    // Sortable headers: a button in each, with aria-sort on the sorted column.
    const head = (key: SiteSortKey, label: string, numeric: boolean, extra: string = ''): string => {
      const sorted: boolean = this._sort.key === key;
      const arrow: string = sorted ? (this._sort.descending ? ' ↓' : ' ↑') : '';
      return `<th${extra}${numeric ? ` class="${styles.num}"` : ''}${sorted ? ` aria-sort="${this._sort.descending ? 'descending' : 'ascending'}"` : ''}>` +
        `<button class="${styles.sortButton}" data-sort="${key}">${label}${arrow}</button></th>`;
    };
    const matching: ISiteRow[] = sortSiteRows(m.siteRows, this._sort.key, this._sort.descending)
      .filter((r: ISiteRow) => filterSites([r.site], this._siteFilter).length > 0);
    const shown: ISiteRow[] = this._showAllSites ? matching : matching.slice(0, SITES_SHOWN);
    const filtered: boolean = matching.length < m.siteRows.length;
    const more: string = matching.length > SITES_SHOWN
      ? `<div class="${styles.actions}"><button class="${styles.secondary}" data-action="toggle-sites">${this._showAllSites
        ? `Show top ${SITES_SHOWN}` : `Show all ${matching.length} sites`}</button></div>`
      : '';
    const tableSub: string = `${filtered ? `${matching.length} of ${m.siteRows.length} sites match "${this._siteFilter.trim()}". ` : ''}` +
      `Showing ${shown.length} of ${matching.length}. ` + (ownerView
      ? 'Visitors are unique people per site; All my sites adds them up, so someone who visited two of your sites counts twice'
      : 'Visitors are unique people; All sites counts each person once');
    const table: string = card('Sites', tableSub, m.siteRows.length === 0
      ? `<p class="${styles.empty}">No sites tracked yet.</p>`
      : `<div class="${styles.tableScroll}"><table class="${styles.siteTable}">
          <thead>
            <tr>${head('name', 'Site', false, ' rowspan="2"')}<th colspan="2">Today</th><th colspan="2">This month</th><th colspan="2">This year</th></tr>
            <tr>${head('todayViews', 'Views', true)}${head('todayVisitors', 'Visitors', true)}${head('monthViews', 'Views', true)}${head('monthVisitors', 'Visitors', true)}${head('yearViews', 'Views', true)}${head('yearVisitors', 'Visitors', true)}</tr>
          </thead>
          <tbody>${shown.map((r: ISiteRow) => siteRow(r, false)).join('')}${shown.length === 0
            ? `<tr><td colspan="7" class="${styles.muted}">No sites match "${escape(this._siteFilter.trim())}".</td></tr>` : ''}${siteRow(m.allSitesRow, true)}</tbody>
        </table></div>${more}`, '', true);

    return `${toolbar}${ownerView ? this._ownerLine(history) : this._jobLine() + this._sizeBanner()}${kpis}
      <div class="${styles.grid}">${trend}${months}${share}${pages}${table}</div>
      ${this._renderExport(ownerView, m.selection ? m.selectionName : allLabel)}`;
  }

  // ----------------------------------------------------------- CSV export

  /** "Export CSV" section under the figures (scope N1). */
  private _renderExport(ownerView: boolean, siteName: string): string {
    const e = this._export;
    const message: string = e.message
      ? `<p class="${e.error ? styles.softError : styles.muted}" role="status">${escape(e.message)}</p>` : '';
    return `<details class="${styles.details}" data-open-key="export"${this._open.export ? ' open' : ''}>
        <summary>Export CSV</summary>
        <div class="${styles.detailsBody}">
          <p class="${styles.muted}">Downloads stored totals for <strong>${escape(siteName)}</strong> (the site chosen above) as a CSV file that opens in Excel.
            Dates are UTC. Visitors are unique people in each day or month, so they can't be added up across rows.</p>
          <div class="${styles.toolbar}">
            <label><span class="${styles.muted}">Detail </span><select data-export="detail">
              <option value="day"${e.detail === 'day' ? ' selected' : ''}>Daily</option>
              <option value="month"${e.detail === 'month' ? ' selected' : ''}>Monthly</option>
            </select></label>
            <label><span class="${styles.muted}">From </span><input type="date" data-export="from" value="${escape(e.from)}" /></label>
            <label><span class="${styles.muted}">To </span><input type="date" data-export="to" value="${escape(e.to)}" /></label>
          </div>
          ${ownerView ? '' : `<label class="${styles.check}">
            <input type="checkbox" data-export="pages"${e.pages ? ' checked' : ''} />
            <span>Also download top pages (each site's top 50 pages per month, as a second file)</span>
          </label>`}
          <div class="${styles.actions}">
            <button class="${styles.secondary}" data-action="export-run"${e.busy ? ' disabled' : ''}>${e.busy ? 'Exporting...' : 'Download CSV'}</button>
          </div>
          ${message}
        </div>
      </details>`;
  }

  private async _runExport(): Promise<void> {
    const e = this._export;
    const problem: string | undefined = rangeProblem(e.detail, e.from, e.to);
    if (problem) {
      this._export = { ...e, message: problem, error: true };
      this.render();
      return;
    }
    const ownerView: boolean = this._view.kind === 'owner' && !!this._ownedSites;
    const request: IExportRequest = {
      detail: e.detail,
      from: e.from,
      to: e.to,
      siteId: this._selection,
      onlySites: ownerView ? (this._ownedSites as ITrackedSite[]).map((s: ITrackedSite) => s.siteId) : undefined,
      allSites: !ownerView
    };
    const withPages: boolean = e.pages && !ownerView;
    const progress = (what: string): ((done: number, total: number) => void) => (done: number, total: number): void => {
      this._export = { ...this._export, busy: true, message: `Reading ${what}: ${done} of ${total} requests...`, error: false };
      this._refreshStatusView();
    };
    this._export = { ...e, busy: true, message: 'Reading stored totals...', error: false };
    this.render();
    try {
      const exporter: Exporter = this._exporter as Exporter;
      const totals: string = totalsCsv(await exporter.totals(e.detail, e.from, e.to, progress('stored totals')), request);
      const files: string[] = [exportFileName(e.detail === 'day' ? 'daily' : 'monthly', e.from, e.to)];
      this._download(files[0], totals);
      const rows: number = totals.split('\r\n').length - 2;
      let text: string = `Downloaded ${files[0]} (${rows} row${rows === 1 ? '' : 's'})`;
      if (withPages) {
        const pageRows: IPageRow[] = await exporter.pages(e.from, e.to, progress('top pages'));
        const pages: string = pagesCsv(pageRows, request);
        const name: string = exportFileName('pages', e.from, e.to);
        this._download(name, pages);
        const count: number = pages.split('\r\n').length - 2;
        text += ` and ${name} (${count} row${count === 1 ? '' : 's'})`;
      }
      const updated: string = this._history && this._history.lastUpdatedUtc
        ? ` Stored totals as of ${new Date(this._history.lastUpdatedUtc).toLocaleString()}.` : '';
      this._export = { ...this._export, busy: false, message: `${text}.${updated}`, error: false };
    } catch (error) {
      this._export = { ...this._export, busy: false, message: `Export failed: ${String((error as Error).message || error)}`, error: true };
    }
    this._refreshStatusView();
  }

  private _download(fileName: string, text: string): void {
    const url: string = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  /** Site owners: how fresh the figures are and whom to ask (scope 8.1, site owner step 3). */
  private _ownerLine(history: IHistory): string {
    const contact: string = history.adminContact ? ` Contact your HitCounter admin: ${history.adminContact}.` : '';
    if (!history.lastUpdatedUtc) {
      return `${this._historyError ? `<p class="${styles.softError}">${escape(this._historyError)}</p>` : ''}
        <p class="${styles.statusLine}">${escape(`These figures haven't been updated yet. They update when a HitCounter admin opens the dashboard.${contact}`)}</p>`;
    }
    const updated: Date = new Date(history.lastUpdatedUtc);
    const text: string = `Last updated ${relativeTime(updated, new Date())} (${updated.toLocaleString()}). ` +
      `Figures update when a HitCounter admin opens the dashboard.${contact}`;
    return `${this._historyError ? `<p class="${styles.softError}">${escape(this._historyError)}</p>` : ''}
      <p class="${styles.statusLine}">${escape(text)}</p>`;
  }

  /** Picker options: All sites, then sites matching the search. The chosen site always stays listed. */
  private _siteOptions(selection: string, allName: string): string {
    const matching: ISiteInfo[] = filterSites(this._sites, this._siteFilter);
    const list: ISiteInfo[] = matching.slice();
    if (selection && !matching.some((s: ISiteInfo) => s.siteId === selection)) {
      this._sites.filter((s: ISiteInfo) => s.siteId === selection).forEach((s: ISiteInfo) => list.unshift(s));
    }
    const allLabel: string = matching.length < this._sites.length
      ? `${allName} (${matching.length} of ${this._sites.length} match)`
      : `${allName} (${this._sites.length})`;
    return [`<option value=""${selection ? '' : ' selected'}>${escape(allLabel)}</option>`]
      .concat(list.map((s: ISiteInfo) =>
        `<option value="${escape(s.siteId)}"${s.siteId === selection ? ' selected' : ''}>${escape(s.name)}</option>`))
      .join('');
  }

  /** A placeholder filled after render by _drawCharts, once its pixel width is known. */
  private _chartHost(key: string, draw: (width: number) => string): string {
    this._charts[key] = draw;
    return `<div class="${styles.chartHost}" data-chart="${key}"></div>`;
  }

  /** Draws each chart at its host's current width. Runs after every render and on resize. */
  private _drawCharts(): void {
    const hosts: NodeListOf<HTMLElement> = this.domElement.querySelectorAll('[data-chart]');
    for (let i = 0; i < hosts.length; i++) {
      const host: HTMLElement = hosts[i];
      const draw: ((width: number) => string) | undefined = this._charts[host.getAttribute('data-chart') || ''];
      const width: number = host.clientWidth;
      if (draw && width > 0 && host.getAttribute('data-width') !== String(width)) {
        host.setAttribute('data-width', String(width));
        host.innerHTML = draw(width);
      }
    }
  }

  private _jobLine(): string {
    const history: IHistory | undefined = this._history;
    const updated: string = history && history.lastUpdatedUtc
      ? `Stored totals last updated ${new Date(history.lastUpdatedUtc).toLocaleString()}.`
      : 'Stored totals not updated yet.';
    return `${this._historyError ? `<p class="${styles.softError}">${escape(this._historyError)} Showing live figures only.</p>` : ''}
      <p class="${this._jobFailed ? styles.softError : styles.statusLine}">${escape(updated)}${this._jobMessage ? ' ' + escape(this._jobMessage) : ''}</p>`;
  }

  private _liveBadge(): string {
    switch (this._liveState) {
      case 'on':
        return `<span class="${styles.liveBadge}"${this._liveError ? ` title="${escape(this._liveError)}"` : ''}><span class="${this._liveError ? styles.idleDot : styles.liveDot}"></span>${this._liveError
          ? 'Live: last refresh failed, retrying'
          : `Live · refreshed ${this._livePolled ? this._livePolled.toLocaleTimeString() : ''}`}</span>`;
      case 'failed':
        return `<span class="${styles.liveBadge}" title="${escape(this._liveError)}"><span class="${styles.idleDot}"></span>Live figures unavailable; showing stored totals</span>`;
      default:
        return `<span class="${styles.liveBadge}"><span class="${styles.idleDot}"></span>Connecting live figures...</span>`;
    }
  }

  /** The chart's numbers as a table, for screen readers and exact values. */
  private _pointTable(key: string, points: IPoint[], heading: string): string {
    const open: boolean = !!this._open[key];
    return `<details class="${styles.dataTable}" data-open-key="${key}"${open ? ' open' : ''}>
        <summary>Show as table</summary>
        <div class="${styles.tableScroll}"><table class="${styles.siteTable}">
          <thead><tr><th>${heading}</th><th class="${styles.num}">Page views</th><th class="${styles.num}">Visitors</th></tr></thead>
          <tbody>${points.slice().reverse().map((p: IPoint) =>
            `<tr><td>${escape(p.label)}</td><td class="${styles.num}">${p.views.toLocaleString()}</td><td class="${styles.num}">${p.visitors.toLocaleString()}</td></tr>`).join('')}</tbody>
        </table></div>
      </details>`;
  }

  private _accessCheckIntro(): string {
    return `<p>You can check what your account can do with HitCounter's lists. The check adds two test rows to this month's list; a site owner can remove them afterwards.</p>
      <div class="${styles.actions}">
        <button class="${styles.secondary}" data-action="check">Check my access</button>
        <button class="${styles.secondary}" data-action="ownership">Which sites do I own?</button>
      </div>`;
  }

  private _renderOwnership(rows: ISiteOwnership[], running: boolean, error: string | undefined): string {
    const label = (r: ISiteOwnership): string =>
      r.access === 'owner' ? `<td class="${styles.ok}">Owner</td>`
        : r.access === 'error' ? `<td class="${styles.softError}">Error</td>`
          : `<td class="${styles.muted}">${r.access === 'no-access' ? 'No access' : 'Not owner'}</td>`;
    const body: string = rows.map((r: ISiteOwnership) =>
      `<tr>${label(r)}<td>${escape(r.siteUrl)}</td><td>${escape(r.detail)}</td></tr>`).join('');
    const owned: number = rows.filter((r: ISiteOwnership) => r.access === 'owner').length;
    const errors: number = rows.filter((r: ISiteOwnership) => r.access === 'error').length;
    const summary: string = error
      ? `<p class="${styles.softError}">The check stopped: ${escape(error)}</p>`
      : running ? '<p>Checking each tracked site...</p>'
        : errors > 0 ? `<p class="${styles.softError}">${errors} site(s) couldn't be checked.</p>`
          : `<p class="${styles.ok}">You own ${owned} of ${rows.length} tracked site(s). Site owners will see totals for these sites only.</p>`;
    return `${summary}
      <table class="${styles.results}">
        <thead><tr><th>Result</th><th>Site</th><th>Detail</th></tr></thead>
        <tbody>${body}${running ? `<tr><td class="${styles.muted}" colspan="3">Working...</td></tr>` : ''}</tbody>
      </table>
      <div class="${styles.actions}"><button class="${styles.secondary}" data-action="reload">Back</button></div>`;
  }

  private async _runOwnership(): Promise<void> {
    const rows: ISiteOwnership[] = [];
    this._setView({ kind: 'ownership', rows, running: true, error: undefined });
    const ownership: SiteOwnership = this._ownership as SiteOwnership;
    try {
      const sites: string[] = await ownership.trackedSites();
      for (const site of sites) {
        rows.push(await ownership.check(site));
        this._setView({ kind: 'ownership', rows, running: true, error: undefined });
      }
      this._setView({ kind: 'ownership', rows, running: false, error: undefined });
    } catch (error) {
      this._setView({ kind: 'ownership', rows, running: false, error: String(error && (error as Error).message ? (error as Error).message : error) });
    }
  }

  private _renderResults(results: ICheckResult[], running: boolean): string {
    const rows: string = results.map((r: ICheckResult) => `<tr>
        <td class="${r.pass ? styles.ok : styles.softError}">${r.pass ? 'Pass' : 'Fail'}</td>
        <td>${escape(r.name)}</td>
        <td>${escape(r.expected)}</td>
        <td>${escape(r.actual)}</td>
      </tr>`).join('');
    return `<table class="${styles.results}">
        <thead><tr><th>Result</th><th>Test</th><th>Expected</th><th>What happened</th></tr></thead>
        <tbody>${rows}${running ? `<tr><td class="${styles.muted}" colspan="4">Working...</td></tr>` : ''}</tbody>
      </table>`;
  }

  private _renderChecked(view: { report: IAccessReport | undefined; results: ICheckResult[]; error: string | undefined; testRows: number | undefined; note: string | undefined }): string {
    const failed: number = view.results.filter((r: ICheckResult) => !r.pass).length;
    let summary: string;
    if (view.error) {
      summary = `<p class="${styles.softError}">The check stopped: ${escape(view.error)}</p>`;
    } else if (failed === 0) {
      summary = `<p class="${styles.ok}">All ${view.results.length} checks passed${view.report ? ` for ${escape(view.report.userTitle)} (${view.report.isOwner ? 'site owner' : 'ordinary user'})` : ''}.</p>`;
    } else {
      summary = `<p class="${styles.softError}">${failed} of ${view.results.length} checks failed${view.report ? ` for ${escape(view.report.userTitle)}` : ''}. HitCounter's permissions need attention: run Check and repair as a site owner.</p>`;
    }
    const cleanup: string = this._isOwner && view.testRows !== undefined && view.testRows > 0
      ? `<button class="${styles.secondary}" data-action="remove-test-rows">Remove ${view.testRows} test row(s)</button>`
      : '';
    return `${summary}${this._renderResults(view.results, false)}
      ${view.note ? `<p class="${styles.muted}">${escape(view.note)}</p>` : ''}
      <div class="${styles.actions}">
        <button class="${styles.secondary}" data-action="check">Run again</button>
        ${cleanup}
        <button class="${styles.secondary}" data-action="reload">Back</button>
      </div>`;
  }

  private _renderLog(log: IProgress[], running: boolean): string {
    const items: string = log.map((p: IProgress) =>
      `<li class="${p.level === 'error' ? styles.softError : p.level === 'warn' ? styles.warn : p.level === 'done' ? styles.ok : styles.muted}">${escape(p.message)}</li>`
    ).join('');
    return `<ol class="${styles.log}">${items}${running ? `<li class="${styles.muted}">Working...</li>` : ''}</ol>`;
  }

  // --------------------------------------------------------------- events

  /**
   * Listeners on the web part's own element, added once: they survive
   * re-renders (the inner HTML is replaced each time).
   */
  private _wireDelegatedEvents(): void {
    const root: HTMLElement = this.domElement;
    const tipBox = (): HTMLElement | null => root.querySelector('[data-tip-box]');
    const target = (e: Event): Element | null => {
      const el: Element | null = e.target as Element | null;
      return el && el.closest ? el.closest('[data-tip]') : null;
    };
    const hide = (): void => {
      const box: HTMLElement | null = tipBox();
      if (box) {
        box.style.display = 'none';
      }
      const cross: NodeListOf<SVGLineElement> = root.querySelectorAll('[data-crosshair]');
      for (let i = 0; i < cross.length; i++) {
        cross[i].style.display = 'none';
      }
    };
    const show = (el: Element, clientX: number, clientY: number): void => {
      const box: HTMLElement | null = tipBox();
      const section: Element | null = box ? box.parentElement : null;
      if (!box || !section) {
        return;
      }
      box.textContent = el.getAttribute('data-tip') || '';
      box.style.display = 'block';
      const area: ClientRect = section.getBoundingClientRect();
      const width: number = box.offsetWidth;
      let left: number = clientX - area.left + 14;
      if (left + width > area.width) {
        left = Math.max(0, clientX - area.left - width - 14);
      }
      box.style.left = `${left}px`;
      box.style.top = `${clientY - area.top + 14}px`;
      // Line charts: move the crosshair to the hovered day.
      const cx: string | null = el.getAttribute('data-cx');
      const svg: Element | null = el.closest ? el.closest('svg') : null;
      const cross: SVGLineElement | null = cx && svg ? svg.querySelector('[data-crosshair]') : null;
      if (cross && cx) {
        cross.setAttribute('x1', cx);
        cross.setAttribute('x2', cx);
        cross.style.display = 'inline';
      }
    };
    root.addEventListener('mousemove', (e: MouseEvent) => {
      const el: Element | null = target(e);
      if (el) {
        show(el, e.clientX, e.clientY);
      } else {
        hide();
      }
    });
    root.addEventListener('mouseleave', hide);
    root.addEventListener('focusin', (e: FocusEvent) => {
      const el: Element | null = target(e);
      if (el) {
        const r: ClientRect = el.getBoundingClientRect();
        show(el, r.left + r.width / 2, r.top + r.height / 2);
      }
    });
    root.addEventListener('focusout', hide);
    // <details> toggle doesn't bubble: listen in the capture phase.
    root.addEventListener('toggle', (e: Event) => {
      const el: HTMLDetailsElement = e.target as HTMLDetailsElement;
      const key: string | null = el && el.getAttribute ? el.getAttribute('data-open-key') : null;
      if (key) {
        this._open[key] = el.open;
      }
    }, true);
    root.addEventListener('input', (e: Event) => {
      const el: HTMLInputElement = e.target as HTMLInputElement;
      if (el && el.getAttribute && el.getAttribute('data-site-search')) {
        this._siteFilter = el.value;
        this.render();
        return;
      }
      const exportField: string | null = el && el.getAttribute ? el.getAttribute('data-export') : null;
      if (exportField === 'from' || exportField === 'to') {
        this._export = exportField === 'from' ? { ...this._export, from: el.value } : { ...this._export, to: el.value };
      }
    });
    root.addEventListener('click', (e: Event) => {
      const el: Element | null = e.target as Element | null;
      const sortButton: Element | null = el && el.closest ? el.closest('[data-sort]') : null;
      if (sortButton) {
        const key: SiteSortKey = sortButton.getAttribute('data-sort') as SiteSortKey;
        // Same column flips the order; a new column starts busiest-first (names A to Z).
        this._sort = this._sort.key === key
          ? { key, descending: !this._sort.descending }
          : { key, descending: key !== 'name' };
        this.render();
        return;
      }
      if (el && el.closest && el.closest('[data-action="toggle-sites"]')) {
        this._showAllSites = !this._showAllSites;
        this.render();
        return;
      }
      if (el && el.closest && el.closest('[data-action="archive-start"]') && this._lifecycle) {
        const lists: IActiveList[] = this._lifecycle.active.filter((l: IActiveList) => l.archivable && this._archivePick[l.id]);
        if (lists.length > 0) {
          this._setView({ kind: 'archive-confirm', lists });
        }
        return;
      }
      if (el && el.closest && el.closest('[data-action="export-run"]') && !this._export.busy) {
        this._runExport().catch(() => { /* handled inside */ });
        return;
      }
      if (el && el.closest && el.closest('[data-action="central-check"]')) {
        this._central = undefined;
        this._centralNote = undefined;
        this.render();
        this._readCentral().catch(() => { /* handled inside */ });
        return;
      }
      if (el && el.closest && el.closest('[data-action="central-start"]') && this._central && this._central.access === 'ok') {
        this._centralNote = undefined;
        this._setView({ kind: 'central-confirm', central: this._central, track: this._settings().trackCentralSite });
        return;
      }
      if (el && el.closest && el.closest('[data-action="central-run"]') && this._view.kind === 'central-confirm') {
        this._makeCentral(this._view.central, this._view.track).catch(() => { /* handled inside */ });
        return;
      }
      if (el && el.closest && el.closest('[data-action="archive-run"]') && this._view.kind === 'archive-confirm') {
        this._runArchive(this._view.lists).catch(() => { /* handled inside */ });
        return;
      }
      const del: Element | null = el && el.closest ? el.closest('[data-archive-delete]') : null;
      if (del && this._lifecycle) {
        const id: string | null = del.getAttribute('data-archive-delete');
        const archive: IArchiveList | undefined = this._lifecycle.archives.filter((a: IArchiveList) => a.id === id)[0];
        if (archive) {
          this._setView({ kind: 'recycle-confirm', archive });
        }
        return;
      }
      if (el && el.closest && el.closest('[data-action="recycle-run"]') && this._view.kind === 'recycle-confirm') {
        const archive: IArchiveList = this._view.archive;
        this._setView({ kind: 'recycled', message: `Deleting ${archive.title}...`, error: false });
        (this._retention as Retention).recycleNow(archive.id)
          .then((title: string) => this._setView({ kind: 'recycled', message: `${title} is in the site recycle bin. The dashboard's totals are unchanged.`, error: false }))
          .catch((error: Error) => this._setView({ kind: 'recycled', message: String(error && error.message ? error.message : error), error: true }));
      }
    });
    root.addEventListener('change', (e: Event) => {
      const box: HTMLInputElement = e.target as HTMLInputElement;
      const field: string | null = box && box.getAttribute ? box.getAttribute('data-export') : null;
      if (field) {
        // Kept in state so the 60-second live refresh doesn't wipe the form.
        const e = this._export;
        this._export = field === 'pages' ? { ...e, pages: box.checked, message: '' }
          : field === 'detail' ? { ...e, detail: box.value === 'month' ? 'month' : 'day', message: '' }
            : field === 'from' ? { ...e, from: box.value, message: '' }
              : { ...e, to: box.value, message: '' };
        return;
      }
      const pickId: string | null = box && box.getAttribute ? box.getAttribute('data-archive-pick') : null;
      if (pickId) {
        this._archivePick[pickId] = box.checked;
        this.render();
        return;
      }
      const el: HTMLSelectElement = e.target as HTMLSelectElement;
      if (el && el.getAttribute && el.getAttribute('data-site-select')) {
        this._selection = el.value;
        this.render();
      }
    });
  }

  private _wireEvents(): void {
    const setup: HTMLElement | null = this.domElement.querySelector('[data-action="setup"]');
    if (setup) {
      setup.addEventListener('click', () => { this._runSetup().catch(() => { /* handled inside */ }); });
    }
    const reload: HTMLElement | null = this.domElement.querySelector('[data-action="reload"]');
    if (reload) {
      reload.addEventListener('click', () => { this._load().catch(() => { /* handled inside */ }); });
    }
    const check: HTMLElement | null = this.domElement.querySelector('[data-action="check"]');
    if (check) {
      check.addEventListener('click', () => { this._runCheck().catch(() => { /* handled inside */ }); });
    }
    const update: HTMLElement | null = this.domElement.querySelector('[data-action="update-totals"]');
    if (update) {
      update.addEventListener('click', () => {
        const contact: string = this._view.kind === 'status' && this._view.status.settings ? this._view.status.settings.adminContact : '';
        this._runJob(contact).catch(() => { /* handled inside */ });
      });
    }
    const own: HTMLElement | null = this.domElement.querySelector('[data-action="ownership"]');
    if (own) {
      own.addEventListener('click', () => { this._runOwnership().catch(() => { /* handled inside */ }); });
    }
    const remove: HTMLElement | null = this.domElement.querySelector('[data-action="remove-test-rows"]');
    if (remove) {
      remove.addEventListener('click', () => { this._removeTestRows().catch(() => { /* handled inside */ }); });
    }
  }

  private async _runCheck(): Promise<void> {
    const results: ICheckResult[] = [];
    this._setView({ kind: 'checking', results });
    const checker: AccessCheck = this._accessCheck as AccessCheck;
    try {
      const report: IAccessReport = await checker.run(this._isOwner, (r: ICheckResult) => {
        results.push(r);
        this._setView({ kind: 'checking', results });
      });
      const testRows: number | undefined = this._isOwner ? await checker.countTestRows().catch(() => undefined) : undefined;
      this._setView({ kind: 'checked', report, results, error: undefined, testRows, note: undefined });
    } catch (error) {
      this._setView({ kind: 'checked', report: undefined, results, error: String(error && (error as Error).message ? (error as Error).message : error), testRows: undefined, note: undefined });
    }
  }

  private async _removeTestRows(): Promise<void> {
    if (this._view.kind !== 'checked') {
      return;
    }
    const current = this._view;
    try {
      const removed: number = await (this._accessCheck as AccessCheck).removeTestRows();
      this._setView({ ...current, testRows: 0, note: `Removed ${removed} test row(s).` });
    } catch (error) {
      this._setView({ ...current, note: `Couldn't remove the test rows: ${String(error && (error as Error).message ? (error as Error).message : error)}` });
    }
  }

  private _readSettingsForm(): IHitCounterSettings {
    const current: IHitCounterSettings = this._view.kind === 'status' && this._view.status.settings
      ? this._view.status.settings
      : defaultSettings();
    const track: HTMLInputElement | null = this.domElement.querySelector('[data-setting="trackCentralSite"]');
    const contact: HTMLInputElement | null = this.domElement.querySelector('[data-setting="adminContact"]');
    const background: HTMLInputElement | null = this.domElement.querySelector('[data-setting="backgroundUpdates"]');
    // Out-of-range or blank numbers keep the current value.
    const whole = (selector: string, min: number, max: number, fallback: number): number => {
      const input: HTMLInputElement | null = this.domElement.querySelector(selector);
      const value: number = input ? parseInt(input.value, 10) : NaN;
      return isNaN(value) || value < min || value > max ? fallback : value;
    };
    return {
      schemaVersion: SCHEMA_VERSION,
      recordHitsBy: 'everyone',
      trackCentralSite: track ? track.checked : current.trackCentralSite,
      sizeWarningRows: whole('[data-setting="sizeWarningRows"]', MIN_WARNING_ROWS, STRONG_WARNING_ROWS, current.sizeWarningRows),
      archiveRetentionYears: whole('[data-setting="archiveRetentionYears"]', 1, MAX_RETENTION_YEARS, current.archiveRetentionYears),
      adminContact: contact ? contact.value.trim() : current.adminContact,
      backgroundUpdates: background ? background.checked : current.backgroundUpdates
    };
  }

  private async _runArchive(lists: IActiveList[]): Promise<void> {
    const log: IProgress[] = [];
    this._setView({ kind: 'archiving', log });
    try {
      await (this._archiver as Archiver).run(lists.map((l: IActiveList) => l.id), this._settings(), (progress: IProgress) => {
        log.push(progress);
        this._setView({ kind: 'archiving', log });
      });
      this._archivePick = {};
      this._setView({ kind: 'archived', log, error: undefined });
    } catch (error) {
      const message: string = String(error && (error as Error).message ? (error as Error).message : error);
      log.push({ level: 'error', message });
      this._setView({ kind: 'archived', log, error: message });
    }
  }

  private async _runSetup(): Promise<void> {
    const settings: IHitCounterSettings = this._readSettingsForm();
    const log: IProgress[] = [];
    this._setView({ kind: 'running', log });
    try {
      await (this._provisioner as Provisioner).run(settings, (progress: IProgress) => {
        log.push(progress);
        this._setView({ kind: 'running', log });
      });
      this._setView({ kind: 'finished', log, error: undefined });
    } catch (error) {
      const message: string = String(error && (error as Error).message ? (error as Error).message : error);
      log.push({ level: 'error', message });
      this._setView({ kind: 'finished', log, error: message });
    }
  }

  // ---------------------------------------------------------------- theme

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme || !currentTheme.semanticColors) {
      return;
    }
    // Inverted (dark) sections get the dark chart steps, validated for a dark surface.
    const dark: boolean = !!currentTheme.isInverted;
    if (dark !== this._dark) {
      this._dark = dark;
      this.render();
    }
    const colors = currentTheme.semanticColors;
    this.domElement.style.setProperty('--hc-text', colors.bodyText || '');
    this.domElement.style.setProperty('--hc-subtle', colors.bodySubtext || '');
    this.domElement.style.setProperty('--hc-accent', colors.primaryButtonBackground || '');
    this.domElement.style.setProperty('--hc-accent-text', colors.primaryButtonText || '');
    this.domElement.style.setProperty('--hc-border', colors.bodyDivider || '');
    this.domElement.style.setProperty('--hc-surface', colors.bodyStandoutBackground || '');
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [] };
  }
}
