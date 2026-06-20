import type { EffectivePermissionSource } from "../models/permission-inspection-result";
import type { RoleAssignmentInfo } from "../models/role-assignment-info";

export function getEffectivePermissionSource(
  libraryHasUniqueRoleAssignments?: boolean,
  canReadLibraryAssignments?: boolean,
  canReadWebAssignments?: boolean
): EffectivePermissionSource {
  if (libraryHasUniqueRoleAssignments === true && canReadLibraryAssignments) {
    return "library";
  }

  if (libraryHasUniqueRoleAssignments === false && canReadWebAssignments) {
    return "web";
  }

  return "unknown";
}

export function getEffectiveAssignments(
  source: EffectivePermissionSource,
  webAssignments: RoleAssignmentInfo[],
  libraryAssignments: RoleAssignmentInfo[]
): RoleAssignmentInfo[] {
  if (source === "web") {
    return webAssignments.map((assignment) => ({
      ...assignment,
      isEffective: true,
    }));
  }

  if (source === "library") {
    return libraryAssignments.map((assignment) => ({
      ...assignment,
      isEffective: true,
    }));
  }

  return [];
}
