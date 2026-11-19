/**
 * HitCounter data model: one definition used by Set up, repair, archive and
 * upgrade, so a recreated list always matches the original (scope section 6).
 */

/** Bump when lists, columns or permissions change, so the dashboard offers Update. */
export const SCHEMA_VERSION: number = 1;

export const PERMISSION_LEVEL_NAME: string = 'HitCounter Add';
export const PERMISSION_LEVEL_DESCRIPTION: string =
  'HitCounter: add page-view rows and read only your own. Created by HitCounter setup.';

/**
 * SharePoint permission numbers (SP.PermissionKind). A permission n is bit
 * (n - 1) of the 64-bit mask: Low holds 1-32, High holds 33-64.
 */
export const PermissionKind = {
  ViewListItems: 1,
  AddListItems: 2,
  Open: 17,
  ViewPages: 18,
  ManagePermissions: 26,
  ManageWeb: 31,
  UseRemoteAPIs: 38
};

/**
 * HitCounter Add: Add Items + View Items, the permissions those depend on
 * (View Pages, Open) and Use Remote Interfaces for REST calls (scope 9.3).
 * P2b tests whether this exact set is enough for an ordinary user.
 */
export const PERMISSION_LEVEL_KINDS: number[] = [
  PermissionKind.ViewListItems,
  PermissionKind.AddListItems,
  PermissionKind.Open,
  PermissionKind.ViewPages,
  PermissionKind.UseRemoteAPIs
];

export interface IBasePermissions {
  Low: number;
  High: number;
}

/** Builds the 64-bit permission mask for a set of SP.PermissionKind values. */
export function toBasePermissions(kinds: number[]): IBasePermissions {
  let low: number = 0;
  let high: number = 0;
  for (const kind of kinds) {
    if (kind <= 32) {
      low = (low | (1 << (kind - 1))) >>> 0;
    } else {
      high = (high | (1 << (kind - 33))) >>> 0;
    }
  }
  return { Low: low, High: high };
}

/** True when a permission mask (as returned by SharePoint, possibly strings) includes a kind. */
export function hasPermission(mask: { Low: number | string; High: number | string }, kind: number): boolean {
  const low: number = Number(mask.Low) >>> 0;
  const high: number = Number(mask.High) >>> 0;
  if (kind <= 32) {
    return ((low >>> (kind - 1)) & 1) === 1;
  }
  return ((high >>> (kind - 33)) & 1) === 1;
}

/** Who gets which access on a list (scope 9.3). Owners always get Full Control. */
export type ListAudience =
  /** Normal users: HitCounter Add (add rows, read own rows). */
  'record' |
  /** Normal users: Read. */
  'read' |
  /** Owners only. */
  'owners';

export interface IFieldDefinition {
  name: string;
  type: 'Text' | 'Note' | 'Number';
  indexed?: boolean;
  unique?: boolean;
}

export interface IListDefinition {
  title: string;
  description: string;
  /** 100 = custom list, 101 = document library. */
  baseTemplate: 100 | 101;
  fields: IFieldDefinition[];
  audience: ListAudience;
  /** "Read items that were created by the user" and "Create items and edit items that were created by the user". */
  ownItemsOnly: boolean;
  /** Make the built-in Title column optional (hit rows and summary rows don't use it). */
  titleOptional: boolean;
  /** Make the built-in Title column indexed and unique (used as a key). */
  titleUnique?: boolean;
}

export const MONTHLY_LIST_PREFIX: string = 'hitcounter_';
export const SUMMARY_LIST: string = 'HitCounter_Summary';
export const PAGE_SUMMARY_LIST: string = 'HitCounter_PageSummary';
export const STATE_LIST: string = 'HitCounter_State';
export const WORKING_LIBRARY: string = 'HitCounter_Working';

/** Title of the settings row in HitCounter_State. */
export const SETTINGS_KEY: string = 'Settings';

const HIT_FIELDS: IFieldDefinition[] = [
  { name: 'SiteId', type: 'Text', indexed: true },
  { name: 'SiteUrl', type: 'Note' },
  { name: 'PageKey', type: 'Text' },
  { name: 'PageUrl', type: 'Note' },
  { name: 'PageTitle', type: 'Text' },
  { name: 'HitDate', type: 'Text', indexed: true }
];

const SUMMARY_FIELDS: IFieldDefinition[] = [
  { name: 'SummaryKey', type: 'Text', indexed: true, unique: true },
  { name: 'Scope', type: 'Text' },
  { name: 'SiteId', type: 'Text', indexed: true },
  { name: 'SiteUrl', type: 'Note' },
  { name: 'SiteName', type: 'Text' },
  { name: 'PeriodType', type: 'Text' },
  { name: 'PeriodKey', type: 'Text', indexed: true },
  { name: 'PageViews', type: 'Number' },
  { name: 'UniqueVisitors', type: 'Number' }
];

function pad2(value: number): string {
  return value < 10 ? '0' + value : String(value);
}

/** All HitCounter lists and the library, in the order Set up creates them. */
export function allListDefinitions(): IListDefinition[] {
  const lists: IListDefinition[] = [];
  for (let month: number = 1; month <= 12; month++) {
    lists.push({
      title: MONTHLY_LIST_PREFIX + pad2(month),
      description: 'HitCounter page views for calendar month ' + pad2(month) + '. Created by HitCounter setup; do not edit.',
      baseTemplate: 100,
      fields: HIT_FIELDS,
      audience: 'record',
      ownItemsOnly: true,
      titleOptional: true
    });
  }
  lists.push({
    title: SUMMARY_LIST,
    description: 'HitCounter totals by site and period. No user identities.',
    baseTemplate: 100,
    fields: SUMMARY_FIELDS,
    audience: 'read',
    ownItemsOnly: false,
    titleOptional: true
  });
  lists.push({
    title: PAGE_SUMMARY_LIST,
    description: 'HitCounter page-level totals. Central admins only.',
    baseTemplate: 100,
    fields: SUMMARY_FIELDS.concat([
      { name: 'PageKey', type: 'Text', indexed: true },
      { name: 'PageUrl', type: 'Note' },
      { name: 'PageTitle', type: 'Text' }
    ]),
    audience: 'owners',
    ownItemsOnly: false,
    titleOptional: true
  });
  lists.push({
    title: STATE_LIST,
    description: 'HitCounter settings, list status, archive records and job lock. Central admins only.',
    baseTemplate: 100,
    fields: [{ name: 'Data', type: 'Note' }],
    audience: 'owners',
    ownItemsOnly: false,
    titleOptional: false,
    titleUnique: true
  });
  lists.push({
    title: WORKING_LIBRARY,
    description: 'HitCounter working files for periods in progress. Central admins only.',
    baseTemplate: 101,
    fields: [],
    audience: 'owners',
    ownItemsOnly: false,
    titleOptional: false
  });
  return lists;
}

/** SharePoint field XML for a definition. */
export function fieldSchemaXml(field: IFieldDefinition): string {
  const common: string = `Name="${field.name}" StaticName="${field.name}" DisplayName="${field.name}" Required="FALSE"` +
    (field.indexed ? ' Indexed="TRUE"' : '') +
    (field.unique ? ' EnforceUniqueValues="TRUE"' : '');
  switch (field.type) {
    case 'Text':
      return `<Field Type="Text" ${common} MaxLength="255" />`;
    case 'Note':
      return `<Field Type="Note" ${common} NumLines="3" RichText="FALSE" />`;
    case 'Number':
      return `<Field Type="Number" ${common} Decimals="0" Min="0" />`;
    default:
      throw new Error('Unknown field type');
  }
}

/** Settings stored as JSON in the Settings row of HitCounter_State. */
export interface IHitCounterSettings {
  schemaVersion: number;
  /** Who can record hits: v1 supports all internal users only. */
  recordHitsBy: 'everyone';
  /** Whether pages on the central site itself are tracked. */
  trackCentralSite: boolean;
  /** Size warning threshold X (scope F12). */
  sizeWarningRows: number;
  archiveRetentionYears: number;
  adminContact: string;
  /** Update stored totals in the background while central admins browse SharePoint (scope 13). */
  backgroundUpdates: boolean;
}

export function defaultSettings(): IHitCounterSettings {
  return {
    schemaVersion: SCHEMA_VERSION,
    recordHitsBy: 'everyone',
    trackCentralSite: true,
    sizeWarningRows: 1000000,
    archiveRetentionYears: 3,
    adminContact: '',
    backgroundUpdates: true
  };
}

/** Reads the Settings row's JSON; missing or wrong-typed values get the defaults. Undefined if unreadable. */
export function parseSettings(data: string | undefined): IHitCounterSettings | undefined {
  if (!data) {
    return undefined;
  }
  let parsed: Partial<IHitCounterSettings>;
  try {
    parsed = JSON.parse(data);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== 'object') {
    return undefined;
  }
  const d: IHitCounterSettings = defaultSettings();
  return {
    schemaVersion: typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 0,
    recordHitsBy: 'everyone',
    trackCentralSite: typeof parsed.trackCentralSite === 'boolean' ? parsed.trackCentralSite : d.trackCentralSite,
    sizeWarningRows: typeof parsed.sizeWarningRows === 'number' ? parsed.sizeWarningRows : d.sizeWarningRows,
    archiveRetentionYears: typeof parsed.archiveRetentionYears === 'number' ? parsed.archiveRetentionYears : d.archiveRetentionYears,
    adminContact: typeof parsed.adminContact === 'string' ? parsed.adminContact : d.adminContact,
    backgroundUpdates: typeof parsed.backgroundUpdates === 'boolean' ? parsed.backgroundUpdates : d.backgroundUpdates
  };
}

/** Claim for "Everyone except external users" in a tenant. */
export function everyoneExceptExternalClaim(tenantId: string): string {
  return 'c:0-.f|rolemanager|spo-grid-all-users/' + tenantId;
}
