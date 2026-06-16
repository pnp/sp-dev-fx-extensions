import type { LibraryContextInfo } from "../models/access-lens-context";
import type { RiskIndicator } from "../models/risk-indicator";
import type { RoleAssignmentInfo } from "../models/role-assignment-info";

export interface OwnerGroupInfo {
  groupId?: number;
  visibleOwnerCount?: number;
  couldNotLoad?: boolean;
}

export function calculateRiskIndicators(
  effectiveAssignments: RoleAssignmentInfo[],
  library: LibraryContextInfo,
  ownerGroupInfo?: OwnerGroupInfo
): RiskIndicator[] {
  const indicators: RiskIndicator[] = [];

  // 1. Unique permissions
  if (library.hasUniqueRoleAssignments === true) {
    indicators.push({
      id: "uniquePermissions",
      label: "Unique permissions",
      severity: "warning",
      description:
        "This library has unique permissions. Role inheritance has been broken.",
      evidence: [`Library "${library.title}" has unique role assignments`],
    });
  }

  // 2. Direct user permissions
  const directUsers = effectiveAssignments.filter(
    (a) => a.principalKind === "user"
  );
  if (directUsers.length > 0) {
    indicators.push({
      id: "directUserPermissions",
      label: "Direct user permissions",
      severity: "warning",
      description:
        "Direct user permissions detected. Consider using SharePoint groups where possible.",
      evidence: directUsers.map((u) => u.principalTitle),
    });
  }

  // 3. External-looking users
  const externalUsers = effectiveAssignments.filter(
    (a) => a.isExternal === true
  );
  if (externalUsers.length > 0) {
    indicators.push({
      id: "externalUsers",
      label: "External-looking users detected",
      severity: "warning",
      description:
        "External-looking users detected based on login name heuristics. This detection is not exhaustive.",
      evidence: externalUsers.map((u) => u.principalTitle),
    });
  }

  // 4. Only one visible SharePoint owner
  if (
    ownerGroupInfo &&
    !ownerGroupInfo.couldNotLoad &&
    ownerGroupInfo.visibleOwnerCount === 1
  ) {
    indicators.push({
      id: "onlyOneVisibleSharePointOwner",
      label: "Only one visible SharePoint owner",
      severity: "info",
      description:
        "Only one visible SharePoint owner was found. This does not reflect Microsoft 365 group ownership.",
      evidence: [
        `Associated owner group has ${ownerGroupInfo.visibleOwnerCount} visible member(s)`,
      ],
    });
  }

  // 5. Broad access group
  const broadAccessPrincipals = effectiveAssignments.filter(
    (a) => a.isBroadAccess === true
  );
  if (broadAccessPrincipals.length > 0) {
    indicators.push({
      id: "broadAccessGroup",
      label: "Broad access group detected",
      severity: "warning",
      description:
        "A broad access group is assigned. Review whether this level of access is intended.",
      evidence: broadAccessPrincipals.map((p) => p.principalTitle),
    });
  }

  return indicators;
}
