import type { ExternalClassification } from "../models/external-classification";
import type { PrincipalKind } from "../models/role-assignment-info";

export function mapPrincipalKind(
  principalTypeRaw?: number,
  loginName?: string
): PrincipalKind {
  if (loginName) {
    const lower = loginName.toLowerCase();

    // Directory-backed group claims (Entra ID / security groups resolved via claims).
    if (
      lower.includes("|federateddirectoryclaimprovider|") ||
      lower.includes("|tenant|") ||
      lower.includes("|rolemanager|")
    ) {
      return "claim";
    }

    // System-level claims: c:0 prefix covers principals like
    // "Everyone except external users" (c:0(.s|true), Windows claims (c:0!.s|windows), etc.
    if (lower.startsWith("c:0")) {
      return "claim";
    }

    // Identity claims (i:0#.f|membership|, i:0#.w|) represent regular user identities.
    // Fall through to PrincipalType-based classification below.
  }

  if (!principalTypeRaw || principalTypeRaw <= 0) return "unknown";

  // Value 15 means "All" and is not a real principal type.
  if (principalTypeRaw === 15) return "unknown";

  if ((principalTypeRaw & 8) === 8) return "sharePointGroup";
  if ((principalTypeRaw & 4) === 4) return "securityGroup";
  if ((principalTypeRaw & 2) === 2) return "distributionList";
  if ((principalTypeRaw & 1) === 1) return "user";

  return "unknown";
}

export function classifyExternalPrincipal(principal: {
  loginName?: string;
}): ExternalClassification {
  const login = principal.loginName?.toLowerCase().trim();

  if (!login) {
    return { value: undefined, reason: "missingLoginName" };
  }

  if (login.includes("#ext#")) {
    return { value: true, reason: "extLoginPattern" };
  }

  if (login.includes("urn:spo:guest")) {
    return { value: true, reason: "spoGuestLoginPattern" };
  }

  return { value: false, reason: "noExternalIndicatorsFound" };
}

export function isBroadAccessPrincipal(
  principalTitle: string,
  loginName?: string
): boolean {
  const value = `${principalTitle} ${loginName ?? ""}`.toLowerCase();

  return [
    "everyone",
    "everyone except external users",
    "all authenticated users",
    "all users",
    "c:0(.s|true",
    "spo-grid-all-users",
  ].some((pattern) => value.includes(pattern));
}
