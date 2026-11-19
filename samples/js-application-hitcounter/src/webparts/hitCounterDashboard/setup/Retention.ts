import { SpRest } from '../../../shared/spRest';
import { MONTHLY_LIST_PREFIX, STATE_LIST, WORKING_LIBRARY } from '../../../shared/schema';
import { IWorkingState, parseWorkingState } from '../../../shared/summaryModel';
import { IArchiveRecord, isDueForDeletion, parseArchiveTitle } from '../../../shared/listLifecycle';

export interface IRetentionResult {
  /** Archives moved to the recycle bin. */
  recycled: string[];
  /** Archives due but kept, with the reason. */
  kept: { title: string; reason: string }[];
}

interface IStateRow {
  Id: number;
  Title: string;
  Data?: string;
}

/**
 * Archive retention (scope 8.5). Archives past the retention period go to the
 * site recycle bin (restorable for up to 93 days), never straight to
 * deletion, and only when every row in them was counted. Runs after each
 * successful summary job; an admin can also remove one archive early.
 */
export class Retention {
  private readonly _rest: SpRest;
  private readonly _userName: string;

  constructor(rest: SpRest, userName: string) {
    this._rest = rest;
    this._userName = userName;
  }

  /** Recycles every archive whose retention period is over. */
  public async run(retentionYears: number): Promise<IRetentionResult> {
    const result: IRetentionResult = { recycled: [], kept: [] };
    const records: { rows: IStateRow[]; serverNow: Date } = await this._records();
    const lists: { value: { Id: string; Title: string }[] } = await this._rest.get(
      `/_api/web/lists?$select=Id,Title&$filter=startswith(Title,'${MONTHLY_LIST_PREFIX}')`);
    let working: IWorkingState | undefined;
    for (const list of lists.value) {
      if (!parseArchiveTitle(list.Title)) {
        continue;
      }
      const row: IStateRow | undefined = this._recordFor(records.rows, list.Id);
      const record: IArchiveRecord | undefined = row ? this._parse(row) : undefined;
      // Server time, so a wrong PC clock can't delete an archive early.
      if (!record || !isDueForDeletion(record.archivedUtc, retentionYears, records.serverNow)) {
        continue;
      }
      working = working || await this._working();
      const problem: string | undefined = await this._uncounted(list.Id, working);
      if (problem) {
        result.kept.push({ title: list.Title, reason: problem });
        continue;
      }
      await this._recycle(list.Id, row as IStateRow, record);
      result.recycled.push(list.Title);
    }
    return result;
  }

  /** An admin removes one archive before its time (scope 8.5). */
  public async recycleNow(listId: string): Promise<string> {
    const info: { Id: string; Title: string } = await this._rest.get(`/_api/web/lists(guid'${listId}')?$select=Id,Title`);
    if (!parseArchiveTitle(info.Title)) {
      throw new Error(`${info.Title} is not a HitCounter archive.`);
    }
    const problem: string | undefined = await this._uncounted(info.Id, await this._working());
    if (problem) {
      throw new Error(`${info.Title} was kept: ${problem}`);
    }
    const records: { rows: IStateRow[]; serverNow: Date } = await this._records();
    const row: IStateRow | undefined = this._recordFor(records.rows, info.Id);
    await this._recycle(info.Id, row, row ? this._parse(row) : undefined);
    return info.Title;
  }

  // -------------------------------------------------------------- helpers

  private async _records(): Promise<{ rows: IStateRow[]; serverNow: Date }> {
    const r: { data: { value: IStateRow[] }; serverNow: Date } = await this._rest.getWithEtags(
      `/_api/web/lists/getbytitle('${SpRest.quote(STATE_LIST)}')/items?$select=Id,Title,Data` +
      `&$filter=${encodeURIComponent("startswith(Title,'Archive|')")}&$top=5000`);
    return { rows: r.data.value, serverNow: r.serverNow };
  }

  private _recordFor(rows: IStateRow[], listId: string): IStateRow | undefined {
    const key: string = `archive|${listId.toLowerCase()}`;
    return rows.filter((r: IStateRow) => r.Title.toLowerCase() === key)[0];
  }

  private _parse(row: IStateRow): IArchiveRecord | undefined {
    try {
      return JSON.parse(row.Data || '');
    } catch {
      return undefined;
    }
  }

  private async _working(): Promise<IWorkingState> {
    const library: { ServerRelativeUrl: string } = await this._rest.get(
      `/_api/web/lists/getbytitle('${SpRest.quote(WORKING_LIBRARY)}')/RootFolder?$select=ServerRelativeUrl`);
    return parseWorkingState(await this._rest.readFile(`${library.ServerRelativeUrl}/working.json`));
  }

  /** A reason to keep the archive if any of its rows was never counted, otherwise undefined. */
  private async _uncounted(listId: string, working: IWorkingState): Promise<string | undefined> {
    const newest: { value: { Id: number }[] } = await this._rest.get(
      `/_api/web/lists(guid'${listId}')/items?$select=Id&$orderby=Id desc&$top=1`);
    if (newest.value.length === 0) {
      return undefined;
    }
    const cursor: number = working.cursors[listId] ? working.cursors[listId].lastId : 0;
    return newest.value[0].Id > cursor
      ? `it holds rows the summary job never counted (row ${newest.value[0].Id}, counted up to ${cursor})`
      : undefined;
  }

  private async _recycle(listId: string, row: IStateRow | undefined, record: IArchiveRecord | undefined): Promise<void> {
    await this._rest.post(`/_api/web/lists(guid'${listId}')/recycle`);
    if (row && record) {
      const updated: IArchiveRecord = { ...record, recycledUtc: new Date().toISOString(), recycledBy: this._userName };
      await this._rest.updateItem(STATE_LIST, row.Id, { Data: JSON.stringify(updated) });
    }
  }
}
