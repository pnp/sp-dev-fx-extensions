import type { SPFI } from "@pnp/sp";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/site-users/web";

import type { GroupMemberInfo } from "../models/role-assignment-info";
import { classifyExternalPrincipal, mapPrincipalKind } from "../mappers/principal-mapper";

export interface GroupExpansionService {
  getGroupMembers(groupId: number): Promise<GroupMemberInfo[]>;
  clearCache(): void;
}

export function createGroupExpansionService(sp: SPFI): GroupExpansionService {
  const cache = new Map<number, GroupMemberInfo[]>();

  return {
    async getGroupMembers(groupId: number): Promise<GroupMemberInfo[]> {
      const cached = cache.get(groupId);
      if (cached) {
        return cached;
      }

      const rawUsers = await sp.web.siteGroups
        .getById(groupId)
        .users.select("Id", "Title", "LoginName", "Email", "PrincipalType")();

      const members: GroupMemberInfo[] = rawUsers.map(
        (u: {
          Id: number;
          Title: string;
          LoginName?: string;
          Email?: string;
          PrincipalType?: number;
        }) => {
          const principalKind = mapPrincipalKind(u.PrincipalType, u.LoginName);
          const externalClassification = classifyExternalPrincipal({
            loginName: u.LoginName,
          });

          return {
            id: u.Id,
            title: u.Title,
            loginName: u.LoginName,
            email: u.Email,
            principalTypeRaw: u.PrincipalType,
            principalKind,
            isExternal: externalClassification.value,
          };
        }
      );

      cache.set(groupId, members);
      return members;
    },

    clearCache(): void {
      cache.clear();
    },
  };
}
