import type { PermissionInspectionResult } from "../models/permission-inspection-result";
import type { RoleAssignmentInfo } from "../models/role-assignment-info";
import { safeCsvCell } from "../utils/csv-escape";

// --- Markdown ---

export function generateMarkdown(result: PermissionInspectionResult): string {
  const lines: string[] = [];
  const ctx = result.context;

  lines.push("# SharePoint Access Lens – Inspection Report");
  lines.push("");
  lines.push(`**Inspected at:** ${ctx.inspectedAt}`);
  lines.push("");

  // Context
  lines.push("## Current Context");
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Current site/web | ${ctx.web.title} |`);
  lines.push(`| Web URL | ${ctx.web.absoluteUrl} |`);
  lines.push(`| Web server-relative URL | ${ctx.web.serverRelativeUrl} |`);
  lines.push(`| Library | ${ctx.library.title} |`);
  lines.push(`| Library path | ${ctx.library.serverRelativeUrl} |`);
  lines.push(`| Library ID | ${ctx.library.id} |`);
  if (ctx.library.baseTemplate !== undefined) {
    lines.push(`| Base template | ${ctx.library.baseTemplate} |`);
  }
  if (ctx.library.baseType !== undefined) {
    lines.push(`| Base type | ${ctx.library.baseType} |`);
  }
  if (ctx.currentUser?.displayName) {
    lines.push(`| Current user | ${ctx.currentUser.displayName} |`);
  }
  lines.push("");

  // Inspection state
  lines.push("## Inspection State");
  lines.push("");
  if (result.errors.length === 0) {
    lines.push("Inspection complete.");
  } else if (result.isPartial) {
    lines.push("**Inspection partial.** Some permission details could not be read.");
    lines.push("");
    for (const err of result.errors) {
      lines.push(`- [${err.scope}] ${err.message}`);
    }
  }
  lines.push("");

  // Risk indicators
  if (result.riskIndicators.length > 0) {
    lines.push("## Risk Indicators");
    lines.push("");
    for (const risk of result.riskIndicators) {
      lines.push(`- **${risk.label}** (${risk.severity}): ${risk.description}`);
    }
    lines.push("");
  }

  // Permission inheritance
  lines.push("## Permission Inheritance");
  lines.push("");
  lines.push(`- Web: ${formatInheritanceStatus(ctx.web.inheritanceStatus)}`);
  lines.push(
    `- Library: ${formatLibraryInheritanceStatus(ctx.library.inheritanceStatus)}`
  );
  lines.push("");

  // Effective permission source
  lines.push("## Effective Permission Source");
  lines.push("");
  lines.push(`Source: **${result.effectivePermissionSource}**`);
  lines.push("");

  // Access summary
  lines.push("## Access Summary");
  lines.push("");
  const s = result.summary;
  lines.push(`| Metric | Count |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Total assignments | ${s.totalAssignments} |`);
  lines.push(`| Web assignments | ${s.webAssignments} |`);
  lines.push(`| Library assignments | ${s.libraryAssignments} |`);
  lines.push(`| Effective assignments | ${s.effectiveAssignments} |`);
  lines.push(`| SharePoint groups | ${s.sharePointGroups} |`);
  lines.push(`| Direct users | ${s.directUsers} |`);
  lines.push(`| Security/claim principals | ${s.securityOrClaimPrincipals} |`);
  lines.push(`| External-looking principals | ${s.externalPrincipals} |`);
  lines.push(`| Broad access principals | ${s.broadAccessPrincipals} |`);
  lines.push(`| Limited Access assignments | ${s.limitedAccessAssignments} |`);
  if (s.roleNames.length > 0) {
    lines.push(`| Role definitions | ${s.roleNames.join(", ")} |`);
  }
  lines.push("");

  // Role assignments table
  const allAssignments = [...result.webAssignments, ...result.libraryAssignments];
  if (allAssignments.length > 0) {
    lines.push("## Role Assignments");
    lines.push("");
    lines.push(
      "| Scope | Effective | Principal | Type | Roles | External | Notes |"
    );
    lines.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const a of allAssignments) {
      lines.push(formatAssignmentRow(a));
    }
    lines.push("");
  }

  return lines.join("\n");
}

// --- CSV ---

export function generateCsv(result: PermissionInspectionResult): string {
  const header = [
    "Scope",
    "Effective",
    "Principal",
    "PrincipalType",
    "Roles",
    "External",
    "Notes",
  ];
  const rows: string[] = [header.map(safeCsvCell).join(",")];

  const allAssignments = [...result.webAssignments, ...result.libraryAssignments];
  for (const a of allAssignments) {
    const row = [
      a.scope,
      a.isEffective ? "Yes" : "No",
      a.principalTitle,
      a.principalKind,
      a.roleDefinitions.map((rd) => rd.name).join("; "),
      formatExternalValue(a.isExternal),
      a.notes.join("; "),
    ];
    rows.push(row.map(safeCsvCell).join(","));
  }

  return rows.join("\n");
}

// --- JSON ---

export function generateJson(result: PermissionInspectionResult): string {
  if (result.isDebugMode && result.advancedRaw) {
    return JSON.stringify(result, null, 2);
  }

  // Normalized export without advancedRaw
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { advancedRaw: _omitted, ...normalized } = result;
  return JSON.stringify(normalized, null, 2);
}

// --- Helpers ---

function formatAssignmentRow(a: RoleAssignmentInfo): string {
  const roles = a.roleDefinitions.map((rd) => rd.name).join(", ");
  const ext = formatExternalValue(a.isExternal);
  const notes = a.notes.join("; ");
  return `| ${a.scope} | ${a.isEffective ? "Yes" : "No"} | ${a.principalTitle} | ${a.principalKind} | ${roles} | ${ext} | ${notes} |`;
}

function formatExternalValue(isExternal?: boolean): string {
  if (isExternal === true) return "Yes";
  if (isExternal === false) return "No";
  return "Unknown";
}

function formatInheritanceStatus(
  status: "rootWeb" | "inheritsFromParentWeb" | "hasUniquePermissions" | "unknown"
): string {
  switch (status) {
    case "rootWeb":
      return "Root web / top-level permission scope";
    case "inheritsFromParentWeb":
      return "Current web inherits permissions from parent web";
    case "hasUniquePermissions":
      return "Current web has unique permissions";
    case "unknown":
      return "Unknown / insufficient permission";
  }
}

function formatLibraryInheritanceStatus(
  status: "inheritsFromCurrentWeb" | "hasUniquePermissions" | "unknown"
): string {
  switch (status) {
    case "inheritsFromCurrentWeb":
      return "Inherits permissions from current web";
    case "hasUniquePermissions":
      return "Has unique permissions";
    case "unknown":
      return "Unknown / insufficient permission";
  }
}
