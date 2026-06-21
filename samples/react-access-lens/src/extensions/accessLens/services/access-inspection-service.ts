import type { SPFI } from "@pnp/sp";

import type { AccessLensContext, UserInfo, WebContextInfo, LibraryContextInfo } from "../models/access-lens-context";
import type { InspectionError } from "../models/inspection-error";
import type { PermissionInspectionResult, AccessSummary, EffectivePermissionSource } from "../models/permission-inspection-result";
import type { RoleAssignmentInfo } from "../models/role-assignment-info";
import type { RiskIndicator } from "../models/risk-indicator";
import type { PermissionService } from "./sharepoint-permission-service";

import { mapRoleAssignments, getRoleNameSummaries } from "../mappers/role-assignment-mapper";
import { getEffectivePermissionSource, getEffectiveAssignments } from "../mappers/effective-permission-mapper";
import { calculateRiskIndicators, OwnerGroupInfo } from "../mappers/risk-mapper";

export interface InspectionRunParams {
  listId: string;
  webServerRelativeUrl: string;
  siteServerRelativeUrl: string;
  webAbsoluteUrl: string;
  currentUser?: UserInfo;
  isDebugMode: boolean;
}

export interface AccessInspectionService {
  runInspection(params: InspectionRunParams): Promise<PermissionInspectionResult>;
}

export function createAccessInspectionService(
  permissionService: PermissionService,
  _sp: SPFI
): AccessInspectionService {
  return {
    async runInspection(
      params: InspectionRunParams
    ): Promise<PermissionInspectionResult> {
      const inspectedAt = new Date().toISOString();
      const errors: InspectionError[] = [];
      const advancedRaw: Record<string, unknown> = {};

      // 1. Fetch web and library metadata in parallel (Sec. 18.3 step 1)
      let webMeta: Awaited<ReturnType<PermissionService["getWebMetadata"]>> | undefined;
      let libMeta: Awaited<ReturnType<PermissionService["getLibraryMetadata"]>> | undefined;

      try {
        [webMeta, libMeta] = await Promise.all([
          permissionService.getWebMetadata(),
          permissionService.getLibraryMetadata(params.listId),
        ]);
      } catch {
        // If either fails we need to know which one
      }

      // If the parallel call failed, try individually to identify the specific failure
      if (!webMeta || !libMeta) {
        if (!webMeta) {
          try {
            webMeta = await permissionService.getWebMetadata();
          } catch (err: unknown) {
            errors.push({
              scope: "web",
              message: "Could not load site/web information.",
              technicalMessage: extractMessage(err),
              statusCode: extractStatus(err),
              recoverable: false,
            });
          }
        }
        if (!libMeta) {
          try {
            libMeta = await permissionService.getLibraryMetadata(params.listId);
          } catch (err: unknown) {
            errors.push({
              scope: "library",
              message: "Could not load library information.",
              technicalMessage: extractMessage(err),
              statusCode: extractStatus(err),
              recoverable: false,
            });
          }
        }
      }

      // Web/library info failure → stop inspection (Sec. 17.1)
      if (!webMeta || !libMeta) {
        return buildFailedResult(
          params, inspectedAt, errors, advancedRaw,
          webMeta, libMeta
        );
      }

      if (params.isDebugMode) {
        advancedRaw.webMetadata = webMeta;
        advancedRaw.libraryMetadata = libMeta;
      }

      // Runtime validation: supported library check
      if (libMeta.BaseType !== 1 || libMeta.Hidden === true) {
        errors.push({
          scope: "library",
          message:
            "The current list is not a supported document library context.",
          recoverable: false,
        });
        return buildFailedResult(
          params, inspectedAt, errors, advancedRaw,
          webMeta, libMeta
        );
      }

      // Build context objects
      const isRootWeb =
        params.webServerRelativeUrl.toLowerCase() ===
        params.siteServerRelativeUrl.toLowerCase();

      const webContext: WebContextInfo = {
        title: webMeta.Title,
        absoluteUrl: webMeta.Url,
        serverRelativeUrl: webMeta.ServerRelativeUrl,
        hasUniqueRoleAssignments: webMeta.HasUniqueRoleAssignments,
        isRootWeb,
        inheritanceStatus: isRootWeb
          ? "rootWeb"
          : webMeta.HasUniqueRoleAssignments
            ? "hasUniquePermissions"
            : "inheritsFromParentWeb",
      };

      const origin = new URL(params.webAbsoluteUrl).origin;
      const libraryContext: LibraryContextInfo = {
        id: libMeta.Id,
        title: libMeta.Title,
        absoluteUrl: origin + libMeta.RootFolder.ServerRelativeUrl,
        serverRelativeUrl: libMeta.RootFolder.ServerRelativeUrl,
        baseTemplate: libMeta.BaseTemplate,
        baseType: libMeta.BaseType,
        hidden: libMeta.Hidden,
        hasUniqueRoleAssignments: libMeta.HasUniqueRoleAssignments,
        inheritanceStatus: libMeta.HasUniqueRoleAssignments
          ? "hasUniquePermissions"
          : "inheritsFromCurrentWeb",
      };

      // 2. Fetch role assignments based on inheritance (Sec. 18.3 step 2)
      let rawWebAssignments: unknown[] | undefined;
      let rawLibAssignments: unknown[] | undefined;
      let canReadWebAssignments = false;
      let canReadLibAssignments = false;

      const libraryInherits = libMeta.HasUniqueRoleAssignments === false;
      const libraryHasUnique = libMeta.HasUniqueRoleAssignments === true;
      const inheritanceUnknown =
        libMeta.HasUniqueRoleAssignments === undefined ||
        libMeta.HasUniqueRoleAssignments === null;

      if (libraryInherits) {
        // Only load web role assignments
        try {
          rawWebAssignments = await permissionService.getWebRoleAssignments();
          canReadWebAssignments = true;
          if (params.isDebugMode) {
            advancedRaw.webRoleAssignments = rawWebAssignments;
          }
        } catch (err: unknown) {
          errors.push({
            scope: "web",
            message: "Current web permissions could not be inspected.",
            technicalMessage: extractMessage(err),
            statusCode: extractStatus(err),
            recoverable: true,
          });
        }
      } else if (libraryHasUnique) {
        // Load web and library role assignments in parallel
        await Promise.all([
          permissionService
            .getWebRoleAssignments()
            .then((v) => {
              rawWebAssignments = v;
              canReadWebAssignments = true;
              if (params.isDebugMode) advancedRaw.webRoleAssignments = v;
            })
            .catch((err: unknown) => {
              errors.push({
                scope: "web",
                message: "Current web permissions could not be inspected.",
                technicalMessage: extractMessage(err),
                statusCode: extractStatus(err),
                recoverable: true,
              });
            }),
          permissionService
            .getLibraryRoleAssignments(params.listId)
            .then((v) => {
              rawLibAssignments = v;
              canReadLibAssignments = true;
              if (params.isDebugMode) advancedRaw.libraryRoleAssignments = v;
            })
            .catch((err: unknown) => {
              errors.push({
                scope: "library",
                message: "Library permissions could not be inspected.",
                technicalMessage: extractMessage(err),
                statusCode: extractStatus(err),
                recoverable: true,
              });
            }),
        ]);
      } else {
        // Inheritance unknown → load both in parallel, mark partial
        await Promise.all([
          permissionService
            .getWebRoleAssignments()
            .then((v) => {
              rawWebAssignments = v;
              canReadWebAssignments = true;
              if (params.isDebugMode) advancedRaw.webRoleAssignments = v;
            })
            .catch((err: unknown) => {
              errors.push({
                scope: "web",
                message: "Current web permissions could not be inspected.",
                technicalMessage: extractMessage(err),
                statusCode: extractStatus(err),
                recoverable: true,
              });
            }),
          permissionService
            .getLibraryRoleAssignments(params.listId)
            .then((v) => {
              rawLibAssignments = v;
              canReadLibAssignments = true;
              if (params.isDebugMode) advancedRaw.libraryRoleAssignments = v;
            })
            .catch((err: unknown) => {
              errors.push({
                scope: "library",
                message: "Library permissions could not be inspected.",
                technicalMessage: extractMessage(err),
                statusCode: extractStatus(err),
                recoverable: true,
              });
            }),
        ]);
      }

      // 3. Map raw assignments through role-assignment-mapper
      const webAssignments = rawWebAssignments
        ? mapRoleAssignments(
            rawWebAssignments as Parameters<typeof mapRoleAssignments>[0],
            "web"
          )
        : [];

      const libraryAssignments = rawLibAssignments
        ? mapRoleAssignments(
            rawLibAssignments as Parameters<typeof mapRoleAssignments>[0],
            "library"
          )
        : [];

      // 4. Determine effective permission source
      const effectivePermissionSource = getEffectivePermissionSource(
        libraryContext.hasUniqueRoleAssignments,
        canReadLibAssignments,
        canReadWebAssignments
      );

      // 5. Get effective assignments
      const effectiveAssignments = getEffectiveAssignments(
        effectivePermissionSource,
        webAssignments,
        libraryAssignments
      );

      // 6. Fetch owner group for risk evaluation
      let ownerGroupInfo: OwnerGroupInfo | undefined;
      try {
        const ownerResult = await permissionService.getAssociatedOwnerGroup();
        ownerGroupInfo = {
          groupId: ownerResult.groupId,
          visibleOwnerCount: ownerResult.visibleOwnerCount,
          couldNotLoad: ownerResult.couldNotLoad,
        };
      } catch {
        ownerGroupInfo = { couldNotLoad: true };
      }

      // 7. Calculate risk indicators
      const riskIndicators: RiskIndicator[] = calculateRiskIndicators(
        effectiveAssignments,
        libraryContext,
        ownerGroupInfo
      );

      // 8. Build access summary
      const { roleNames, allRoleNames } =
        getRoleNameSummaries(effectiveAssignments);

      const isPartial = errors.length > 0 || inheritanceUnknown;

      const summary: AccessSummary = {
        totalAssignments: webAssignments.length + libraryAssignments.length,
        webAssignments: webAssignments.length,
        libraryAssignments: libraryInherits ? 0 : libraryAssignments.length,
        effectiveAssignments: effectiveAssignments.length,
        effectivePermissionSource,
        sharePointGroups: countByKind(effectiveAssignments, "sharePointGroup"),
        directUsers: countByKind(effectiveAssignments, "user"),
        securityOrClaimPrincipals:
          countByKind(effectiveAssignments, "securityGroup") +
          countByKind(effectiveAssignments, "claim") +
          countByKind(effectiveAssignments, "distributionList"),
        externalPrincipals: effectiveAssignments.filter(
          (a) => a.isExternal === true
        ).length,
        broadAccessPrincipals: effectiveAssignments.filter(
          (a) => a.isBroadAccess === true
        ).length,
        limitedAccessAssignments: effectiveAssignments.filter((a) =>
          a.roleDefinitions.some(
            (rd) => rd.name === "Limited Access" || rd.hidden === true
          )
        ).length,
        roleNames,
        allRoleNames,
      };

      const context: AccessLensContext = {
        web: webContext,
        library: libraryContext,
        currentUser: params.currentUser,
        inspectedAt,
      };

      return {
        context,
        webAssignments,
        libraryAssignments,
        effectiveAssignments,
        effectivePermissionSource,
        riskIndicators,
        summary,
        errors,
        isPartial,
        isDebugMode: params.isDebugMode,
        advancedRaw: params.isDebugMode ? advancedRaw : undefined,
      };
    },
  };
}

function countByKind(
  assignments: RoleAssignmentInfo[],
  kind: RoleAssignmentInfo["principalKind"]
): number {
  return assignments.filter((a) => a.principalKind === kind).length;
}

function buildFailedResult(
  params: InspectionRunParams,
  inspectedAt: string,
  errors: InspectionError[],
  advancedRaw: Record<string, unknown>,
  webMeta?: { Title: string; Url: string; ServerRelativeUrl: string; HasUniqueRoleAssignments: boolean },
  libMeta?: { Id: string; Title: string; BaseTemplate: number; BaseType: number; Hidden: boolean; HasUniqueRoleAssignments: boolean; RootFolder: { ServerRelativeUrl: string } }
): PermissionInspectionResult {
  const isRootWeb =
    params.webServerRelativeUrl.toLowerCase() ===
    params.siteServerRelativeUrl.toLowerCase();

  const webContext: WebContextInfo = webMeta
    ? {
        title: webMeta.Title,
        absoluteUrl: webMeta.Url,
        serverRelativeUrl: webMeta.ServerRelativeUrl,
        hasUniqueRoleAssignments: webMeta.HasUniqueRoleAssignments,
        isRootWeb,
        inheritanceStatus: isRootWeb
          ? "rootWeb"
          : webMeta.HasUniqueRoleAssignments
            ? "hasUniquePermissions"
            : "inheritsFromParentWeb",
      }
    : {
        title: "",
        absoluteUrl: params.webAbsoluteUrl,
        serverRelativeUrl: params.webServerRelativeUrl,
        inheritanceStatus: "unknown" as const,
      };

  const libraryContext: LibraryContextInfo = libMeta
    ? {
        id: libMeta.Id,
        title: libMeta.Title,
        absoluteUrl:
          new URL(params.webAbsoluteUrl).origin +
          libMeta.RootFolder.ServerRelativeUrl,
        serverRelativeUrl: libMeta.RootFolder.ServerRelativeUrl,
        baseTemplate: libMeta.BaseTemplate,
        baseType: libMeta.BaseType,
        hidden: libMeta.Hidden,
        hasUniqueRoleAssignments: libMeta.HasUniqueRoleAssignments,
        inheritanceStatus: libMeta.HasUniqueRoleAssignments
          ? "hasUniquePermissions"
          : "inheritsFromCurrentWeb",
      }
    : {
        id: params.listId,
        title: "",
        absoluteUrl: "",
        serverRelativeUrl: "",
        inheritanceStatus: "unknown" as const,
      };

  return {
    context: {
      web: webContext,
      library: libraryContext,
      currentUser: params.currentUser,
      inspectedAt,
    },
    webAssignments: [],
    libraryAssignments: [],
    effectiveAssignments: [],
    effectivePermissionSource: "unknown" as EffectivePermissionSource,
    riskIndicators: [],
    summary: {
      totalAssignments: 0,
      webAssignments: 0,
      libraryAssignments: 0,
      effectiveAssignments: 0,
      effectivePermissionSource: "unknown",
      sharePointGroups: 0,
      directUsers: 0,
      securityOrClaimPrincipals: 0,
      externalPrincipals: 0,
      broadAccessPrincipals: 0,
      limitedAccessAssignments: 0,
      roleNames: [],
      allRoleNames: [],
    },
    errors,
    isPartial: true,
    isDebugMode: params.isDebugMode,
    advancedRaw: params.isDebugMode ? advancedRaw : undefined,
  };
}

function extractMessage(err: unknown): string | undefined {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return undefined;
}

function extractStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}
