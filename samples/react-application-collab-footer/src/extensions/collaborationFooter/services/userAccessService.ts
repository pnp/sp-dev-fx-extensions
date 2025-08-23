import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/site-users/web';
import '@pnp/sp/site-groups/web';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'UserAccessService';

export interface ICurrentUserInfo {
  id: number;
  loginName: string;
  email: string;
  displayName: string;
  groups: string[];
  isSiteAdmin: boolean;
  isSiteOwner: boolean;
}

export interface ITargetUser {
  id: string;
  loginName: string;
  displayName: string;
  email: string;
}

export interface IAccessFilterOptions {
  respectDateRestrictions?: boolean;
  respectMandatoryLinks?: boolean;
  includeInactiveLinks?: boolean;
}

export class UserAccessService {
  private static currentUserCache: ICurrentUserInfo | null = null;
  private static cacheExpiryTime: number = 0;
  private static readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Get current user information with SharePoint group membership
   */
  public static async getCurrentUserInfo(context: WebPartContext): Promise<ICurrentUserInfo> {
    try {
      // Check cache first
      const now = Date.now();
      if (this.currentUserCache && now < this.cacheExpiryTime) {
        return this.currentUserCache;
      }

      const sp = spfi().using(SPFx(context));

      // Get current user info
      const currentUser = await sp.web.currentUser();
      
      // Get user's SharePoint groups
      const userGroups = await sp.web.currentUser.groups();
      
      // Check if user is site admin
      const isSiteAdmin = await this.checkIfSiteAdmin(context);
      
      // Check if user is site owner (simplified check)
      const isSiteOwner = userGroups.some((group: any) => 
        group.Title?.toLowerCase().includes('owner') || 
        group.Title?.toLowerCase().includes('admin')
      );

      const userInfo: ICurrentUserInfo = {
        id: currentUser.Id,
        loginName: currentUser.LoginName,
        email: currentUser.Email,
        displayName: currentUser.Title,
        groups: userGroups.map((group: any) => group.LoginName || group.Title),
        isSiteAdmin,
        isSiteOwner
      };

      // Cache the result
      this.currentUserCache = userInfo;
      this.cacheExpiryTime = now + this.CACHE_DURATION_MS;

      Log.info(LOG_SOURCE, `Retrieved user info for ${userInfo.displayName} with ${userInfo.groups.length} groups`);
      return userInfo;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      
      // Return basic user info if SharePoint calls fail
      return {
        id: 0,
        loginName: context.pageContext.user.loginName,
        email: context.pageContext.user.email,
        displayName: context.pageContext.user.displayName,
        groups: [],
        isSiteAdmin: false,
        isSiteOwner: false
      };
    }
  }

  /**
   * Check if current user is a site collection administrator
   */
  private static async checkIfSiteAdmin(context: WebPartContext): Promise<boolean> {
    try {
      const sp = spfi().using(SPFx(context));
      const siteUsers = await sp.web.siteUsers.filter(`LoginName eq '${context.pageContext.user.loginName}'`)();
      return siteUsers.length > 0 && siteUsers[0].IsSiteAdmin;
    } catch (error) {
      Log.warn(LOG_SOURCE, `Could not check site admin status: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Filter links based on user access permissions and targeting
   */
  public static async filterLinksForCurrentUser(
    links: IContextualMenuItem[],
    context: WebPartContext,
    options: IAccessFilterOptions = {}
  ): Promise<IContextualMenuItem[]> {
    try {
      const currentUser = await this.getCurrentUserInfo(context);
      const filteredLinks: IContextualMenuItem[] = [];
      const now = new Date();

      for (const link of links) {
        const linkData = link as any;
        const dataProperty = linkData.data || {};
        
        // Check if link is active (check both root level and data property, default to true if undefined)
        const isActiveRoot = linkData.isActive;
        const isActiveData = dataProperty.isActive;
        const isActive = isActiveRoot !== undefined ? isActiveRoot : (isActiveData !== undefined ? isActiveData : true);
        
        if (!options.includeInactiveLinks && isActive === false) {
          continue;
        }

        // Check date restrictions (check both root level and data property)
        if (options.respectDateRestrictions !== false) {
          const validFrom = linkData.validFrom || dataProperty.validFrom;
          const validTo = linkData.validTo || dataProperty.validTo;
          
          if (validFrom && new Date(validFrom) > now) {
            continue; // Link not yet active
          }
          
          if (validTo && new Date(validTo) < now) {
            continue; // Link has expired
          }
        }

        // Check audience targeting (check both root level and data property)
        const targetUsers = linkData.targetUsers || dataProperty.targetUsers;
        if (targetUsers && Array.isArray(targetUsers) && targetUsers.length > 0) {
          const hasAccess = await this.checkUserAccess(targetUsers, currentUser);
          if (!hasAccess) {
            continue; // User not in target audience
          }
        }

        // Always include mandatory links regardless of other criteria
        const isMandatory = linkData.isMandatory || dataProperty.isMandatory;
        if (isMandatory) {
          filteredLinks.push(link);
          continue;
        }

        // Include non-mandatory links that pass all checks
        filteredLinks.push(link);
      }

      Log.info(LOG_SOURCE, `Filtered ${links.length} links to ${filteredLinks.length} for user ${currentUser.displayName}`);
      
      
      return filteredLinks;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      // Return all links if filtering fails
      return links;
    }
  }

  /**
   * Check if current user has access based on target user list
   */
  private static async checkUserAccess(
    targetUsers: ITargetUser[],
    currentUser: ICurrentUserInfo
  ): Promise<boolean> {
    try {
      // Check direct user targeting
      const directMatch = targetUsers.some(targetUser => 
        targetUser.loginName.toLowerCase() === currentUser.loginName.toLowerCase() ||
        targetUser.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );

      if (directMatch) {
        return true;
      }

      // Check SharePoint group targeting
      const groupMatch = targetUsers.some(targetUser => {
        // Check if target user is actually a SharePoint group
        const isGroup = targetUser.loginName.includes('c:0+.f|rolemanager|') || 
                       targetUser.loginName.includes('c:0o.c|federateddirectoryclaimprovider|') ||
                       targetUser.displayName.toLowerCase().includes('group');
        
        if (isGroup) {
          // Check if current user is member of this group
          return currentUser.groups.some(userGroup => 
            userGroup.toLowerCase().includes(targetUser.displayName.toLowerCase()) ||
            userGroup.toLowerCase() === targetUser.loginName.toLowerCase()
          );
        }
        
        return false;
      });

      return groupMatch;

    } catch (error) {
      Log.warn(LOG_SOURCE, `Error checking user access: ${(error as Error).message}`);
      return true; // Default to allowing access if check fails
    }
  }

  /**
   * Check if current user can manage links (admin permissions)
   */
  public static async canManageLinks(context: WebPartContext): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUserInfo(context);
      
      // Site admins and owners can always manage links
      if (currentUser.isSiteAdmin || currentUser.isSiteOwner) {
        return true;
      }

      // Check for specific management groups
      const managementGroups = [
        'owners',
        'administrators', 
        'site collection administrators',
        'collaboration footer managers'
      ];

      const hasManagementAccess = currentUser.groups.some(group =>
        managementGroups.some(mgmtGroup =>
          group.toLowerCase().includes(mgmtGroup.toLowerCase())
        )
      );

      return hasManagementAccess;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false; // Default to no management access if check fails
    }
  }

  /**
   * Get filtered organization links for current user
   */
  public static async getFilteredOrganizationLinks(
    organizationLinks: IContextualMenuItem[],
    context: WebPartContext
  ): Promise<IContextualMenuItem[]> {
    
    // TEMPORARY: Skip filtering to test the issue - ALWAYS BYPASS FOR DEBUG
    return organizationLinks;
    
    const filtered = await this.filterLinksForCurrentUser(organizationLinks, context, {
      respectDateRestrictions: true,
      respectMandatoryLinks: true,
      includeInactiveLinks: false
    });
    
    
    return filtered;
  }

  /**
   * Get available SharePoint groups for targeting
   */
  public static async getAvailableGroups(context: WebPartContext): Promise<Array<{key: string, text: string}>> {
    try {
      const sp = spfi().using(SPFx(context));
      const siteGroups = await sp.web.siteGroups();
      
      return siteGroups
        .filter((group: any) => group.Title && !group.IsHiddenInUI)
        .map((group: any) => ({
          key: group.LoginName || group.Title,
          text: group.Title
        }))
        .sort((a: any, b: any) => a.text.localeCompare(b.text));

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [
        { key: 'Everyone', text: 'Everyone' },
        { key: 'Site Members', text: 'Site Members' },
        { key: 'Site Owners', text: 'Site Owners' }
      ];
    }
  }

  /**
   * Validate target users against SharePoint
   */
  public static async validateTargetUsers(
    targetUsers: ITargetUser[],
    context: WebPartContext
  ): Promise<Array<{user: ITargetUser, isValid: boolean, message: string}>> {
    try {
      const sp = spfi().using(SPFx(context));
      const validationResults = [];

      for (const targetUser of targetUsers) {
        try {
          // Try to resolve the user/group
          const resolvedUser = await sp.web.ensureUser(targetUser.loginName);
          
          validationResults.push({
            user: targetUser,
            isValid: true,
            message: `User/Group found: ${resolvedUser.Title}`
          });

        } catch (error) {
          validationResults.push({
            user: targetUser,
            isValid: false,
            message: `Could not resolve user/group: ${(error as Error).message}`
          });
        }
      }

      return validationResults;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return targetUsers.map(user => ({
        user,
        isValid: false,
        message: 'Validation failed'
      }));
    }
  }

  /**
   * Clear user info cache (useful for testing or manual refresh)
   */
  public static clearCache(): void {
    this.currentUserCache = null;
    this.cacheExpiryTime = 0;
    Log.info(LOG_SOURCE, 'User access cache cleared');
  }

  /**
   * Check if link should be shown based on all criteria
   */
  public static async shouldShowLink(
    link: IContextualMenuItem,
    context: WebPartContext
  ): Promise<boolean> {
    try {
      const filteredLinks = await this.filterLinksForCurrentUser([link], context);
      return filteredLinks.length > 0;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return true; // Show link if check fails
    }
  }
}