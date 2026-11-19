import { SPHttpClient } from '@microsoft/sp-http';
import { SpRest } from '../../../shared/spRest';
import { PAGE_SUMMARY_LIST, STATE_LIST, SUMMARY_LIST, WORKING_LIBRARY } from '../../../shared/schema';
import {
  IHitRow,
  ISummaryRow,
  IWorkingState,
  IWritePlan,
  afterWrite,
  applyRow,
  buildWritePlan,
  cleanHitRow,
  hostOf,
  pruneRecent,
  tenantUrl,
  monthOfListTitle,
  parseWorkingState,
  utcKeys
} from '../../../shared/summaryModel';

const WORKING_FILE: string = 'working.json';
const LOCK_KEY: string = 'JobLock';
/** The lock is renewed after every page of rows and every RENEW_EVERY writes, so a short expiry is safe. */
const LOCK_MINUTES: number = 3;
const RENEW_EVERY: number = 30;
/** Totals written at the same time. SharePoint copes well; throttling is retried by SpRest. */
const WRITE_PARALLEL: number = 6;
const TAB_TOKEN_KEY: string = 'hitcounter.jobToken';
const PAGE_SIZE: number = 2000;
const SYSTEM_KEY: string = 'System|LastUpdated';
const DAY_MS: number = 24 * 60 * 60 * 1000;

export interface IJobResult {
  status: 'done' | 'locked';
  rowsCounted: number;
  rowsSkipped: number;
  /** Rows ignored as the same person and page again within 30 seconds. */
  rowsRepeated: number;
  rowsWritten: number;
  seconds: number;
  lockedBy?: string;
}

interface ILockData {
  token: string;
  holder: string;
  released?: boolean;
}

interface IStateItem {
  Id: number;
  Data?: string;
  Modified?: string;
  'odata.etag'?: string;
}

/**
 * The summary job (scope 8.2). Runs in a central admin's browser when the
 * dashboard opens. Takes a lock, reads only new rows from each monthly list,
 * saves counts and cursors together in HitCounter_Working/working.json after
 * every page of rows (so an interrupted run resumes), then writes totals to
 * the summary lists. Writes are keyed by SummaryKey, so repeating them is safe.
 */
export class SummaryJob {
  private readonly _rest: SpRest;
  private readonly _client: SPHttpClient;
  private readonly _userName: string;
  private readonly _token: string = String(new Date().getTime()) + '-' + String(Math.random()).substring(2, 10);
  private _lockItemId: number | undefined;
  private _folderUrl: string = '';
  private readonly _getDigest: () => Promise<string>;
  private _digest: string = '';

  constructor(rest: SpRest, client: SPHttpClient, userName: string, getDigest: () => Promise<string>) {
    this._rest = rest;
    this._client = client;
    this._userName = userName;
    this._getDigest = getDigest;
  }

  public async run(adminContact: string, onProgress: (message: string) => void): Promise<IJobResult> {
    const started: number = new Date().getTime();
    const result: IJobResult = { status: 'done', rowsCounted: 0, rowsSkipped: 0, rowsRepeated: 0, rowsWritten: 0, seconds: 0 };

    const lock: { ok: boolean; holder?: string } = await this._takeLock();
    if (!lock.ok) {
      result.status = 'locked';
      result.lockedBy = lock.holder;
      return result;
    }
    try {
      // Kept for releaseOnUnload, which can't wait for a digest request.
      this._digest = await this._getDigest().catch(() => '');
      const library: { ServerRelativeUrl: string } = await this._rest.get(
        `/_api/web/lists/getbytitle('${SpRest.quote(WORKING_LIBRARY)}')/RootFolder?$select=ServerRelativeUrl`);
      this._folderUrl = library.ServerRelativeUrl;
      const state: IWorkingState = parseWorkingState(await this._rest.readFile(`${this._folderUrl}/${WORKING_FILE}`));
      const skippedBefore: number = state.skipped;
      const repeatedBefore: number = state.duplicates;

      // 1. Count new rows in every active monthly list.
      const lists: { value: { Id: string; Title: string }[] } = await this._rest.get(
        `/_api/web/lists?$select=Id,Title&$filter=startswith(Title,'hitcounter_')`);
      for (const list of lists.value) {
        const month: number = monthOfListTitle(list.Title);
        if (!month) {
          continue;
        }
        let more: boolean = true;
        while (more) {
          const cursor: number = state.cursors[list.Id] ? state.cursors[list.Id].lastId : 0;
          const page: { value: IHitRow[] } = await this._rest.get(
            `/_api/web/lists(guid'${list.Id}')/items?$select=Id,AuthorId,Created,SiteId,SiteUrl,PageKey,PageUrl,PageTitle` +
            `&$filter=Id gt ${cursor}&$orderby=Id&$top=${PAGE_SIZE}`);
          for (const row of page.value) {
            // Rows are written by any internal user: checked before counting.
            if (applyRow(state, list.Id, list.Title, month, cleanHitRow(row, hostOf(this._rest.webUrl))) === 'counted') {
              result.rowsCounted++;
            }
          }
          more = page.value.length === PAGE_SIZE;
          if (page.value.length > 0) {
            onProgress(`${list.Title}: read up to row ${state.cursors[list.Id].lastId}`);
            pruneRecent(state);
            // Counts and cursor saved together: an interrupted run resumes here.
            await this._renewLock(); // Check it's still ours before saving.
            await this._save(state);
          }
        }
      }
      result.rowsSkipped = state.skipped - skippedBefore;
      result.rowsRepeated = state.duplicates - repeatedBefore;

      // 2. Names for sites seen for the first time.
      await this._fillSiteNames(state);
      await this._save(state);

      // 3. Write totals. Safe to repeat: rows are matched on SummaryKey.
      const plan: IWritePlan = buildWritePlan(state);
      const total: number = plan.upserts.length + plan.pageUpserts.length;
      if (total > 0) {
        onProgress(`Writing ${total} total(s)`);
      }
      // Find existing rows in bulk (one query per period, not one per total),
      // then write WRITE_PARALLEL at a time, renewing the lock between groups.
      await this._prefetchIds(state, SUMMARY_LIST, plan.upserts);
      await this._prefetchIds(state, PAGE_SUMMARY_LIST, plan.pageUpserts);
      const writes: { list: string; row: ISummaryRow }[] = plan.upserts.map((row: ISummaryRow) => ({ list: SUMMARY_LIST, row }))
        .concat(plan.pageUpserts.map((row: ISummaryRow) => ({ list: PAGE_SUMMARY_LIST, row })));
      for (let start = 0; start < writes.length; start += RENEW_EVERY) {
        const group: { list: string; row: ISummaryRow }[] = writes.slice(start, start + RENEW_EVERY);
        await SummaryJob._parallel(group, WRITE_PARALLEL, (w: { list: string; row: ISummaryRow }) => this._upsert(state, w.list, w.row));
        result.rowsWritten += group.length;
        onProgress(`Writing totals: ${result.rowsWritten} of ${writes.length}`);
        await this._renewLock();
      }
      for (const d of plan.pageDeletes) {
        try {
          await this._rest.del(`/_api/web/lists/getbytitle('${SpRest.quote(PAGE_SUMMARY_LIST)}')/items(${d.itemId})`);
        } catch (error) {
          if ((error as { status?: number }).status !== 404) {
            throw error;
          }
        }
        delete state.itemIds[d.summaryKey];
      }
      const now: Date = new Date();
      await this._upsert(state, SUMMARY_LIST, {
        SummaryKey: SYSTEM_KEY, Scope: 'System', SiteId: '', SiteUrl: '', SiteName: adminContact,
        PeriodType: 'System', PeriodKey: now.toISOString(), PageViews: 0, UniqueVisitors: 0
      });

      // Still ours? Never overwrite the working file of a job that took over.
      await this._renewLock();

      // 4. Drop periods that ended more than a day ago (late rows can no longer arrive).
      afterWrite(state, utcKeys(new Date(now.getTime() - DAY_MS)));
      state.lastRunUtc = now.toISOString();
      await this._save(state);
    } finally {
      await this._releaseLock();
    }
    result.seconds = Math.round((new Date().getTime() - started) / 100) / 10;
    return result;
  }

  // ------------------------------------------------------------- writing

  private async _save(state: IWorkingState): Promise<void> {
    await this._rest.writeFile(this._folderUrl, WORKING_FILE, JSON.stringify(state));
  }

  private _fields(row: ISummaryRow): { [name: string]: unknown } {
    const fields: { [name: string]: unknown } = {
      SummaryKey: row.SummaryKey,
      Scope: row.Scope,
      SiteId: row.SiteId,
      SiteUrl: row.SiteUrl,
      SiteName: row.SiteName,
      PeriodType: row.PeriodType,
      PeriodKey: row.PeriodKey,
      PageViews: row.PageViews,
      UniqueVisitors: row.UniqueVisitors
    };
    if (row.PageKey !== undefined) {
      fields.PageKey = row.PageKey;
      fields.PageUrl = row.PageUrl;
      fields.PageTitle = row.PageTitle;
    }
    return fields;
  }

  /** Updates the row with this SummaryKey, or creates it. */
  private async _upsert(state: IWorkingState, listTitle: string, row: ISummaryRow): Promise<void> {
    const fields: { [name: string]: unknown } = this._fields(row);
    let id: number | undefined = state.itemIds[row.SummaryKey];
    if (id !== undefined) {
      try {
        await this._rest.updateItem(listTitle, id, fields);
        return;
      } catch (error) {
        if ((error as { status?: number }).status !== 404) {
          throw error;
        }
        id = undefined; // Row was deleted by hand: find or create it again.
      }
    }
    const existing: { value: { Id: number }[] } = await this._rest.get(
      `/_api/web/lists/getbytitle('${SpRest.quote(listTitle)}')/items?$select=Id` +
      `&$filter=SummaryKey eq '${encodeURIComponent(row.SummaryKey.replace(/'/g, "''"))}'&$top=1`);
    if (existing.value.length > 0) {
      id = existing.value[0].Id;
      await this._rest.updateItem(listTitle, id, fields);
    } else {
      id = await this._rest.addItem(listTitle, fields);
    }
    // The job awaits each write in turn, so nothing else changes state meanwhile.
    // eslint-disable-next-line require-atomic-updates
    state.itemIds[row.SummaryKey] = id;
  }

  /**
   * Fills state.itemIds for rows about to be written, with one query per
   * period key (PeriodKey is indexed), so each write is a single request.
   */
  private async _prefetchIds(state: IWorkingState, listTitle: string, rows: ISummaryRow[]): Promise<void> {
    const periods: { [periodKey: string]: 1 } = {};
    for (const row of rows) {
      if (state.itemIds[row.SummaryKey] === undefined) {
        periods[row.PeriodKey] = 1;
      }
    }
    for (const periodKey in periods) {
      if (!Object.prototype.hasOwnProperty.call(periods, periodKey)) {
        continue;
      }
      let path: string | undefined = `/_api/web/lists/getbytitle('${SpRest.quote(listTitle)}')/items?$select=Id,SummaryKey` +
        `&$filter=${encodeURIComponent(`PeriodKey eq '${periodKey.replace(/'/g, "''")}'`)}&$top=5000`;
      while (path) {
        const page: { value: { Id: number; SummaryKey: string }[]; 'odata.nextLink'?: string } = await this._rest.get(path);
        for (const item of page.value) {
          if (item.SummaryKey && state.itemIds[item.SummaryKey] === undefined) {
            state.itemIds[item.SummaryKey] = item.Id;
          }
        }
        const next: string | undefined = page['odata.nextLink'];
        path = next && next.indexOf(this._rest.webUrl) === 0 ? next.substring(this._rest.webUrl.length) : undefined;
      }
    }
  }

  /** Runs `work` over items, at most `limit` at a time. */
  private static async _parallel<T>(items: T[], limit: number, work: (item: T) => Promise<void>): Promise<void> {
    let next: number = 0;
    const lane = async (): Promise<void> => {
      while (next < items.length) {
        const item: T = items[next++];
        await work(item);
      }
    };
    const lanes: Promise<void>[] = [];
    for (let i = 0; i < Math.min(limit, items.length); i++) {
      lanes.push(lane());
    }
    await Promise.all(lanes);
  }

  private async _fillSiteNames(state: IWorkingState): Promise<void> {
    for (const siteId in state.sites) {
      if (!Object.prototype.hasOwnProperty.call(state.sites, siteId) || state.sites[siteId].name) {
        continue;
      }
      const site: { url: string; name: string } = state.sites[siteId];
      let name: string = '';
      // Only ever ask this tenant's SharePoint, never an address from a row.
      if (tenantUrl(site.url, hostOf(this._rest.webUrl))) {
        try {
          const web: { Title: string } = await new SpRest(this._client, site.url).get('/_api/web?$select=Title');
          name = web.Title;
        } catch {
          // No access to that site: fall back to the last part of its address.
        }
      }
      site.name = name || site.url.replace(/\/+$/, '').split('/').pop() || site.url;
    }
  }

  // ---------------------------------------------------------------- lock

  private async _readLock(): Promise<{ item: IStateItem | undefined; serverNow: Date }> {
    const result: { data: { value: IStateItem[] }; serverNow: Date } = await this._rest.getWithEtags(
      `/_api/web/lists/getbytitle('${SpRest.quote(STATE_LIST)}')/items?$select=Id,Data,Modified&$filter=Title eq '${LOCK_KEY}'&$top=1`);
    return { item: result.data.value.length > 0 ? result.data.value[0] : undefined, serverNow: result.serverNow };
  }

  private _lockData(released: boolean): string {
    const data: ILockData = { token: this._token, holder: this._userName, released };
    return JSON.stringify(data);
  }

  /**
   * Takes the lock unless another run holds it. A lock is held until it is
   * released or LOCK_MINUTES after its last renewal, measured in SharePoint's
   * time (the item's Modified vs the server's Date header), so admins' PC
   * clocks don't matter. Uses the ETag so two admins can't both win.
   */
  private async _takeLock(): Promise<{ ok: boolean; holder?: string }> {
    const lock: { item: IStateItem | undefined; serverNow: Date } = await this._readLock();
    const item: IStateItem | undefined = lock.item;
    if (!item) {
      try {
        this._lockItemId = await this._rest.addItem(STATE_LIST, { Title: LOCK_KEY, Data: this._lockData(false) });
        this._rememberToken();
        return { ok: true };
      } catch {
        // Title is unique: someone else created the lock row at the same moment.
        return { ok: false, holder: 'another central admin' };
      }
    }
    let current: ILockData | undefined;
    try {
      current = item.Data ? JSON.parse(item.Data) : undefined;
    } catch {
      current = undefined;
    }
    const modified: number = item.Modified ? new Date(item.Modified).getTime() : 0;
    const fresh: boolean = modified + LOCK_MINUTES * 60000 > lock.serverNow.getTime();
    // A lock left by an earlier page in this same tab (refreshed mid-update)
    // is abandoned: that page is gone, so take it over without waiting.
    const ownEarlierPage: boolean = !!current && current.token === SummaryJob._tabToken();
    if (current && !current.released && current.token !== this._token && fresh && !ownEarlierPage) {
      return { ok: false, holder: current.holder };
    }
    try {
      await this._rest.updateItem(STATE_LIST, item.Id, { Data: this._lockData(false) }, item['odata.etag']);
      this._lockItemId = item.Id;
      this._rememberToken();
      return { ok: true };
    } catch (error) {
      if ((error as { status?: number }).status === 412) {
        return { ok: false, holder: 'another central admin' };
      }
      throw error;
    }
  }

  /**
   * Renews the lock, first checking it is still ours. If it expired (for
   * example during a long throttling wait) and another admin's job took it,
   * this run stops: that job carries on from the shared working file, so
   * nothing is counted twice.
   */
  /** The lock token of the last run in this browser tab (sessionStorage is per tab). */
  private static _tabToken(): string {
    try {
      return window.sessionStorage.getItem(TAB_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  }

  private _rememberToken(): void {
    try {
      window.sessionStorage.setItem(TAB_TOKEN_KEY, this._token);
    } catch {
      // Storage blocked: the lock simply expires as before.
    }
  }

  private async _renewLock(): Promise<void> {
    if (this._lockItemId === undefined) {
      return;
    }
    const lock: { item: IStateItem | undefined } = await this._readLock();
    let current: ILockData | undefined;
    try {
      current = lock.item && lock.item.Data ? JSON.parse(lock.item.Data) : undefined;
    } catch {
      current = undefined;
    }
    if (!lock.item || !current || current.token !== this._token) {
      this._lockItemId = undefined; // Not ours any more: don't release it either.
      throw new Error(`stopped because ${current ? current.holder : 'another central admin'} took over the update`);
    }
    // Rewriting the item moves its Modified time on, which renews the lock.
    // The ETag makes sure nobody took it between the read and this write.
    await this._rest.updateItem(STATE_LIST, this._lockItemId, { Data: this._lockData(false) }, lock.item['odata.etag']);
  }

  /**
   * Best-effort release when the page is closed or refreshed mid-run, so the
   * next load needn't wait for the lock to expire. Uses fetch with keepalive,
   * which the browser finishes after the page has gone. The working file is
   * always consistent, so the next run simply carries on.
   */
  public releaseOnUnload(): void {
    if (this._lockItemId === undefined || !this._digest || typeof fetch !== 'function') {
      return;
    }
    const url: string = `${this._rest.webUrl}/_api/web/lists/getbytitle('${SpRest.quote(STATE_LIST)}')/items(${this._lockItemId})`;
    try {
      fetch(url, {
        method: 'POST',
        keepalive: true,
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'odata-version': '3.0',
          'X-HTTP-Method': 'MERGE',
          'IF-MATCH': '*',
          'X-RequestDigest': this._digest
        },
        body: JSON.stringify({ Data: this._lockData(true) })
      }).catch(() => { /* the lock expires by itself */ });
    } catch {
      // The lock expires by itself within LOCK_MINUTES.
    }
    this._lockItemId = undefined;
  }

  private async _releaseLock(): Promise<void> {
    if (this._lockItemId === undefined) {
      return;
    }
    try {
      await this._rest.updateItem(STATE_LIST, this._lockItemId, { Data: this._lockData(true) });
    } catch {
      // The lock expires by itself within LOCK_MINUTES.
    }
    this._lockItemId = undefined;
  }
}
