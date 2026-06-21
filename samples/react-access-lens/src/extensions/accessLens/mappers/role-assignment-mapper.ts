import type {
  PermissionScope,
  RoleAssignmentInfo,
  RoleDefinitionInfo,
} from "../models/role-assignment-info";
import {
  classifyExternalPrincipal,
  isBroadAccessPrincipal,
  mapPrincipalKind,
} from "./principal-mapper";

// Raw shapes returned by the expanded OData query
export interface RawRoleAssignment {
  PrincipalId: number;
  Member: {
    Id: number;
    Title: string;
    LoginName?: string;
    PrincipalType?: number;
  };
  RoleDefinitionBindings: RawRoleDefinition[];
}

export interface RawRoleDefinition {
  Id: number;
  Name: string;
  Description?: string;
  RoleTypeKind?: number;
  Hidden?: boolean;
}

export function mapRoleAssignments(
  raw: RawRoleAssignment[],
  scope: PermissionScope
): RoleAssignmentInfo[] {
  return raw.map((item) => mapSingleAssignment(item, scope));
}

function mapSingleAssignment(
  raw: RawRoleAssignment,
  scope: PermissionScope
): RoleAssignmentInfo {
  const member = raw.Member;
  const principalKind = mapPrincipalKind(
    member.PrincipalType,
    member.LoginName
  );

  const externalClassification = classifyExternalPrincipal({
    loginName: member.LoginName,
  });
  const broadAccess = isBroadAccessPrincipal(
    member.Title,
    member.LoginName
  );

  const notes: string[] = [];

  if (externalClassification.value === true) {
    notes.push(`External-looking: ${externalClassification.reason}`);
  } else if (externalClassification.value === undefined) {
    notes.push(
      `External status unknown: ${externalClassification.reason}`
    );
  }

  if (broadAccess) {
    notes.push("Broad access principal");
  }

  const roleDefinitions: RoleDefinitionInfo[] =
    raw.RoleDefinitionBindings.map((rd) => ({
      id: rd.Id,
      name: rd.Name,
      description: rd.Description,
      roleTypeKind: rd.RoleTypeKind,
      hidden: rd.Hidden,
    }));

  return {
    scope,
    isEffective: false,
    principalId: member.Id,
    principalTitle: member.Title,
    principalLoginName: member.LoginName,
    principalTypeRaw: member.PrincipalType,
    principalKind,
    roleDefinitions,
    isExternal: externalClassification.value,
    isBroadAccess: broadAccess,
    groupMembersLoadState:
      principalKind === "sharePointGroup" ? "notLoaded" : undefined,
    notes,
  };
}

export function getRoleNameSummaries(
  effectiveAssignments: RoleAssignmentInfo[]
): {
  roleNames: string[];
  allRoleNames: string[];
} {
  const allRoleNames = new Set<string>();
  const visibleRoleNames = new Set<string>();

  for (const assignment of effectiveAssignments) {
    for (const role of assignment.roleDefinitions) {
      allRoleNames.add(role.name);

      if (role.hidden !== true) {
        visibleRoleNames.add(role.name);
      }
    }
  }

  return {
    roleNames: Array.from(visibleRoleNames).sort(),
    allRoleNames: Array.from(allRoleNames).sort(),
  };
}
