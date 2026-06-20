export type PermissionScope = "web" | "library";

export type PrincipalKind =
  | "user"
  | "sharePointGroup"
  | "securityGroup"
  | "distributionList"
  | "claim"
  | "unknown";

export interface RoleAssignmentInfo {
  scope: PermissionScope;
  isEffective: boolean;
  principalId: number;
  principalTitle: string;
  principalLoginName?: string;
  principalEmail?: string;
  principalTypeRaw?: number;
  principalKind: PrincipalKind;
  roleDefinitions: RoleDefinitionInfo[];
  isExternal?: boolean;
  isBroadAccess?: boolean;
  groupMembers?: GroupMemberInfo[];
  groupMembersLoadState?: "notLoaded" | "loading" | "loaded" | "failed";
  groupMembersLoadedCount?: number;
  notes: string[];
}

export interface RoleDefinitionInfo {
  id: number;
  name: string;
  description?: string;
  roleTypeKind?: number;
  /**
   * If true, this role definition is hidden in the SharePoint UI (e.g. "Limited Access").
   * Hidden role definitions are still shown in the role assignments table
   * but should not be counted when determining the number of "real" role levels.
   */
  hidden?: boolean;
}

export interface GroupMemberInfo {
  id: number;
  title: string;
  loginName?: string;
  email?: string;
  principalTypeRaw?: number;
  principalKind: PrincipalKind;
  isExternal?: boolean;
}
