/**
 * CSV export of stored totals (scope N1), with no SharePoint calls so it can
 * be unit-tested: which period keys a date range covers, how they're split
 * into queries, and how rows become a CSV file that opens safely in Excel.
 */
import { IHistoryRow } from './dashboardModel';

export type ExportDetail = 'day' | 'month';

/** Longest daily export, in days. Monthly exports have no limit. */
export const MAX_EXPORT_DAYS: number = 366;
/** Period keys per query: keeps every query's result well under the 5,000-item view threshold. */
export const KEYS_PER_QUERY: number = 7;

export interface IPageRow extends IHistoryRow {
  PageTitle?: string;
  PageUrl?: string;
}

export interface IExportRequest {
  detail: ExportDetail;
  /** yyyy-mm-dd (UTC), inclusive. */
  from: string;
  to: string;
  /** One site's ID, or '' for all sites. */
  siteId: string;
  /** Only these sites (site owners); undefined for central admins. */
  onlySites?: string[];
  /** Add the "All sites" rows (central admins, all sites). */
  allSites: boolean;
}

function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

/** Parses yyyy-mm-dd as a UTC date; undefined if it isn't a real date. */
export function parseDay(value: string): Date | undefined {
  const m: RegExpExecArray | null = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!m) {
    return undefined;
  }
  const d: Date = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? d : undefined;
}

export function dayInput(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

/** A reason the range can't be exported, or undefined. */
export function rangeProblem(detail: ExportDetail, from: string, to: string): string | undefined {
  const a: Date | undefined = parseDay(from);
  const b: Date | undefined = parseDay(to);
  if (!a || !b) {
    return 'Enter both dates.';
  }
  if (a.getTime() > b.getTime()) {
    return 'The start date is after the end date.';
  }
  if (detail === 'day' && (b.getTime() - a.getTime()) / 86400000 + 1 > MAX_EXPORT_DAYS) {
    return `A daily export can cover up to ${MAX_EXPORT_DAYS} days. Choose monthly, or a shorter range.`;
  }
  return undefined;
}

/** Summary PeriodKeys (yyyymmdd or yyyymm) covering the range, oldest first. */
export function periodKeys(detail: ExportDetail, from: string, to: string): string[] {
  const a: Date | undefined = parseDay(from);
  const b: Date | undefined = parseDay(to);
  const keys: string[] = [];
  if (!a || !b) {
    return keys;
  }
  if (detail === 'day') {
    for (let d: Date = a; d.getTime() <= b.getTime(); d = new Date(d.getTime() + 86400000)) {
      keys.push(`${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`);
    }
    return keys;
  }
  const last: number = b.getUTCFullYear() * 12 + b.getUTCMonth();
  for (let n: number = a.getUTCFullYear() * 12 + a.getUTCMonth(); n <= last; n++) {
    keys.push(`${Math.floor(n / 12)}${pad2(n % 12 + 1)}`);
  }
  return keys;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/** yyyymmdd -> yyyy-mm-dd, yyyymm -> yyyy-mm. */
export function periodLabelIso(key: string): string {
  return key.length === 8
    ? `${key.substring(0, 4)}-${key.substring(4, 6)}-${key.substring(6, 8)}`
    : `${key.substring(0, 4)}-${key.substring(4, 6)}`;
}

/**
 * One CSV field. Quotes when needed, and puts a ' before text starting with
 * = + - @ (or tab/CR) so a page title can't run as a spreadsheet formula.
 */
export function csvField(value: string | number | undefined): string {
  if (typeof value === 'number') {
    return String(value);
  }
  let text: string = value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvLine(fields: (string | number | undefined)[]): string {
  return fields.map(csvField).join(',');
}

function keep(row: IHistoryRow, request: IExportRequest): boolean {
  if (row.Scope === 'AllSites') {
    return request.allSites && !request.siteId;
  }
  if (row.Scope !== 'Site' || !row.SiteId) {
    return false;
  }
  if (request.onlySites && request.onlySites.indexOf(row.SiteId) < 0) {
    return false;
  }
  return !request.siteId || row.SiteId === request.siteId;
}

const BOM: string = '﻿';

/** Views and visitors per period and site: oldest period first, All sites first, then sites A to Z. */
export function totalsCsv(rows: IHistoryRow[], request: IExportRequest): string {
  const type: string = request.detail === 'day' ? 'Day' : 'Month';
  const wanted: { [key: string]: boolean } = {};
  periodKeys(request.detail, request.from, request.to).forEach((k: string) => { wanted[k] = true; });
  const picked: IHistoryRow[] = rows.filter((r: IHistoryRow) => r.PeriodType === type && wanted[r.PeriodKey] && keep(r, request));
  const name = (r: IHistoryRow): string => r.Scope === 'AllSites' ? '' : (r.SiteName || r.SiteUrl || r.SiteId || '').toLowerCase();
  picked.sort((x: IHistoryRow, y: IHistoryRow) => x.PeriodKey < y.PeriodKey ? -1 : x.PeriodKey > y.PeriodKey ? 1
    : name(x) < name(y) ? -1 : name(x) > name(y) ? 1 : 0);
  const lines: string[] = [csvLine([request.detail === 'day' ? 'Date (UTC)' : 'Month (UTC)', 'Site', 'Site URL', 'Page views', 'Visitors'])];
  for (const r of picked) {
    lines.push(csvLine([periodLabelIso(r.PeriodKey), r.Scope === 'AllSites' ? 'All sites' : (r.SiteName || r.SiteUrl),
      r.Scope === 'AllSites' ? '' : r.SiteUrl, r.PageViews || 0, r.UniqueVisitors || 0]));
  }
  return BOM + lines.join('\r\n') + '\r\n';
}

/** Top pages per month and site (the summary keeps each site's top 50 per month), busiest first. */
export function pagesCsv(rows: IPageRow[], request: IExportRequest): string {
  const wanted: { [key: string]: boolean } = {};
  periodKeys('month', request.from, request.to).forEach((k: string) => { wanted[k] = true; });
  const picked: IPageRow[] = rows.filter((r: IPageRow) => wanted[r.PeriodKey] && keep({ ...r, Scope: 'Site' }, request));
  picked.sort((x: IPageRow, y: IPageRow) => x.PeriodKey < y.PeriodKey ? -1 : x.PeriodKey > y.PeriodKey ? 1
    : (y.PageViews || 0) - (x.PageViews || 0));
  const lines: string[] = [csvLine(['Month (UTC)', 'Site', 'Site URL', 'Page title', 'Page URL', 'Page views', 'Visitors'])];
  for (const r of picked) {
    lines.push(csvLine([periodLabelIso(r.PeriodKey), r.SiteName || r.SiteUrl, r.SiteUrl, r.PageTitle, r.PageUrl, r.PageViews || 0, r.UniqueVisitors || 0]));
  }
  return BOM + lines.join('\r\n') + '\r\n';
}

/** File name such as hitcounter-daily-2026-11-01-to-2026-11-18.csv */
export function exportFileName(kind: 'daily' | 'monthly' | 'pages', from: string, to: string): string {
  return `hitcounter-${kind}-${from}-to-${to}.csv`;
}
