import { SpRest } from '../../../shared/spRest';
import { MONTHLY_LIST_PREFIX, WORKING_LIBRARY } from '../../../shared/schema';
import { IHitRow, IWorkingState, applyRow, cleanHitRow, hostOf, monthOfListTitle, pruneRecent, parseWorkingState, utcKeys } from '../../../shared/summaryModel';

const WORKING_FILE: string = 'working.json';
const PAGE_SIZE: number = 2000;

interface IMonthlyList {
  Id: string;
  Title: string;
  month: number;
}

/**
 * Live figures for central admins (scope 8.1 step 3). Starts from the job's
 * working file, whose counts and cursors are always saved together, then
 * reads only rows added since and counts them in memory. Never writes
 * anything and never runs the job, so it is safe while the job is running
 * (here or in another admin's browser).
 */
export class LiveFeed {
  private readonly _rest: SpRest;
  private _state: IWorkingState | undefined;
  private _polledAll: boolean = false;
  private _busy: boolean = false;

  constructor(rest: SpRest) {
    this._rest = rest;
  }

  public get state(): IWorkingState | undefined {
    return this._state;
  }

  /** Reads the working file and every row not yet in it. */
  public async start(): Promise<number> {
    const library: { ServerRelativeUrl: string } = await this._rest.get(
      `/_api/web/lists/getbytitle('${SpRest.quote(WORKING_LIBRARY)}')/RootFolder?$select=ServerRelativeUrl`);
    this._state = parseWorkingState(await this._rest.readFile(`${library.ServerRelativeUrl}/${WORKING_FILE}`));
    this._polledAll = false;
    return this.poll();
  }

  /**
   * Counts rows added since the last poll. The first poll reads every monthly
   * list; later polls read only this month's and last month's lists, the only
   * ones new rows can arrive in. Returns the number of rows counted.
   */
  public async poll(): Promise<number> {
    const state: IWorkingState | undefined = this._state;
    if (!state || this._busy) {
      return 0;
    }
    this._busy = true;
    try {
      const now: number = utcKeys(new Date()).monthNumber;
      const previous: number = now === 1 ? 12 : now - 1;
      const result: { value: { Id: string; Title: string }[] } = await this._rest.get(
        `/_api/web/lists?$select=Id,Title&$filter=startswith(Title,'${MONTHLY_LIST_PREFIX}')`);
      const lists: IMonthlyList[] = result.value
        .map((l: { Id: string; Title: string }) => ({ Id: l.Id, Title: l.Title, month: monthOfListTitle(l.Title) }))
        .filter((l: IMonthlyList) => l.month > 0 && (!this._polledAll || l.month === now || l.month === previous));

      let counted: number = 0;
      for (const list of lists) {
        let more: boolean = true;
        while (more) {
          const cursor: number = state.cursors[list.Id] ? state.cursors[list.Id].lastId : 0;
          const page: { value: IHitRow[] } = await this._rest.get(
            `/_api/web/lists(guid'${list.Id}')/items?$select=Id,AuthorId,Created,SiteId,SiteUrl,PageKey,PageUrl,PageTitle` +
            `&$filter=Id gt ${cursor}&$orderby=Id&$top=${PAGE_SIZE}`);
          for (const row of page.value) {
            if (applyRow(state, list.Id, list.Title, list.month, cleanHitRow(row, hostOf(this._rest.webUrl))) === 'counted') {
              counted++;
            }
          }
          more = page.value.length === PAGE_SIZE;
        }
      }
      pruneRecent(state);
      this._polledAll = true;
      return counted;
    } finally {
      this._busy = false;
    }
  }
}
