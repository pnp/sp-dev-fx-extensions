import { SpRest } from '../../../shared/spRest';
import { SUMMARY_LIST } from '../../../shared/schema';
import { IHistoryRow, TREND_DAYS, TREND_MONTHS, lastDayKeys, lastMonthKeys } from '../../../shared/dashboardModel';
import { utcKeys } from '../../../shared/summaryModel';

export interface IHistory {
  rows: IHistoryRow[];
  /** ISO time of the last summary job, or '' if it has never run. */
  lastUpdatedUtc: string;
  adminContact: string;
}

// Each query filters on ONE indexed column (PeriodKey or SummaryKey), so the
// queries keep working once the list passes the 5,000-item view threshold.
const SYSTEM_KEY: string = 'System|LastUpdated';
const SELECT: string = 'Scope,SiteId,SiteUrl,SiteName,PeriodType,PeriodKey,PageViews,UniqueVisitors';

/**
 * Reads stored totals from HitCounter_Summary for the dashboard: the last
 * TREND_DAYS days, the last TREND_MONTHS months, this year, and the job's
 * last-updated row. PeriodKey is indexed, so each query stays under the list
 * view threshold while the matching rows do.
 */
export class SummaryReader {
  private readonly _rest: SpRest;

  constructor(rest: SpRest) {
    this._rest = rest;
  }

  public async read(now: Date = new Date()): Promise<IHistory> {
    const days: string[] = lastDayKeys(now, TREND_DAYS);
    const months: string[] = lastMonthKeys(now, TREND_MONTHS);
    const anyKey = (list: string[]): string => list.map((k: string) => `PeriodKey eq '${k}'`).join(' or ');

    // One indexed column per query: OR-ing two different indexed columns
    // (PeriodKey ... or SummaryKey ...) is refused once the list passes
    // 5,000 items (found in the P6 scale test, 11,191 rows).
    const results: { value: IHistoryRow[] }[] = await Promise.all([
      this._query(anyKey(days)),
      this._query(`${anyKey(months)} or PeriodKey eq '${utcKeys(now).year}'`),
      this._query(`SummaryKey eq '${SYSTEM_KEY}'`)
    ]);

    const history: IHistory = { rows: [], lastUpdatedUtc: '', adminContact: '' };
    for (const result of results) {
      for (const row of result.value) {
        if (row.Scope === 'System') {
          history.lastUpdatedUtc = row.PeriodKey;
          history.adminContact = row.SiteName || '';
        } else {
          history.rows.push(row);
        }
      }
    }
    return history;
  }

  private _query(filter: string): Promise<{ value: IHistoryRow[] }> {
    return this._rest.get(
      `/_api/web/lists/getbytitle('${SpRest.quote(SUMMARY_LIST)}')/items` +
      `?$select=${SELECT}&$filter=${encodeURIComponent(filter)}&$top=5000`);
  }
}
