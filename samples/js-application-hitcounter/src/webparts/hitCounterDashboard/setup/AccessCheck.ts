import { SpRest } from '../../../shared/spRest';
import { PAGE_SUMMARY_LIST, STATE_LIST, SUMMARY_LIST, WORKING_LIBRARY } from '../../../shared/schema';
import { monthListTitle, toUtcDateKey } from '../../../extensions/hitCounterTracker/hitUtils';

/** PageKey used on every row the access check writes, so owners can find and remove them. */
export const ACCESS_CHECK_PAGE_KEY: string = 'hc-access-check';

export interface ICheckResult {
  name: string;
  expected: string;
  actual: string;
  pass: boolean;
}

export interface IAccessReport {
  userTitle: string;
  isOwner: boolean;
  listTitle: string;
  results: ICheckResult[];
}

interface IAttempt<T> {
  ok: boolean;
  status: number;
  value: T | undefined;
  message: string;
}

/** Denied means SharePoint refused or hid the object; anything else is an unexpected error. */
function isDenied(status: number): boolean {
  return status === 401 || status === 403 || status === 404;
}

async function attempt<T>(action: () => Promise<T>): Promise<IAttempt<T>> {
  try {
    const value: T = await action();
    return { ok: true, status: 200, value, message: '' };
  } catch (error) {
    const e: Error & { status?: number } = error as Error & { status?: number };
    return { ok: false, status: e && e.status ? e.status : 0, value: undefined, message: e && e.message ? e.message : String(error) };
  }
}

/**
 * Go/no-go check of what the signed-in user can do with the HitCounter lists
 * (scope P2b). Ordinary users must be able to add rows and read only their own,
 * and nothing else. Owners are expected to have full access.
 */
export class AccessCheck {
  private readonly _rest: SpRest;

  constructor(rest: SpRest) {
    this._rest = rest;
  }

  public async run(isOwner: boolean, onResult: (result: ICheckResult) => void): Promise<IAccessReport> {
    const me: { Id: number; Title: string } = await this._rest.get('/_api/web/currentuser?$select=Id,Title');
    const now: Date = new Date();
    const listTitle: string = monthListTitle(now);
    const listPath: string = `/_api/web/lists/getbytitle('${SpRest.quote(listTitle)}')`;
    const results: ICheckResult[] = [];
    const add = (name: string, expectAllowed: boolean, a: IAttempt<unknown>, allowedText?: string): boolean => {
      const actualAllowed: boolean = a.ok;
      const unexpectedError: boolean = !a.ok && !isDenied(a.status);
      const result: ICheckResult = {
        name,
        expected: expectAllowed ? 'Allowed' : 'Denied',
        actual: actualAllowed ? (allowedText || 'Allowed') : unexpectedError ? `Error: ${a.message}` : `Denied (${a.status})`,
        pass: !unexpectedError && actualAllowed === expectAllowed
      };
      results.push(result);
      onResult(result);
      return result.pass;
    };

    // Row type and total row count. ItemCount is the whole list, not just the user's rows.
    const meta: IAttempt<{ ListItemEntityTypeFullName: string; ItemCount: number }> =
      await attempt(() => this._rest.get<{ ListItemEntityTypeFullName: string; ItemCount: number }>(
        `${listPath}?$select=ListItemEntityTypeFullName,ItemCount`));
    if (!meta.ok || !meta.value) {
      add(`Open this month's list (${listTitle})`, true, meta);
      return { userTitle: me.Title, isOwner, listTitle, results };
    }
    const entityType: string = meta.value.ListItemEntityTypeFullName;
    const newRow = (title: string): { [key: string]: unknown } => ({
      __metadata: { type: entityType },
      SiteId: 'access-check',
      SiteUrl: this._rest.webUrl,
      PageKey: ACCESS_CHECK_PAGE_KEY,
      PageUrl: this._rest.webUrl + '/access-check',
      PageTitle: title,
      HitDate: toUtcDateKey(now)
    });

    // 1. Add a row (what the tracker does on every page view).
    const created: IAttempt<{ Id: number }> = await attempt(() =>
      this._rest.post<{ Id: number }>(`${listPath}/items`, newRow(`Access check by ${me.Title}`)));
    add(`1. Add a page-view row to ${listTitle}`, true, created);

    // 2. Read rows: ordinary users must see only their own.
    const read: IAttempt<{ value: { Id: number; AuthorId: number }[] }> = await attempt(() =>
      this._rest.get<{ value: { Id: number; AuthorId: number }[] }>(`${listPath}/items?$select=Id,AuthorId&$top=5000`));
    if (read.ok && read.value) {
      const rows: { Id: number; AuthorId: number }[] = read.value.value;
      const mine: number = rows.filter((r: { AuthorId: number }) => r.AuthorId === me.Id).length;
      const others: number = rows.length - mine;
      // Re-read the count: it now includes the row just added.
      const total: number = await this._rest.get<{ ItemCount: number }>(`${listPath}?$select=ItemCount`)
        .then((r: { ItemCount: number }) => r.ItemCount, () => meta.value ? meta.value.ItemCount : rows.length);
      const hiddenFromMe: number = Math.max(0, total - rows.length);
      let actual: string = `List has ${total} row(s); you can see ${rows.length}: ${mine} yours, ${others} other people's`;
      let pass: boolean;
      if (isOwner) {
        pass = others + mine === total;
      } else {
        pass = others === 0 && mine > 0;
        if (pass && hiddenFromMe === 0) {
          actual += '. No other people\'s rows exist yet, so this proves little: run the check as an owner first, then again here';
        }
      }
      const result: ICheckResult = {
        name: '2. Read rows in this month\'s list',
        expected: isOwner ? 'All rows' : 'Only your own rows',
        actual,
        pass
      };
      results.push(result);
      onResult(result);
    } else {
      add('2. Read rows in this month\'s list', true, read);
    }

    // 3. Edit your own row.
    if (created.ok && created.value) {
      const id: number = created.value.Id;
      add('3. Edit a row', isOwner, await attempt(() =>
        this._rest.merge(`${listPath}/items(${id})`, { __metadata: { type: entityType }, PageTitle: `Access check by ${me.Title} (edited)` })));
    }

    // 4. Delete a row: uses a second row so an owner's first row stays for ordinary users' test 2.
    const spare: IAttempt<{ Id: number }> = await attempt(() =>
      this._rest.post<{ Id: number }>(`${listPath}/items`, newRow(`Access check by ${me.Title} (delete test)`)));
    if (spare.ok && spare.value) {
      const spareId: number = spare.value.Id;
      add('4. Delete a row', isOwner, await attempt(() => this._rest.del(`${listPath}/items(${spareId})`)));
    }

    // 5. Read totals (the summary list holds counts only).
    const summaryPath: string = `/_api/web/lists/getbytitle('${SpRest.quote(SUMMARY_LIST)}')`;
    add(`5. Read ${SUMMARY_LIST}`, true, await attempt(() => this._rest.get(`${summaryPath}/items?$select=Id&$top=1`)));

    // 6. Change totals.
    const summaryType: IAttempt<{ ListItemEntityTypeFullName: string }> = await attempt(() =>
      this._rest.get<{ ListItemEntityTypeFullName: string }>(`${summaryPath}?$select=ListItemEntityTypeFullName`));
    if (summaryType.ok && summaryType.value) {
      const type: string = summaryType.value.ListItemEntityTypeFullName;
      const write: IAttempt<{ Id: number }> = await attempt(() => this._rest.post<{ Id: number }>(`${summaryPath}/items`, {
        __metadata: { type }, SummaryKey: `access-check-${me.Id}-${now.getTime()}`, Scope: 'access-check'
      }));
      add(`6. Add a row to ${SUMMARY_LIST}`, isOwner, write);
      if (write.ok && write.value) {
        const writtenId: number = write.value.Id;
        // Clean up straight away if it was allowed.
        await attempt(() => this._rest.del(`${summaryPath}/items(${writtenId})`));
      }
    }

    // 7-9. Owner-only lists.
    let n: number = 7;
    for (const title of [PAGE_SUMMARY_LIST, STATE_LIST, WORKING_LIBRARY]) {
      add(`${n}. Open ${title}`, isOwner, await attempt(() =>
        this._rest.get(`/_api/web/lists/getbytitle('${SpRest.quote(title)}')/items?$select=Id&$top=1`)));
      n++;
    }

    return { userTitle: me.Title, isOwner, listTitle, results };
  }

  /** Owners: counts the access-check rows in every monthly list. */
  public async countTestRows(): Promise<number> {
    let count: number = 0;
    for (const title of AccessCheck._monthlyTitles()) {
      const rows: { value: { Id: number }[] } = await this._rest.get(
        `/_api/web/lists/getbytitle('${SpRest.quote(title)}')/items?$select=Id&$filter=PageKey eq '${ACCESS_CHECK_PAGE_KEY}'&$top=5000`);
      count += rows.value.length;
    }
    return count;
  }

  /** Owners: removes every access-check row. Returns how many were removed. */
  public async removeTestRows(): Promise<number> {
    let removed: number = 0;
    for (const title of AccessCheck._monthlyTitles()) {
      const listPath: string = `/_api/web/lists/getbytitle('${SpRest.quote(title)}')`;
      const rows: { value: { Id: number }[] } = await this._rest.get(
        `${listPath}/items?$select=Id&$filter=PageKey eq '${ACCESS_CHECK_PAGE_KEY}'&$top=5000`);
      for (const row of rows.value) {
        await this._rest.del(`${listPath}/items(${row.Id})`);
        removed++;
      }
    }
    return removed;
  }

  private static _monthlyTitles(): string[] {
    const titles: string[] = [];
    for (let m: number = 1; m <= 12; m++) {
      titles.push('hitcounter_' + (m < 10 ? '0' + m : String(m)));
    }
    return titles;
  }
}
