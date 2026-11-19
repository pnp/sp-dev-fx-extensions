import { SpRest } from '../../../shared/spRest';
import { PAGE_SUMMARY_LIST, SUMMARY_LIST } from '../../../shared/schema';
import { IHistoryRow } from '../../../shared/dashboardModel';
import { ExportDetail, IPageRow, KEYS_PER_QUERY, chunk, periodKeys } from '../../../shared/exportCsv';

const SELECT: string = 'Scope,SiteId,SiteUrl,SiteName,PeriodType,PeriodKey,PageViews,UniqueVisitors';
const PARALLEL: number = 4;
const PAGE_SIZE: number = 5000;

/**
 * Reads stored totals for a CSV export (scope N1). Like the dashboard, each
 * query filters on one indexed column (PeriodKey) with a few keys at a time,
 * so it keeps working once the lists pass the 5,000-item view threshold.
 */
export class Exporter {
  private readonly _rest: SpRest;

  constructor(rest: SpRest) {
    this._rest = rest;
  }

  /** Day or Month rows from HitCounter_Summary for the range. */
  public totals(detail: ExportDetail, from: string, to: string, onProgress: (done: number, total: number) => void): Promise<IHistoryRow[]> {
    return this._read<IHistoryRow>(SUMMARY_LIST, SELECT, chunk(periodKeys(detail, from, to), KEYS_PER_QUERY), onProgress);
  }

  /** Top-page rows from HitCounter_PageSummary (monthly), one month per query. */
  public pages(from: string, to: string, onProgress: (done: number, total: number) => void): Promise<IPageRow[]> {
    return this._read<IPageRow>(PAGE_SUMMARY_LIST, `${SELECT},PageTitle,PageUrl`, chunk(periodKeys('month', from, to), 1), onProgress);
  }

  private async _read<T>(list: string, select: string, groups: string[][], onProgress: (done: number, total: number) => void): Promise<T[]> {
    const rows: T[] = [];
    let next: number = 0;
    let done: number = 0;
    onProgress(0, groups.length);
    const worker = async (): Promise<void> => {
      while (next < groups.length) {
        const keys: string[] = groups[next++];
        const filter: string = keys.map((k: string) => `PeriodKey eq '${k}'`).join(' or ');
        const result: { value: T[] } = await this._rest.get(
          `/_api/web/lists/getbytitle('${SpRest.quote(list)}')/items?$select=${select}&$filter=${encodeURIComponent(filter)}&$top=${PAGE_SIZE}`);
        if (result.value.length >= PAGE_SIZE) {
          throw new Error(`Too many rows for one request (${list}, ${keys[0]}). Export one site, or monthly instead of daily.`);
        }
        for (const row of result.value) {
          rows.push(row);
        }
        onProgress(++done, groups.length);
      }
    };
    const workers: Promise<void>[] = [];
    for (let i = 0; i < Math.min(PARALLEL, groups.length); i++) {
      workers.push(worker());
    }
    await Promise.all(workers);
    return rows;
  }
}
