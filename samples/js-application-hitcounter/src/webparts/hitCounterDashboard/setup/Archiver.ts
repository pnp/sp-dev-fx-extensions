import { SpRest } from '../../../shared/spRest';
import { IHitCounterSettings, MONTHLY_LIST_PREFIX, STATE_LIST, WORKING_LIBRARY } from '../../../shared/schema';
import { IWorkingState, parseWorkingState } from '../../../shared/summaryModel';
import { IArchiveRecord, archiveTitle, parseArchiveTitle } from '../../../shared/listLifecycle';
import { IProgress, Provisioner } from './Provisioner';
import { IJobResult, SummaryJob } from '../job/SummaryJob';

interface IListInfo {
  Id: string;
  Title: string;
  ItemCount: number;
  RootFolder: { ServerRelativeUrl: string };
}

/**
 * The Archive action (scope 8.4). For each chosen monthly list:
 *  1. bring the stored totals up to date and check every row is counted;
 *  2. move the list's address to hitcounter_MM_YYYY[-YYYY] (which also
 *     renames it), so the replacement gets the clean /Lists/hitcounter_MM;
 *  3. remove everyone's access except the site's Owners (read-only archive);
 *  4. record the archive in HitCounter_State;
 * then create the new empty lists with Set up's repair step. Every step is
 * safe to repeat, so a failed run can simply be run again.
 */
export class Archiver {
  private readonly _rest: SpRest;
  private readonly _provisioner: Provisioner;
  private readonly _job: SummaryJob;
  private readonly _userName: string;

  constructor(rest: SpRest, provisioner: Provisioner, job: SummaryJob, userName: string) {
    this._rest = rest;
    this._provisioner = provisioner;
    this._job = job;
    this._userName = userName;
  }

  public async run(listIds: string[], settings: IHitCounterSettings, onProgress: (p: IProgress) => void): Promise<void> {
    const report = (level: IProgress['level'], message: string): void => onProgress({ level, message });
    const currentMonth: number = new Date().getUTCMonth() + 1;

    // 1. Totals up to date, so the archive holds no uncounted rows.
    report('info', 'Bringing the stored totals up to date');
    const result: IJobResult = await this._job.run(settings.adminContact, (m: string) => report('info', m));
    if (result.status === 'locked') {
      throw new Error(`${result.lockedBy || 'Another central admin'} is updating the totals right now. Nothing was archived; try again in a few minutes.`);
    }
    report('done', `Stored totals are up to date (${result.rowsCounted} new page view(s) counted)`);

    const library: { ServerRelativeUrl: string } = await this._rest.get(
      `/_api/web/lists/getbytitle('${SpRest.quote(WORKING_LIBRARY)}')/RootFolder?$select=ServerRelativeUrl`);
    const working: IWorkingState = parseWorkingState(await this._rest.readFile(`${library.ServerRelativeUrl}/working.json`));
    const all: { value: { Title: string }[] } = await this._rest.get(`/_api/web/lists?$select=Title&$filter=startswith(Title,'${MONTHLY_LIST_PREFIX}')`);
    const taken: string[] = all.value.map((l: { Title: string }) => l.Title);
    const ownersGroup: { Id?: number } | undefined = await this._rest.tryGet('/_api/web/associatedownergroup?$select=Id');

    for (const listId of listIds) {
      const listPath: string = `/_api/web/lists(guid'${listId}')`;
      const info: IListInfo = await this._rest.get(`${listPath}?$select=Id,Title,ItemCount&$expand=RootFolder`);
      let title: string = info.Title;
      const active: RegExpExecArray | null = /^hitcounter_(\d{2})$/i.exec(title);

      if (active) {
        const month: number = parseInt(active[1], 10);
        if (month === currentMonth) {
          throw new Error(`${title} is this month's list and can't be archived until the month ends.`);
        }
        // 2. Every row counted? The cursor is the last row ID the job processed.
        const newest: { value: { Id: number; Created: string }[] } = await this._rest.get(`${listPath}/items?$select=Id,Created&$orderby=Id desc&$top=1`);
        if (newest.value.length === 0) {
          report('warn', `${title} is empty: nothing to archive`);
          continue;
        }
        const cursor: number = working.cursors[info.Id] ? working.cursors[info.Id].lastId : 0;
        if (newest.value[0].Id > cursor) {
          throw new Error(`${title} has rows the summary job hasn't counted yet (row ${newest.value[0].Id}, counted up to ${cursor}). ` +
            'Nothing was changed for it. Run Archive again in a minute.');
        }
        const oldest: { value: { Created: string }[] } = await this._rest.get(`${listPath}/items?$select=Created&$orderby=Id asc&$top=1`);
        const firstYear: number = new Date(oldest.value[0].Created).getUTCFullYear();
        const lastYear: number = new Date(newest.value[0].Created).getUTCFullYear();
        const newTitle: string = archiveTitle(month, firstYear, lastYear, taken);
        taken.push(newTitle);

        // 3. Move the address; SharePoint renames the list to match.
        const root: string = info.RootFolder.ServerRelativeUrl;
        const newUrl: string = root.substring(0, root.lastIndexOf('/') + 1) + newTitle;
        report('info', `${title}: moving to ${newUrl}`);
        await this._rest.post(`${listPath}/RootFolder/MoveTo(newUrl='${SpRest.quote(newUrl)}')`);
        await this._rest.merge(listPath, {
          __metadata: { type: 'SP.List' },
          Title: newTitle,
          Description: `HitCounter archive of ${title} (${firstYear === lastYear ? firstYear : `${firstYear} to ${lastYear}`}). ` +
            `Archived ${new Date().toISOString().substring(0, 10)} by ${this._userName}. Read-only; deleted after the retention period.`
        });
        title = newTitle;
      } else if (!parseArchiveTitle(title)) {
        throw new Error(`${title} is not a HitCounter monthly list.`);
      } else {
        report('info', `${title} is already archived: checking its permissions and record`);
      }

      // 4. Owners only. Normal users lose "HitCounter Add", so nobody can add rows.
      const removed: number = await this._ownersOnly(listPath, ownersGroup && ownersGroup.Id);
      report('done', `${title}: ${removed > 0 ? `removed ${removed} other permission(s), ` : ''}owners only`);

      // 5. Record it (date, rows, who) for the lists section and retention.
      await this._record({
        listId: info.Id,
        title,
        month: parseArchiveTitle(title) ? (parseArchiveTitle(title) as { month: number }).month : 0,
        rows: info.ItemCount,
        archivedUtc: new Date().toISOString(),
        archivedBy: this._userName
      });
      report('done', `${title}: archived (${info.ItemCount.toLocaleString()} rows). The dashboard's totals are unchanged.`);
    }

    // 6. New empty lists in place of the archived ones (Set up's repair).
    report('info', 'Creating the new empty monthly list(s)');
    await this._provisioner.run(settings, onProgress);
  }

  private async _ownersOnly(listPath: string, ownersId: number | undefined): Promise<number> {
    const info: { HasUniqueRoleAssignments: boolean } = await this._rest.get(`${listPath}?$select=HasUniqueRoleAssignments`);
    if (!info.HasUniqueRoleAssignments) {
      await this._rest.post(`${listPath}/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=true)`);
    }
    if (ownersId === undefined) {
      // No Owners group: leave the permissions, rather than lock everyone out.
      return 0;
    }
    const current: { value: { PrincipalId: number }[] } = await this._rest.get(`${listPath}/roleassignments?$select=PrincipalId`);
    let removed: number = 0;
    for (const a of current.value) {
      if (a.PrincipalId !== ownersId) {
        await this._rest.del(`${listPath}/roleassignments/getbyprincipalid(${a.PrincipalId})`);
        removed++;
      }
    }
    return removed;
  }

  private async _record(record: IArchiveRecord): Promise<void> {
    const key: string = `Archive|${record.listId.toLowerCase()}`;
    const existing: { value: { Id: number; Data?: string }[] } = await this._rest.get(
      `/_api/web/lists/getbytitle('${SpRest.quote(STATE_LIST)}')/items?$select=Id,Data&$filter=${encodeURIComponent(`Title eq '${key}'`)}&$top=1`);
    if (existing.value.length > 0) {
      // Keep the first archive date: a repeat run must not restart the retention clock.
      let before: IArchiveRecord | undefined;
      try {
        before = JSON.parse(existing.value[0].Data || '');
      } catch {
        before = undefined; // Damaged record: replace it.
      }
      const merged: IArchiveRecord = before && before.archivedUtc
        ? { ...record, archivedUtc: before.archivedUtc, archivedBy: before.archivedBy }
        : record;
      await this._rest.updateItem(STATE_LIST, existing.value[0].Id, { Data: JSON.stringify(merged) });
    } else {
      await this._rest.addItem(STATE_LIST, { Title: key, Data: JSON.stringify(record) });
    }
  }
}
