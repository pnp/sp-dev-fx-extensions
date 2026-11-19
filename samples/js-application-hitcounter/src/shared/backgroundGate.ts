/**
 * When the tracker may update stored totals in the background (scope 13,
 * "Background updates for central admins"). No SharePoint calls, so it can be
 * unit-tested, and small, because it ships in the tracker every user loads.
 * The job code itself is loaded only after these checks say yes.
 */

/** A central admin is re-checked this often; everyone else costs one small request a day. */
export const ADMIN_CHECK_MS: number = 24 * 60 * 60 * 1000;
/** At most one background update per browser this often (the dashboard's own runs count too). */
export const BACKGROUND_EVERY_MS: number = 15 * 60 * 1000;
/** Wait after a page loads before starting, so the update never competes with the page. */
export const BACKGROUND_START_DELAY_MS: number = 20 * 1000;

/** localStorage keys: shared by every tab in this browser. */
export const ADMIN_CHECK_KEY: string = 'hitcounter.adminCheck';
export const LAST_UPDATE_KEY: string = 'hitcounter.lastUpdateAttempt';

export interface IAdminCheck {
  centralSiteUrl: string;
  user: string;
  isAdmin: boolean;
  /** ms since 1970. */
  checkedAt: number;
}

function same(a: string, b: string): boolean {
  return a.replace(/\/+$/, '').toLowerCase() === b.replace(/\/+$/, '').toLowerCase();
}

/** The cached admin answer, if it is for this user and central site and still fresh. */
export function cachedAdmin(raw: string | undefined,centralSiteUrl: string, user: string, now: number): boolean | undefined {
  let entry: IAdminCheck;
  try {
    entry = JSON.parse(raw || '');
  } catch {
    return undefined;
  }
  if (!entry || typeof entry.isAdmin !== 'boolean' || typeof entry.checkedAt !== 'number' ||
    typeof entry.centralSiteUrl !== 'string' || typeof entry.user !== 'string' ||
    !same(entry.centralSiteUrl, centralSiteUrl) || entry.user.toLowerCase() !== user.toLowerCase()) {
    return undefined;
  }
  const age: number = now - entry.checkedAt;
  return age >= 0 && age < ADMIN_CHECK_MS ? entry.isAdmin : undefined;
}

/** True when no update was attempted in this browser within BACKGROUND_EVERY_MS. */
export function updateDue(lastAttemptRaw: string | undefined, now: number): boolean {
  const last: number = Number(lastAttemptRaw);
  if (!lastAttemptRaw || isNaN(last)) {
    return true;
  }
  // A time in the future (clock changed) doesn't block updates for long.
  return now - last >= BACKGROUND_EVERY_MS || last - now > BACKGROUND_EVERY_MS;
}

/**
 * Central admin = can manage permissions and the web on the central site
 * (PermissionKind 26 and 31 in EffectiveBasePermissions.Low), the same test
 * the dashboard uses.
 */
export function isAdminMask(mask: { Low?: string | number } | undefined): boolean {
  const low: number = mask ? Number(mask.Low) >>> 0 : 0;
  const managePermissions: number = 1 << 25;
  const manageWeb: number = 1 << 30;
  return (low & managePermissions) !== 0 && (low & manageWeb) !== 0;
}

/** Safe localStorage access: storage can be blocked or full. */
export function readLocal(key: string): string | undefined {
  try {
    const value: string | null = window.localStorage.getItem(key);
    return value === null ? undefined : value;
  } catch {
    return undefined;
  }
}

export function writeLocal(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Blocked storage: the gate simply checks again next time.
  }
}
