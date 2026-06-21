export interface AccessLensContext {
  web: WebContextInfo;
  library: LibraryContextInfo;
  currentUser?: UserInfo;
  /** ISO 8601 timestamp, e.g. "2026-05-31T14:22:00.000Z" */
  inspectedAt: string;
}

export interface WebContextInfo {
  title: string;
  absoluteUrl: string;
  serverRelativeUrl: string;
  hasUniqueRoleAssignments?: boolean;
  isRootWeb?: boolean;
  inheritanceStatus:
    | "rootWeb"
    | "inheritsFromParentWeb"
    | "hasUniquePermissions"
    | "unknown";
}

export interface LibraryContextInfo {
  id: string;
  title: string;
  /** Derived from web origin + RootFolder ServerRelativeUrl */
  absoluteUrl: string;
  serverRelativeUrl: string;
  baseTemplate?: number;
  baseType?: number;
  hidden?: boolean;
  hasUniqueRoleAssignments?: boolean;
  inheritanceStatus:
    | "inheritsFromCurrentWeb"
    | "hasUniquePermissions"
    | "unknown";
}

export interface UserInfo {
  id?: number;
  displayName?: string;
  loginName?: string;
  email?: string;
}
