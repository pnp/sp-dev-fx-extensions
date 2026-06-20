import type { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/security/web";
import "@pnp/sp/security/list";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/site-users/web";

import type { RawRoleAssignment } from "../mappers/role-assignment-mapper";

export interface WebMetadata {
  Title: string;
  Url: string;
  ServerRelativeUrl: string;
  HasUniqueRoleAssignments: boolean;
}

export interface LibraryMetadata {
  Id: string;
  Title: string;
  BaseTemplate: number;
  BaseType: number;
  Hidden: boolean;
  HasUniqueRoleAssignments: boolean;
  RootFolder: { ServerRelativeUrl: string };
}

export interface OwnerGroupResult {
  groupId?: number;
  visibleOwnerCount?: number;
  couldNotLoad?: boolean;
}

export interface PermissionService {
  getWebMetadata(): Promise<WebMetadata>;
  getLibraryMetadata(listId: string): Promise<LibraryMetadata>;
  getWebRoleAssignments(): Promise<RawRoleAssignment[]>;
  getLibraryRoleAssignments(listId: string): Promise<RawRoleAssignment[]>;
  getAssociatedOwnerGroup(): Promise<OwnerGroupResult>;
}

const ROLE_ASSIGNMENT_SELECT = [
  "PrincipalId",
  "Member/Id",
  "Member/Title",
  "Member/LoginName",
  "Member/PrincipalType",
  "RoleDefinitionBindings/Id",
  "RoleDefinitionBindings/Name",
  "RoleDefinitionBindings/Description",
  "RoleDefinitionBindings/RoleTypeKind",
  "RoleDefinitionBindings/Hidden",
];

const ROLE_ASSIGNMENT_EXPAND = ["Member", "RoleDefinitionBindings"];

export function createPermissionService(sp: SPFI): PermissionService {
  return {
    async getWebMetadata(): Promise<WebMetadata> {
      return withRetry(() =>
        sp.web.select(
          "Title",
          "Url",
          "ServerRelativeUrl",
          "HasUniqueRoleAssignments"
        )()
      );
    },

    async getLibraryMetadata(listId: string): Promise<LibraryMetadata> {
      return withRetry(() =>
        sp.web.lists
          .getById(listId)
          .select(
            "Id",
            "Title",
            "BaseTemplate",
            "BaseType",
            "Hidden",
            "HasUniqueRoleAssignments",
            "RootFolder/ServerRelativeUrl"
          )
          .expand("RootFolder")()
      );
    },

    async getWebRoleAssignments(): Promise<RawRoleAssignment[]> {
      return withRetry(() =>
        sp.web.roleAssignments
          .expand(...ROLE_ASSIGNMENT_EXPAND)
          .select(...ROLE_ASSIGNMENT_SELECT)()
      ) as Promise<RawRoleAssignment[]>;
    },

    async getLibraryRoleAssignments(
      listId: string
    ): Promise<RawRoleAssignment[]> {
      return withRetry(() =>
        sp.web.lists
          .getById(listId)
          .roleAssignments.expand(...ROLE_ASSIGNMENT_EXPAND)
          .select(...ROLE_ASSIGNMENT_SELECT)()
      ) as Promise<RawRoleAssignment[]>;
    },

    async getAssociatedOwnerGroup(): Promise<OwnerGroupResult> {
      try {
        const group = await withRetry(() =>
          sp.web.associatedOwnerGroup.select("Id")()
        );

        const users = await withRetry(() =>
          sp.web.associatedOwnerGroup.users.select(
            "Id",
            "Title",
            "LoginName"
          )()
        );

        return {
          groupId: group.Id,
          visibleOwnerCount: users.length,
        };
      } catch {
        return { couldNotLoad: true };
      }
    },
  };
}

// Retry logic per Sec. 17.3:
// - 429: retry once, respect Retry-After header (default 5s)
// - 5xx: retry once after 1s
// - 401/403: no retry
// - Max one retry per request
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    const status = extractStatusCode(error);

    if (status === 429) {
      const retryAfterMs = extractRetryAfterMs(error) ?? 5000;
      await delay(retryAfterMs);
      return fn();
    }

    if (status !== undefined && status >= 500) {
      await delay(1000);
      return fn();
    }

    throw error;
  }
}

function extractStatusCode(error: unknown): number | undefined {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

function extractRetryAfterMs(error: unknown): number | undefined {
  if (error && typeof error === "object" && "headers" in error) {
    const headers = (error as { headers: unknown }).headers;
    if (headers && typeof headers === "object" && "get" in headers) {
      const headerValue = (
        headers as { get: (name: string) => string | null }
      ).get("Retry-After");
      if (headerValue) {
        const seconds = parseInt(headerValue, 10);
        if (!isNaN(seconds) && seconds > 0) {
          return seconds * 1000;
        }
      }
    }
  }
  return undefined;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
