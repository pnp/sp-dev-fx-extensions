/**
 * Monthly list lifecycle (scope 8.3-8.5), with no SharePoint calls so it can
 * be unit-tested: which active lists need a size warning, which can be
 * archived, and how archive lists are named and recognised.
 */

/** From this many rows the warning becomes urgent: SharePoint stops adding rows at 30 million. */
export const STRONG_WARNING_ROWS: number = 25000000;
/** SharePoint's hard limit for items in one list. */
export const LIST_ITEM_LIMIT: number = 30000000;

export type SizeWarning = 'none' | 'warn' | 'strong';

/** A list as the dashboard reads it from /_api/web/lists. */
export interface IListFacts {
  id: string;
  title: string;
  itemCount: number;
  /** Server-relative address, e.g. /sites/x/Lists/hitcounter_10 */
  url: string;
  /** UTC years of the oldest and newest rows, when known. */
  firstYear?: number;
  lastYear?: number;
}

export interface IActiveList extends IListFacts {
  month: number;
  warning: SizeWarning;
  /** False for the current month's list, which can't be archived (scope 8.3). */
  archivable: boolean;
}

export interface IArchiveList extends IListFacts {
  month: number;
  fromYear: number;
  toYear: number;
}

/** Archive record kept in HitCounter_State, Title "Archive|{listId}". */
export interface IArchiveRecord {
  listId: string;
  title: string;
  month: number;
  rows: number;
  archivedUtc: string;
  archivedBy: string;
  /** Set when retention (or an admin) moved the archive to the recycle bin. */
  recycledUtc?: string;
  recycledBy?: string;
}

export interface ILifecycle {
  active: IActiveList[];
  archives: IArchiveList[];
  warnings: IActiveList[];
}

const ACTIVE_PATTERN: RegExp = /^hitcounter_(\d{2})$/i;
const ARCHIVE_PATTERN: RegExp = /^hitcounter_(\d{2})_(\d{4})(?:-(\d{4}))?(?:_(\d+))?$/i;

export function sizeWarning(rows: number, warnAt: number): SizeWarning {
  if (rows >= STRONG_WARNING_ROWS) {
    return 'strong';
  }
  return warnAt > 0 && rows >= warnAt ? 'warn' : 'none';
}

/** hitcounter_10_2026 or hitcounter_10_2026-2029 (optionally _2, _3 if taken). */
export function parseArchiveTitle(title: string): { month: number; fromYear: number; toYear: number } | undefined {
  const m: RegExpExecArray | null = ARCHIVE_PATTERN.exec(title);
  if (!m) {
    return undefined;
  }
  const month: number = parseInt(m[1], 10);
  const fromYear: number = parseInt(m[2], 10);
  const toYear: number = m[3] ? parseInt(m[3], 10) : fromYear;
  if (month < 1 || month > 12 || toYear < fromYear) {
    return undefined;
  }
  return { month, fromYear, toYear };
}

/**
 * The archive name for a list holding rows from firstYear to lastYear:
 * hitcounter_10_2026, or hitcounter_10_2026-2029. If that title is taken,
 * _2, _3 ... is added.
 */
export function archiveTitle(month: number, firstYear: number, lastYear: number, takenTitles: string[]): string {
  const mm: string = month < 10 ? '0' + month : String(month);
  const base: string = `hitcounter_${mm}_${firstYear}${lastYear > firstYear ? '-' + lastYear : ''}`;
  const taken: { [t: string]: boolean } = {};
  takenTitles.forEach((t: string) => { taken[t.toLowerCase()] = true; });
  if (!taken[base.toLowerCase()]) {
    return base;
  }
  for (let n = 2; ; n++) {
    if (!taken[`${base}_${n}`.toLowerCase()]) {
      return `${base}_${n}`;
    }
  }
}

/** Sorts lists into active (with warnings) and archives. Other lists are ignored. */
export function classifyLists(lists: IListFacts[], currentMonth: number, warnAt: number): ILifecycle {
  const active: IActiveList[] = [];
  const archives: IArchiveList[] = [];
  for (const list of lists) {
    const a: RegExpExecArray | null = ACTIVE_PATTERN.exec(list.title);
    if (a) {
      const month: number = parseInt(a[1], 10);
      if (month >= 1 && month <= 12) {
        active.push({ ...list, month, warning: sizeWarning(list.itemCount, warnAt), archivable: month !== currentMonth && list.itemCount > 0 });
      }
      continue;
    }
    const parsed: { month: number; fromYear: number; toYear: number } | undefined = parseArchiveTitle(list.title);
    if (parsed) {
      archives.push({ ...list, ...parsed });
    }
  }
  active.sort((x: IActiveList, y: IActiveList) => x.month - y.month);
  archives.sort((x: IArchiveList, y: IArchiveList) => x.month - y.month || x.fromYear - y.fromYear || (x.title < y.title ? -1 : 1));
  const warnings: IActiveList[] = active.filter((l: IActiveList) => l.warning !== 'none')
    .sort((x: IActiveList, y: IActiveList) => y.itemCount - x.itemCount);
  return { active, archives, warnings };
}

/** When an archive becomes due for deletion: archived date + retention years. */
export function deleteAfter(archivedUtc: string, retentionYears: number): Date | undefined {
  const at: Date = new Date(archivedUtc);
  if (isNaN(at.getTime()) || retentionYears <= 0) {
    return undefined;
  }
  return new Date(Date.UTC(at.getUTCFullYear() + retentionYears, at.getUTCMonth(), at.getUTCDate(),
    at.getUTCHours(), at.getUTCMinutes(), at.getUTCSeconds()));
}

/**
 * True when an archive's retention period is over. Never true without a
 * readable archive date: an archive of unknown age is kept.
 */
export function isDueForDeletion(archivedUtc: string | undefined, retentionYears: number, now: Date): boolean {
  const due: Date | undefined = archivedUtc ? deleteAfter(archivedUtc, retentionYears) : undefined;
  return !!due && due.getTime() <= now.getTime();
}

/** The month a list must be archived by, to act before rows start arriving again. */
export function nextUseOfMonth(month: number, now: Date): Date {
  const year: number = now.getUTCMonth() + 1 < month ? now.getUTCFullYear() : now.getUTCFullYear() + 1;
  return new Date(Date.UTC(year, month - 1, 1));
}
