/**
 * Summary job counting rules (scope 8.2), with no SharePoint calls so they can
 * be unit-tested. The job keeps one working state: counts, distinct-visitor
 * sets and, per monthly list, the last row ID processed. Counts and cursors
 * live in the same object and are saved together, so a rerun or resumed run
 * never counts a row twice.
 */
import { DEDUPE_WINDOW_MS } from '../extensions/hitCounterTracker/hitUtils';

export const WORKING_VERSION: number = 1;
export const TOP_PAGES_PER_SITE: number = 50;

/** Set of numeric user IDs, stored as an object so it serialises to JSON and needs no ES6 Set. */
export interface IIdSet { [userId: string]: 1 }

export type PeriodType = 'Day' | 'Month' | 'Year';
export type SummaryScope = 'Site' | 'AllSites';

export interface IPeriodTotals {
  scope: SummaryScope;
  /** Empty for AllSites. */
  siteId: string;
  type: PeriodType;
  /** yyyyMMdd, yyyyMM or yyyy. */
  key: string;
  views: number;
  visitors: IIdSet;
}

export interface IPageTotals {
  siteId: string;
  pageKey: string;
  /** yyyyMM */
  month: string;
  url: string;
  title: string;
  views: number;
  visitors: IIdSet;
}

export interface IWorkingState {
  version: number;
  /** Per monthly list, keyed by the list's GUID so a recreated list starts again at row 0. */
  cursors: { [listId: string]: { title: string; lastId: number } };
  /** Keyed by summary key, e.g. Site|{siteId}|Day|20261118. */
  periods: { [summaryKey: string]: IPeriodTotals };
  /** Keyed by page summary key, e.g. Page|{siteId}|{pageKey}|Month|202611. */
  pages: { [pageSummaryKey: string]: IPageTotals };
  sites: { [siteId: string]: { url: string; name: string } };
  /** Item IDs of rows already written, to update instead of re-creating. */
  itemIds: { [summaryKey: string]: number };
  /** Keys changed since the last successful summary write. */
  dirty: { [summaryKey: string]: 1 };
  /** Rows whose Created month didn't match their list (wrong device clock), never counted. */
  skipped: number;
  processed: number;
  lastRunUtc: string;
  /**
   * Last counted view per person, site and page (ms, server time), for the
   * 30-second repeat rule. Trimmed to the last 30 seconds by pruneRecent.
   */
  recent: { [userSitePage: string]: number };
  /** Newest Created time seen (ms), the reference for trimming recent. */
  recentNewest: number;
  /** Rows ignored as repeats within 30 seconds. */
  duplicates: number;
}

/** One row from a monthly list, as the job reads it. */
export interface IHitRow {
  Id: number;
  AuthorId: number;
  /** Server time, ISO UTC. The reporting time. */
  Created: string;
  SiteId?: string;
  SiteUrl?: string;
  PageKey?: string;
  PageUrl?: string;
  PageTitle?: string;
}

const GUID_PATTERN: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** The tracker's page key: two 32-bit FNV-1a hashes as 16 hex digits. */
const PAGE_KEY_PATTERN: RegExp = /^[0-9a-f]{16}$/i;
const MAX_TITLE: number = 255;

/** The address if it is https:// on the given host (the tenant's SharePoint host), otherwise ''. */
export function tenantUrl(value: string | undefined, host: string): string {
  const url: string = (value || '').trim();
  const m: RegExpExecArray | null = /^https:\/\/([^/?#]+)(?:[/?#]|$)/i.exec(url);
  return m && m[1].toLowerCase() === host.toLowerCase() && url.length <= 2000 ? url : '';
}

/**
 * Checks a raw row before it is counted. Any internal user can add rows, so
 * every field they write is untrusted: SiteId must be a GUID (otherwise the
 * row is skipped, still moving the cursor on), PageKey must be the tracker's
 * hash (otherwise the page details are dropped but the view counts), URLs
 * must be https on the tenant's host, and titles are cut to 255 characters
 * without control characters. Id, AuthorId and Created are set by SharePoint.
 */
export function cleanHitRow(row: IHitRow, host: string): IHitRow {
  const siteId: string = (row.SiteId || '').trim().toLowerCase();
  if (!GUID_PATTERN.test(siteId)) {
    return { Id: row.Id, AuthorId: row.AuthorId, Created: row.Created, SiteId: '' };
  }
  const clean: IHitRow = { Id: row.Id, AuthorId: row.AuthorId, Created: row.Created, SiteId: siteId, SiteUrl: tenantUrl(row.SiteUrl, host) };
  const pageKey: string = (row.PageKey || '').trim().toLowerCase();
  if (PAGE_KEY_PATTERN.test(pageKey)) {
    clean.PageKey = pageKey;
    clean.PageUrl = tenantUrl(row.PageUrl, host);
    // eslint-disable-next-line no-control-regex
    clean.PageTitle = (row.PageTitle || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().substring(0, MAX_TITLE);
  }
  return clean;
}

/** The host part of an absolute URL, e.g. contoso.sharepoint.com. */
export function hostOf(absoluteUrl: string): string {
  const m: RegExpExecArray | null = /^https?:\/\/([^/?#]+)/i.exec(absoluteUrl);
  return m ? m[1].toLowerCase() : '';
}

/** A row to write to HitCounter_Summary or HitCounter_PageSummary. */
export interface ISummaryRow {
  SummaryKey: string;
  Scope: string;
  SiteId: string;
  SiteUrl: string;
  SiteName: string;
  PeriodType: string;
  PeriodKey: string;
  PageViews: number;
  UniqueVisitors: number;
  PageKey?: string;
  PageUrl?: string;
  PageTitle?: string;
}

function pad2(value: number): string {
  return value < 10 ? '0' + value : String(value);
}

export function emptyWorkingState(): IWorkingState {
  return {
    version: WORKING_VERSION,
    cursors: {},
    periods: {},
    pages: {},
    sites: {},
    itemIds: {},
    dirty: {},
    skipped: 0,
    processed: 0,
    lastRunUtc: '',
    recent: {},
    recentNewest: 0,
    duplicates: 0
  };
}

/** Parses a saved working file, or starts fresh if it is missing or unreadable. */
export function parseWorkingState(text: string | undefined): IWorkingState {
  if (!text) {
    return emptyWorkingState();
  }
  try {
    const parsed: Partial<IWorkingState> = JSON.parse(text);
    if (!parsed || parsed.version !== WORKING_VERSION) {
      return emptyWorkingState();
    }
    const state: IWorkingState = emptyWorkingState();
    state.cursors = parsed.cursors || {};
    state.periods = parsed.periods || {};
    state.pages = parsed.pages || {};
    state.sites = parsed.sites || {};
    state.itemIds = parsed.itemIds || {};
    state.dirty = parsed.dirty || {};
    state.skipped = parsed.skipped || 0;
    state.processed = parsed.processed || 0;
    state.lastRunUtc = parsed.lastRunUtc || '';
    state.recent = parsed.recent || {};
    state.recentNewest = parsed.recentNewest || 0;
    state.duplicates = parsed.duplicates || 0;
    return state;
  } catch {
    return emptyWorkingState();
  }
}

export interface IUtcKeys {
  day: string;
  month: string;
  year: string;
  /** 1-12 */
  monthNumber: number;
}

export function utcKeys(date: Date): IUtcKeys {
  const year: string = String(date.getUTCFullYear());
  const month: string = year + pad2(date.getUTCMonth() + 1);
  return { day: month + pad2(date.getUTCDate()), month, year, monthNumber: date.getUTCMonth() + 1 };
}

export function periodSummaryKey(scope: SummaryScope, siteId: string, type: PeriodType, key: string): string {
  return scope === 'AllSites' ? `AllSites|${type}|${key}` : `Site|${siteId}|${type}|${key}`;
}

export function pageSummaryKey(siteId: string, pageKey: string, month: string): string {
  return `Page|${siteId}|${pageKey}|Month|${month}`;
}

function addToPeriod(state: IWorkingState, scope: SummaryScope, siteId: string, type: PeriodType, key: string, userId: string): void {
  const summaryKey: string = periodSummaryKey(scope, siteId, type, key);
  let totals: IPeriodTotals | undefined = state.periods[summaryKey];
  if (!totals) {
    totals = { scope, siteId: scope === 'AllSites' ? '' : siteId, type, key, views: 0, visitors: {} };
    state.periods[summaryKey] = totals;
  }
  totals.views++;
  totals.visitors[userId] = 1;
  state.dirty[summaryKey] = 1;
}

/**
 * Counts one row. Rows at or below the list's cursor are ignored, so feeding
 * the same rows twice never double counts. Returns 'counted', 'skipped'
 * (wrong month for the list) or 'already' (already processed).
 */
export function applyRow(
  state: IWorkingState,
  listId: string,
  listTitle: string,
  listMonth: number,
  row: IHitRow
): 'counted' | 'skipped' | 'already' | 'duplicate' {
  const cursor: { title: string; lastId: number } = state.cursors[listId] || { title: listTitle, lastId: 0 };
  state.cursors[listId] = cursor;
  cursor.title = listTitle;
  if (row.Id <= cursor.lastId) {
    return 'already';
  }
  cursor.lastId = row.Id;

  const created: Date = new Date(row.Created);
  const keys: IUtcKeys = utcKeys(created);
  if (isNaN(created.getTime()) || keys.monthNumber !== listMonth || !row.SiteId) {
    state.skipped++;
    return 'skipped';
  }

  const siteId: string = row.SiteId;
  const userId: string = String(row.AuthorId);

  // Same person, site and page again within 30 seconds of their last counted
  // view: a repeat, as the tracker itself would treat it. Uses SharePoint's
  // Created time, so rows added by hand (bypassing the tracker) can't inflate
  // the figures faster than a real visitor could.
  const at: number = created.getTime();
  const repeatKey: string = `${userId}|${siteId}|${row.PageKey || ''}`;
  const last: number | undefined = Object.prototype.hasOwnProperty.call(state.recent, repeatKey) ? state.recent[repeatKey] : undefined;
  state.recentNewest = Math.max(state.recentNewest, at);
  if (last !== undefined && at >= last && at - last < DEDUPE_WINDOW_MS) {
    state.duplicates++;
    return 'duplicate';
  }
  state.recent[repeatKey] = at;

  if (!state.sites[siteId]) {
    state.sites[siteId] = { url: row.SiteUrl || '', name: '' };
  } else if (row.SiteUrl) {
    state.sites[siteId].url = row.SiteUrl;
  }

  const types: { type: PeriodType; key: string }[] = [
    { type: 'Day', key: keys.day },
    { type: 'Month', key: keys.month },
    { type: 'Year', key: keys.year }
  ];
  for (const t of types) {
    addToPeriod(state, 'Site', siteId, t.type, t.key, userId);
    addToPeriod(state, 'AllSites', '', t.type, t.key, userId);
  }

  if (row.PageKey) {
    const pKey: string = pageSummaryKey(siteId, row.PageKey, keys.month);
    let page: IPageTotals | undefined = state.pages[pKey];
    if (!page) {
      page = { siteId, pageKey: row.PageKey, month: keys.month, url: row.PageUrl || '', title: row.PageTitle || '', views: 0, visitors: {} };
      state.pages[pKey] = page;
    }
    page.views++;
    page.visitors[userId] = 1;
    if (row.PageTitle) {
      page.title = row.PageTitle;
    }
    state.dirty[pKey] = 1;
  }

  state.processed++;
  return 'counted';
}

/** Drops repeat-rule entries more than 30 seconds older than the newest row seen. */
export function pruneRecent(state: IWorkingState): void {
  const cutoff: number = state.recentNewest - DEDUPE_WINDOW_MS;
  for (const key in state.recent) {
    if (Object.prototype.hasOwnProperty.call(state.recent, key) && state.recent[key] < cutoff) {
      delete state.recent[key];
    }
  }
}

export function countIds(set: IIdSet): number {
  let n: number = 0;
  for (const key in set) {
    if (Object.prototype.hasOwnProperty.call(set, key)) {
      n++;
    }
  }
  return n;
}

/** True once a period has ended (by UTC), so its totals can't change any more. */
export function isFinal(type: PeriodType, key: string, now: IUtcKeys): boolean {
  switch (type) {
    case 'Day': return key < now.day;
    case 'Month': return key < now.month;
    default: return key < now.year;
  }
}

export function toSummaryRow(state: IWorkingState, summaryKey: string, totals: IPeriodTotals): ISummaryRow {
  const site: { url: string; name: string } | undefined = totals.siteId ? state.sites[totals.siteId] : undefined;
  return {
    SummaryKey: summaryKey,
    Scope: totals.scope,
    SiteId: totals.siteId,
    SiteUrl: site ? site.url : '',
    SiteName: site ? site.name : 'All sites',
    PeriodType: totals.type,
    PeriodKey: totals.key,
    PageViews: totals.views,
    UniqueVisitors: countIds(totals.visitors)
  };
}

export function toPageSummaryRow(state: IWorkingState, summaryKey: string, page: IPageTotals): ISummaryRow {
  const site: { url: string; name: string } | undefined = state.sites[page.siteId];
  return {
    SummaryKey: summaryKey,
    Scope: 'Page',
    SiteId: page.siteId,
    SiteUrl: site ? site.url : '',
    SiteName: site ? site.name : '',
    PeriodType: 'Month',
    PeriodKey: page.month,
    PageViews: page.views,
    UniqueVisitors: countIds(page.visitors),
    PageKey: page.pageKey,
    PageUrl: page.url,
    PageTitle: page.title
  };
}

/** Page keys in the top N by views for each site and month. */
export function topPageKeys(state: IWorkingState, limit: number): { [pageSummaryKey: string]: 1 } {
  const groups: { [group: string]: { key: string; views: number }[] } = {};
  for (const key in state.pages) {
    if (Object.prototype.hasOwnProperty.call(state.pages, key)) {
      const page: IPageTotals = state.pages[key];
      const group: string = page.siteId + '|' + page.month;
      (groups[group] = groups[group] || []).push({ key, views: page.views });
    }
  }
  const top: { [pageSummaryKey: string]: 1 } = {};
  for (const group in groups) {
    if (Object.prototype.hasOwnProperty.call(groups, group)) {
      groups[group]
        .sort((a: { key: string; views: number }, b: { key: string; views: number }) => b.views - a.views || (a.key < b.key ? -1 : 1))
        .slice(0, limit)
        .forEach((p: { key: string }) => { top[p.key] = 1; });
    }
  }
  return top;
}

/** What the job must write after counting: rows to upsert and page rows to delete. */
export interface IWritePlan {
  upserts: ISummaryRow[];
  pageUpserts: ISummaryRow[];
  /** Page rows that dropped out of the top N: their item IDs to delete. */
  pageDeletes: { summaryKey: string; itemId: number }[];
}

export function buildWritePlan(state: IWorkingState): IWritePlan {
  const top: { [key: string]: 1 } = topPageKeys(state, TOP_PAGES_PER_SITE);
  const plan: IWritePlan = { upserts: [], pageUpserts: [], pageDeletes: [] };
  for (const key in state.dirty) {
    if (!Object.prototype.hasOwnProperty.call(state.dirty, key)) {
      continue;
    }
    if (state.periods[key]) {
      plan.upserts.push(toSummaryRow(state, key, state.periods[key]));
    } else if (state.pages[key]) {
      if (top[key]) {
        plan.pageUpserts.push(toPageSummaryRow(state, key, state.pages[key]));
      } else if (state.itemIds[key]) {
        plan.pageDeletes.push({ summaryKey: key, itemId: state.itemIds[key] });
      }
    }
  }
  // A page can leave the top N without being dirty itself (others overtook it).
  for (const key in state.pages) {
    if (Object.prototype.hasOwnProperty.call(state.pages, key) && !top[key] && state.itemIds[key] && !state.dirty[key]) {
      plan.pageDeletes.push({ summaryKey: key, itemId: state.itemIds[key] });
    }
  }
  return plan;
}

/**
 * After a successful write: clears the dirty flags and drops periods and
 * pages that have ended, since their totals are final and stored in the
 * summary lists. Keeps the state small.
 */
export function afterWrite(state: IWorkingState, now: IUtcKeys): void {
  state.dirty = {};
  for (const key in state.periods) {
    if (Object.prototype.hasOwnProperty.call(state.periods, key)) {
      const p: IPeriodTotals = state.periods[key];
      if (isFinal(p.type, p.key, now)) {
        delete state.periods[key];
        delete state.itemIds[key];
      }
    }
  }
  for (const key in state.pages) {
    if (Object.prototype.hasOwnProperty.call(state.pages, key) && isFinal('Month', state.pages[key].month, now)) {
      delete state.pages[key];
      delete state.itemIds[key];
    }
  }
}

/** Month number (1-12) of a monthly list title such as hitcounter_11, or 0. */
export function monthOfListTitle(title: string): number {
  const match: RegExpExecArray | null = /^hitcounter_(\d{2})$/i.exec(title);
  if (!match) {
    return 0;
  }
  const n: number = parseInt(match[1], 10);
  return n >= 1 && n <= 12 ? n : 0;
}
