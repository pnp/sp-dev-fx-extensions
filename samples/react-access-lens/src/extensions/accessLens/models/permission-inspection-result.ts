import type { AccessLensContext } from "./access-lens-context";
import type { InspectionError } from "./inspection-error";
import type { RiskIndicator } from "./risk-indicator";
import type { RoleAssignmentInfo } from "./role-assignment-info";

export type EffectivePermissionSource =
  | "web"
  | "library"
  | "unknown";

export interface PermissionInspectionResult {
  context: AccessLensContext;
  webAssignments: RoleAssignmentInfo[];
  libraryAssignments: RoleAssignmentInfo[];
  effectiveAssignments: RoleAssignmentInfo[];
  effectivePermissionSource: EffectivePermissionSource;
  riskIndicators: RiskIndicator[];
  summary: AccessSummary;
  errors: InspectionError[];
  isPartial: boolean;
  /** True if the current page URL contains ?debug=true. */
  isDebugMode: boolean;
  /**
   * Raw API response excerpts. Only populated when isDebugMode is true.
   * Included in JSON export under this property when debug mode is active.
   * Not stored or displayed when debug mode is inactive.
   */
  advancedRaw?: Record<string, unknown>;
}

export interface AccessSummary {
  totalAssignments: number;
  webAssignments: number;
  libraryAssignments: number;
  effectiveAssignments: number;
  effectivePermissionSource: EffectivePermissionSource;
  sharePointGroups: number;
  directUsers: number;
  securityOrClaimPrincipals: number;
  externalPrincipals: number;
  broadAccessPrincipals: number;
  limitedAccessAssignments: number;

  /**
   * User-facing role definition names from effective assignments.
   * Hidden/system role definitions are excluded.
   * Used for UI summary, Markdown export, and CSV export.
   */
  roleNames: string[];

  /**
   * All role definition names from effective assignments,
   * including hidden/system role definitions.
   * Used only for advanced details and JSON export.
   */
  allRoleNames: string[];
}
