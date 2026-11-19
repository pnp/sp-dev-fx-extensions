/**
 * Dashboard figures (scope 8.1), with no SharePoint calls so they can be
 * unit-tested. Two sources are combined:
 *  - history: rows already in HitCounter_Summary (finished days and months);
 *  - live: the job's working state (counts and visitor sets for periods that
 *    are still open) plus rows read since, applied in memory only.
 * For any period the live state holds, live wins: it has every row up to the
 * moment, and its visitor sets give exact unique visitors.
 */
import { IIdSet, IPageTotals, IUtcKeys, IWorkingState, PeriodType, SummaryScope, countIds, periodSummaryKey, utcKeys } from './summaryModel';

export const TREND_DAYS: number = 30;
export const TREND_MONTHS: number = 12;
export const TOP_PAGES_SHOWN: number = 10;
/** Sites with their own colour. Further sites are drawn in the neutral "other" colour. */
export const SITE_COLOURS: number = 6;

const DAY_MS: number = 24 * 60 * 60 * 1000;

/** One row of HitCounter_Summary as the dashboard reads it. */
export interface IHistoryRow {
  Scope: string;
  SiteId?: string;
  SiteUrl?: string;
  SiteName?: string;
  PeriodType: string;
  PeriodKey: string;
  PageViews?: number;
  UniqueVisitors?: number;
}

export interface ICount {
  views: number;
  visitors: number;
}

export interface ISiteInfo {
  siteId: string;
  name: string;
  url: string;
  /** 0 to SITE_COLOURS-1, or -1 for the neutral "other" colour. */
  colour: number;
}

export interface IPoint extends ICount {
  /** yyyyMMdd or yyyyMM */
  key: string;
  label: string;
}

export interface IShare {
  siteId: string;
  name: string;
  views: number;
  colour: number;
}

export interface ITopPage {
  siteId: string;
  siteName: string;
  title: string;
  url: string;
  views: number;
  visitors: number;
  colour: number;
}

export interface ISiteRow {
  site: ISiteInfo;
  today: ICount;
  month: ICount;
  year: ICount;
}

export interface IDashboardModel {
  /** '' for all sites, otherwise a site ID. */
  selection: string;
  selectionName: string;
  keys: IUtcKeys;
  sites: ISiteInfo[];
  today: ICount;
  month: ICount;
  year: ICount;
  /** Oldest first, ending today. */
  days: IPoint[];
  /** Oldest first, ending this month. */
  months: IPoint[];
  /** This month's views by site; empty when one site is selected. */
  share: IShare[];
  topPages: ITopPage[];
  /** Per site, busiest this year first. */
  siteRows: ISiteRow[];
  allSitesRow: ISiteRow;
}

const MONTH_NAMES: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "18 Nov" for yyyyMMdd, "Nov 2026" for yyyyMM. */
export function periodLabel(key: string): string {
  const month: string = MONTH_NAMES[parseInt(key.substring(4, 6), 10) - 1] || key;
  return key.length === 8 ? `${parseInt(key.substring(6, 8), 10)} ${month}` : `${month} ${key.substring(0, 4)}`;
}

/** Day keys for the last `count` days, oldest first, ending on `now`'s UTC day. */
export function lastDayKeys(now: Date, count: number): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    keys.push(utcKeys(new Date(now.getTime() - i * DAY_MS)).day);
  }
  return keys;
}

/** Month keys for the last `count` months, oldest first, ending on `now`'s UTC month. */
export function lastMonthKeys(now: Date, count: number): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d: Date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(utcKeys(d).month);
  }
  return keys;
}

/** 1,284 / 12.9K / 4.2M: in full below 10,000, compact above. */
/**
 * A link target only if it is an https:// address, otherwise ''. Stored
 * addresses come from rows any internal user can write, so a javascript: or
 * data: address must never become a link, even if one got past the job.
 */
export function safeHref(url: string | undefined): string {
  const value: string = (url || '').trim();
  return /^https:\/\/[^\s"'<>]+$/i.test(value) ? value : '';
}

export function formatCount(value: number): string {
  const abs: number = Math.abs(value);
  const compact = (n: number, suffix: string): string => {
    const rounded: number = Math.round(n * 10) / 10;
    return (rounded >= 100 ? String(Math.round(n)) : String(rounded)) + suffix;
  };
  if (abs >= 1e9) {
    return compact(value / 1e9, 'B');
  }
  if (abs >= 1e6) {
    return compact(value / 1e6, 'M');
  }
  if (abs >= 1e4) {
    return compact(value / 1e3, 'K');
  }
  return value.toLocaleString('en-US');
}

function lastSegment(url: string): string {
  return url.replace(/\/+$/, '').split('/').pop() || url;
}

/** "just now", "5 minutes ago", "3 hours ago", "2 days ago". */
export function relativeTime(then: Date, now: Date): string {
  const minutes: number = Math.floor((now.getTime() - then.getTime()) / 60000);
  const plural = (n: number, unit: string): string => `${n} ${unit}${n === 1 ? '' : 's'} ago`;
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return plural(minutes, 'minute');
  }
  const hours: number = Math.floor(minutes / 60);
  if (hours < 48) {
    return plural(hours, 'hour');
  }
  return plural(Math.floor(hours / 24), 'day');
}

export type SiteSortKey = 'name' | 'todayViews' | 'todayVisitors' | 'monthViews' | 'monthVisitors' | 'yearViews' | 'yearVisitors';

/** Sites shown in the table before "Show all". */
export const SITES_SHOWN: number = 15;

function sortValue(row: ISiteRow, key: SiteSortKey): number {
  switch (key) {
    case 'todayViews': return row.today.views;
    case 'todayVisitors': return row.today.visitors;
    case 'monthViews': return row.month.views;
    case 'monthVisitors': return row.month.visitors;
    case 'yearVisitors': return row.year.visitors;
    default: return row.year.views;
  }
}

/** Sorted copy of the sites table. Ties fall back to the site name, A to Z. */
export function sortSiteRows(rows: ISiteRow[], key: SiteSortKey, descending: boolean): ISiteRow[] {
  const byName = (a: ISiteRow, b: ISiteRow): number => {
    const x: string = a.site.name.toLowerCase();
    const y: string = b.site.name.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  };
  return rows.slice().sort((a: ISiteRow, b: ISiteRow) => {
    const order: number = key === 'name' ? byName(a, b) : sortValue(a, key) - sortValue(b, key);
    return (descending ? -order : order) || byName(a, b);
  });
}

/** Sites whose name or address contains the text (case-insensitive); all sites for empty text. */
export function filterSites(sites: ISiteInfo[], text: string): ISiteInfo[] {
  const needle: string = text.trim().toLowerCase();
  if (!needle) {
    return sites;
  }
  return sites.filter((s: ISiteInfo) => s.name.toLowerCase().indexOf(needle) >= 0 || s.url.toLowerCase().indexOf(needle) >= 0);
}

export interface IDashboardOptions {
  /**
   * Site owner view (scope 9.1): only these sites, and "all" means these
   * sites added together, never the all-sites totals. Page views add up
   * exactly; visitors are added site by site, so a person who visited two
   * of the sites counts twice.
   */
  onlySites?: string[];
  /** Label for the combined figures, e.g. "All my sites". */
  allLabel?: string;
}

export function buildDashboard(history: IHistoryRow[], live: IWorkingState | undefined, selection: string, now: Date,
  options: IDashboardOptions = {}): IDashboardModel {
  const keys: IUtcKeys = utcKeys(now);
  let allowed: { [siteId: string]: boolean } | undefined;
  if (options.onlySites) {
    allowed = {};
    for (const id of options.onlySites) {
      allowed[id] = true;
    }
    // Owners never see all-sites rows, live state or other sites' rows.
    const only: { [siteId: string]: boolean } = allowed;
    history = history.filter((r: IHistoryRow) => r.Scope === 'Site' && !!r.SiteId && only[r.SiteId]);
    live = undefined;
  }
  const allLabel: string = options.allLabel || 'All sites';

  // History, keyed like the working state so both can be looked up the same way.
  const stored: { [summaryKey: string]: ICount } = {};
  const siteMap: { [siteId: string]: { name: string; url: string } } = {};
  for (const row of history) {
    if (row.Scope !== 'Site' && row.Scope !== 'AllSites') {
      continue;
    }
    const siteId: string = row.Scope === 'Site' ? row.SiteId || '' : '';
    if (row.Scope === 'Site') {
      if (!siteId) {
        continue;
      }
      const known: { name: string; url: string } = siteMap[siteId] = siteMap[siteId] || { name: '', url: '' };
      known.name = known.name || row.SiteName || '';
      known.url = known.url || row.SiteUrl || '';
    }
    stored[periodSummaryKey(row.Scope as SummaryScope, siteId, row.PeriodType as PeriodType, row.PeriodKey)] =
      { views: row.PageViews || 0, visitors: row.UniqueVisitors || 0 };
  }
  if (live) {
    for (const siteId in live.sites) {
      if (Object.prototype.hasOwnProperty.call(live.sites, siteId)) {
        const known: { name: string; url: string } = siteMap[siteId] = siteMap[siteId] || { name: '', url: '' };
        known.name = known.name || live.sites[siteId].name;
        known.url = live.sites[siteId].url || known.url;
      }
    }
  }

  const count = (scope: SummaryScope, siteId: string, type: PeriodType, key: string): ICount => {
    if (scope === 'AllSites' && allowed) {
      // Owner view: the owned sites added together.
      const sum: ICount = { views: 0, visitors: 0 };
      for (const id in siteMap) {
        if (Object.prototype.hasOwnProperty.call(siteMap, id)) {
          const c: ICount = count('Site', id, type, key);
          sum.views += c.views;
          sum.visitors += c.visitors;
        }
      }
      return sum;
    }
    const summaryKey: string = periodSummaryKey(scope, siteId, type, key);
    const open: { views: number; visitors: IIdSet } | undefined = live ? live.periods[summaryKey] : undefined;
    if (open) {
      return { views: open.views, visitors: countIds(open.visitors) };
    }
    return stored[summaryKey] || { views: 0, visitors: 0 };
  };

  const sites: ISiteInfo[] = [];
  for (const siteId in siteMap) {
    if (Object.prototype.hasOwnProperty.call(siteMap, siteId)) {
      const s: { name: string; url: string } = siteMap[siteId];
      sites.push({ siteId, name: s.name || lastSegment(s.url) || siteId, url: s.url, colour: -1 });
    }
  }
  const byUrl = (a: ISiteInfo, b: ISiteInfo): number =>
    a.url.toLowerCase() < b.url.toLowerCase() ? -1 : a.url.toLowerCase() > b.url.toLowerCase() ? 1 : a.siteId < b.siteId ? -1 : 1;
  // The six colours go to the six busiest sites this year; the rest share the
  // neutral colour. Independent of the site filter, so picking a site never
  // repaints the others, and stable because yearly totals change slowly.
  // Ties go by address. (Colouring by address alone left the busiest sites
  // grey in the P6 scale test.)
  const yearViews: { [siteId: string]: number } = {};
  sites.forEach((s: ISiteInfo) => { yearViews[s.siteId] = count('Site', s.siteId, 'Year', keys.year).views; });
  sites.slice()
    .sort((a: ISiteInfo, b: ISiteInfo) => yearViews[b.siteId] - yearViews[a.siteId] || byUrl(a, b))
    .forEach((s: ISiteInfo, i: number) => { s.colour = i < SITE_COLOURS ? i : -1; });
  // The picker lists sites A to Z by name.
  sites.sort((a: ISiteInfo, b: ISiteInfo) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : byUrl(a, b)));
  const byId: { [siteId: string]: ISiteInfo } = {};
  sites.forEach((s: ISiteInfo) => { byId[s.siteId] = s; });

  const chosen: ISiteInfo | undefined = selection ? byId[selection] : undefined;
  const scope: SummaryScope = chosen ? 'Site' : 'AllSites';
  const siteId: string = chosen ? chosen.siteId : '';

  const rowFor = (s: ISiteInfo | undefined): ISiteRow => {
    const sc: SummaryScope = s ? 'Site' : 'AllSites';
    const id: string = s ? s.siteId : '';
    return {
      site: s || { siteId: '', name: allLabel, url: '', colour: -1 },
      today: count(sc, id, 'Day', keys.day),
      month: count(sc, id, 'Month', keys.month),
      year: count(sc, id, 'Year', keys.year)
    };
  };
  const siteRows: ISiteRow[] = sites.map((s: ISiteInfo) => rowFor(s));
  siteRows.sort((a: ISiteRow, b: ISiteRow) => b.year.views - a.year.views || b.month.views - a.month.views || (a.site.name < b.site.name ? -1 : 1));

  const share: IShare[] = [];
  if (!chosen) {
    let other: number = 0;
    for (const r of siteRows) {
      if (r.month.views <= 0) {
        continue;
      }
      if (r.site.colour < 0) {
        other += r.month.views;
      } else {
        share.push({ siteId: r.site.siteId, name: r.site.name, views: r.month.views, colour: r.site.colour });
      }
    }
    share.sort((a: IShare, b: IShare) => b.views - a.views);
    if (other > 0) {
      share.push({ siteId: 'other', name: 'Other sites', views: other, colour: -1 });
    }
  }

  const topPages: ITopPage[] = [];
  if (live) {
    for (const key in live.pages) {
      if (!Object.prototype.hasOwnProperty.call(live.pages, key)) {
        continue;
      }
      const p: IPageTotals = live.pages[key];
      if (p.month !== keys.month || (chosen && p.siteId !== chosen.siteId)) {
        continue;
      }
      const site: ISiteInfo | undefined = byId[p.siteId];
      topPages.push({
        siteId: p.siteId,
        siteName: site ? site.name : '',
        title: p.title || lastSegment(p.url) || p.pageKey,
        url: p.url,
        views: p.views,
        visitors: countIds(p.visitors),
        colour: site ? site.colour : -1
      });
    }
    topPages.sort((a: ITopPage, b: ITopPage) => b.views - a.views || b.visitors - a.visitors || (a.title < b.title ? -1 : 1));
    topPages.splice(TOP_PAGES_SHOWN);
  }

  const point = (type: PeriodType, key: string): IPoint => {
    const c: ICount = count(scope, siteId, type, key);
    return { key, label: periodLabel(key), views: c.views, visitors: c.visitors };
  };
  const current: ISiteRow = rowFor(chosen);

  return {
    selection: chosen ? chosen.siteId : '',
    selectionName: chosen ? chosen.name : allLabel,
    keys,
    sites,
    today: current.today,
    month: current.month,
    year: current.year,
    days: lastDayKeys(now, TREND_DAYS).map((k: string) => point('Day', k)),
    months: lastMonthKeys(now, TREND_MONTHS).map((k: string) => point('Month', k)),
    share,
    topPages,
    siteRows,
    allSitesRow: rowFor(undefined)
  };
}
