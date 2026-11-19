import { SpRest } from '../../../shared/spRest';
import { MONTHLY_LIST_PREFIX, STATE_LIST } from '../../../shared/schema';
import { IArchiveRecord, IListFacts, ILifecycle, classifyLists } from '../../../shared/listLifecycle';

export interface ILifecycleView extends ILifecycle {
  /** Archive records from HitCounter_State, keyed by list ID (lower case). */
  records: { [listId: string]: IArchiveRecord };
}

interface IListRow {
  Id: string;
  Title: string;
  ItemCount: number;
  RootFolder?: { ServerRelativeUrl: string };
}

/**
 * Reads monthly list sizes, the years each one holds, and archive records
 * (scope 8.3). Central admins only: the lists and the state list are
 * readable by this site's owners only.
 */
export class LifecycleReader {
  private readonly _rest: SpRest;

  constructor(rest: SpRest) {
    this._rest = rest;
  }

  public async read(warnAt: number, now: Date = new Date()): Promise<ILifecycleView> {
    const result: { value: IListRow[] } = await this._rest.get(
      `/_api/web/lists?$select=Id,Title,ItemCount,RootFolder/ServerRelativeUrl&$expand=RootFolder` +
      `&$filter=startswith(Title,'${MONTHLY_LIST_PREFIX}')`);
    const facts: IListFacts[] = result.value.map((l: IListRow) => ({
      id: l.Id, title: l.Title, itemCount: l.ItemCount, url: l.RootFolder ? l.RootFolder.ServerRelativeUrl : ''
    }));

    // Years held: the oldest and newest rows (by ID, which follows time).
    await Promise.all(facts.filter((f: IListFacts) => f.itemCount > 0).map(async (f: IListFacts) => {
      const edge = async (order: string): Promise<number | undefined> => {
        const page: { value: { Created: string }[] } = await this._rest.get(
          `/_api/web/lists(guid'${f.id}')/items?$select=Created&$orderby=Id ${order}&$top=1`);
        return page.value.length > 0 ? new Date(page.value[0].Created).getUTCFullYear() : undefined;
      };
      f.firstYear = await edge('asc');
      f.lastYear = await edge('desc');
    }));

    const lifecycle: ILifecycle = classifyLists(facts, now.getUTCMonth() + 1, warnAt);
    const records: { [listId: string]: IArchiveRecord } = {};
    const state: { value: { Title: string; Data?: string }[] } = await this._rest.get(
      `/_api/web/lists/getbytitle('${SpRest.quote(STATE_LIST)}')/items?$select=Title,Data` +
      `&$filter=${encodeURIComponent("startswith(Title,'Archive|')")}&$top=5000`);
    for (const item of state.value) {
      try {
        const record: IArchiveRecord = JSON.parse(item.Data || '');
        if (record && record.listId) {
          records[record.listId.toLowerCase()] = record;
        }
      } catch {
        // A damaged record: the archive still shows, without its dates.
      }
    }
    return { ...lifecycle, records };
  }
}
