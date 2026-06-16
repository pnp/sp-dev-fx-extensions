export interface RiskIndicator {
  id:
    | "uniquePermissions"
    | "directUserPermissions"
    | "externalUsers"
    | "onlyOneVisibleSharePointOwner"
    | "broadAccessGroup";
  label: string;
  severity: "info" | "warning";
  description: string;
  evidence: string[];
}
