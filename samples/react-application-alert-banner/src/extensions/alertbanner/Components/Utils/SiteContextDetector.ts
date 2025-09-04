import { MSGraphClientV3 } from "@microsoft/sp-http";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { logger } from '../Services/LoggerService';

export interface ISiteContext {
  siteId: string;
  webId: string;
  siteUrl: string;
  siteName: string;
  siteType: 'regular' | 'hub' | 'homesite' | 'team' | 'communication';
  isHubSite: boolean;
  hubSiteId?: string;
  isHomesite: boolean;
  associatedSites: string[];
  tenantUrl: string;
  userPermissions: ISitePermissions;
  isRootSite: boolean;
}

export interface ISitePermissions {
  canCreateAlerts: boolean;
  canManageAlerts: boolean;
  canViewAlerts: boolean;
  permissionLevel: 'none' | 'read' | 'contribute' | 'design' | 'fullControl' | 'owner';
}

export interface ISiteOption {
  id: string;
  name: string;
  url: string;
  type: 'regular' | 'hub' | 'homesite' | 'team' | 'communication';
  isHub: boolean;
  isHomesite: boolean;
  lastModified: string;
  userPermissions: ISitePermissions;
  parentHubId?: string;
}

export interface ISiteValidationResult {
  siteId: string;
  siteName: string;
  hasAccess: boolean;
  canCreateAlerts: boolean;
  permissionLevel: string;
  error?: string;
}

export class SiteContextDetector {
  private graphClient: MSGraphClientV3;
  private context: ApplicationCustomizerContext;
  private currentSiteContext: ISiteContext | null = null;

  constructor(graphClient: MSGraphClientV3, context: ApplicationCustomizerContext) {
    this.graphClient = graphClient;
    this.context = context;
  }

  /**
   * Get comprehensive context for the current site
   */
  public async getCurrentSiteContext(): Promise<ISiteContext> {
    if (this.currentSiteContext) {
      return this.currentSiteContext;
    }

    try {
      const siteId = this.context.pageContext.site.id.toString();
      const webId = this.context.pageContext.web.id.toString();
      const siteUrl = this.context.pageContext.web.absoluteUrl;
      const siteName = this.context.pageContext.web.title;
      const tenantUrl = `https://${new URL(siteUrl).hostname}`;

      // Get detailed site information
      const siteDetails = await this.graphClient
        .api(`/sites/${siteId}`)
        .expand('drive')
        .get();

      // Check if this is a hub site
      const hubInfo = await this.checkIfHubSite(siteId);

      // Check if this is the organization's home site
      const isHomesite = await this.checkIfHomesite(siteUrl, tenantUrl);

      // Get associated sites if this is a hub
      const associatedSites = hubInfo.isHub ? await this.getAssociatedSites(siteId) : [];

      // Detect site type
      const siteType = this.determineSiteType(siteDetails, hubInfo.isHub, isHomesite);

      // Check user permissions
      const userPermissions = await this.getUserPermissions(siteId);

      // Check if this is the root site
      const isRootSite = this.isRootSiteCollection(siteUrl);

      this.currentSiteContext = {
        siteId,
        webId,
        siteUrl,
        siteName,
        siteType,
        isHubSite: hubInfo.isHub,
        hubSiteId: hubInfo.hubSiteId,
        isHomesite,
        associatedSites,
        tenantUrl,
        userPermissions,
        isRootSite
      };

      return this.currentSiteContext;
    } catch (error) {
      logger.error('SiteContextDetector', 'Failed to get site context', error);

      // Return basic context as fallback
      return {
        siteId: this.context.pageContext.site.id.toString(),
        webId: this.context.pageContext.web.id.toString(),
        siteUrl: this.context.pageContext.web.absoluteUrl,
        siteName: this.context.pageContext.web.title,
        siteType: 'regular',
        isHubSite: false,
        isHomesite: false,
        associatedSites: [],
        tenantUrl: `https://${new URL(this.context.pageContext.web.absoluteUrl).hostname}`,
        userPermissions: {
          canCreateAlerts: false,
          canManageAlerts: false,
          canViewAlerts: true,
          permissionLevel: 'read'
        },
        isRootSite: false
      };
    }
  }

  /**
   * Get sites available for alert distribution
   */
  public async getAvailableSites(includePermissionCheck: boolean = true): Promise<ISiteOption[]> {
    try {
      const currentContext = await this.getCurrentSiteContext();
      // Will collect sites from different sources

      // Get user's followed sites
      const followedSites = await this.getFollowedSites();

      // Get hub associated sites if current site is a hub
      const hubSites = currentContext.isHubSite ?
        await this.getHubAssociatedSites(currentContext.siteId) : [];

      // Get recently visited sites
      const recentSites = await this.getRecentSites();

      // Combine and deduplicate sites
      const allSites = new Map<string, ISiteOption>();

      [...followedSites, ...hubSites, ...recentSites].forEach(site => {
        if (!allSites.has(site.id)) {
          allSites.set(site.id, site);
        }
      });

      // Add permission validation if requested
      if (includePermissionCheck) {
        const sitesWithPermissions = await Promise.all(
          Array.from(allSites.values()).map(async site => {
            try {
              const permissions = await this.getUserPermissions(site.id);
              return {
                ...site,
                userPermissions: permissions
              };
            } catch (error) {
              logger.warn('SiteContextDetector', `Failed to check permissions for site ${site.id}`, error);
              return {
                ...site,
                userPermissions: {
                  canCreateAlerts: false,
                  canManageAlerts: false,
                  canViewAlerts: false,
                  permissionLevel: 'none' as const
                }
              };
            }
          })
        );
        return sitesWithPermissions;
      }

      return Array.from(allSites.values());
    } catch (error) {
      logger.error('SiteContextDetector', 'Failed to get available sites', error);
      return [];
    }
  }

  /**
   * Validate user permissions for multiple sites
   */
  public async validateSiteAccess(siteIds: string[]): Promise<ISiteValidationResult[]> {
    const validationPromises = siteIds.map(async (siteId) => {
      try {
        const site = await this.graphClient
          .api(`/sites/${siteId}`)
          .select('id,displayName,webUrl')
          .get();

        const permissions = await this.getUserPermissions(siteId);

        return {
          siteId,
          siteName: site.displayName,
          hasAccess: permissions.canViewAlerts,
          canCreateAlerts: permissions.canCreateAlerts,
          permissionLevel: permissions.permissionLevel,
        };
      } catch (error) {
        return {
          siteId,
          siteName: 'Unknown Site',
          hasAccess: false,
          canCreateAlerts: false,
          permissionLevel: 'none',
          error: error.message
        };
      }
    });

    return Promise.all(validationPromises);
  }

  /**
   * Get suggested distribution scopes based on current context
   */
  public async getSuggestedDistributionScopes(): Promise<{
    currentSite: ISiteOption;
    hubSites?: ISiteOption[];
    homesite?: ISiteOption;
    recentSites: ISiteOption[];
    followedSites: ISiteOption[];
  }> {
    const currentContext = await this.getCurrentSiteContext();
    const currentSite: ISiteOption = {
      id: currentContext.siteId,
      name: currentContext.siteName,
      url: currentContext.siteUrl,
      type: currentContext.siteType,
      isHub: currentContext.isHubSite,
      isHomesite: currentContext.isHomesite,
      lastModified: new Date().toISOString(),
      userPermissions: currentContext.userPermissions
    };

    const [recentSites, followedSites] = await Promise.all([
      this.getRecentSites(),
      this.getFollowedSites()
    ]);

    const result: any = {
      currentSite,
      recentSites: recentSites.slice(0, 5), // Limit to 5 most recent
      followedSites: followedSites.slice(0, 10) // Limit to 10 most followed
    };

    // Add hub sites if current site is a hub
    if (currentContext.isHubSite) {
      result.hubSites = await this.getHubAssociatedSites(currentContext.siteId);
    }

    // Add homesite if different from current
    if (!currentContext.isHomesite) {
      const homesite = await this.getHomesite();
      if (homesite) {
        result.homesite = homesite;
      }
    }

    return result;
  }

  // Private helper methods

  private async checkIfHubSite(siteId: string): Promise<{ isHub: boolean; hubSiteId?: string }> {
    try {
      // Check if site is associated with a hub by getting site details
      const siteDetails = await this.graphClient
        .api(`/sites/${siteId}`)
        .select('sharepointIds,webUrl')
        .get();

      // Check if this site has a hub site ID (meaning it's associated with a hub)
      if (siteDetails.sharepointIds?.hubSiteId) {
        return { isHub: false, hubSiteId: siteDetails.sharepointIds.hubSiteId };
      }

      // Skip hub site detection via Graph API filtering as it's not reliably supported
      // We'll rely on other methods or SharePoint context for hub site detection
      logger.debug('SiteContextDetector', 'Skipping Graph API hub site filtering - not supported in all tenants');

      // Fallback: Use SharePoint REST API through the current context if available
      if (this.context.pageContext.site.id.toString() === siteId) {
        // For the current site, we can use SPFx context information
        // This would require additional SharePoint-specific properties
        return { isHub: false };
      }

      return { isHub: false };
    } catch (error) {
      logger.warn('SiteContextDetector', 'Could not determine hub site status', error);
      return { isHub: false };
    }
  }

  private async checkIfHomesite(siteUrl: string, tenantUrl: string): Promise<boolean> {
    try {
      // Check if URL pattern suggests this is the homesite
      const url = new URL(siteUrl);
      const isRootSite = url.pathname === '/' || url.pathname === '';

      if (isRootSite) {
        // Additional verification could be done here
        return true;
      }

      return false;
    } catch (error) {
      logger.warn('SiteContextDetector', 'Could not determine homesite status', error);
      return false;
    }
  }

  private async getAssociatedSites(hubSiteId: string): Promise<string[]> {
    try {
      // Skip associated sites query via Graph API filtering as it's not supported in all tenants
      logger.debug('SiteContextDetector', `Associated sites query skipped for hub ${hubSiteId} - Graph API filtering not reliable`);
      return [];
    } catch (error) {
      logger.warn('SiteContextDetector', 'Could not get associated sites', error);
      return [];
    }
  }

  private determineSiteType(siteDetails: any, isHub: boolean, isHomesite: boolean): 'regular' | 'hub' | 'homesite' | 'team' | 'communication' {
    if (isHomesite) return 'homesite';
    if (isHub) return 'hub';

    // Try to determine if it's a Teams site or Communication site
    if (siteDetails.webUrl?.includes('/teams/')) {
      return 'team';
    }

    if (siteDetails.description?.toLowerCase().includes('communication')) {
      return 'communication';
    }

    return 'regular';
  }

  private async getUserPermissions(siteId: string): Promise<ISitePermissions> {
    try {
      // Try multiple approaches to determine permissions
      let hasWritePermission = false;
      let hasOwnerPermission = false;
      let permissionLevel: 'none' | 'read' | 'contribute' | 'design' | 'fullControl' | 'owner' = 'read';

      try {
        // First, try to get the current user's effective permissions
        await this.graphClient
          .api(`/sites/${siteId}/drive/root`)
          .select('permissions')
          .get();

        // If we can access the drive root, user likely has write permissions
        hasWritePermission = true;

        // Try to check if user has elevated permissions by testing list creation capability
        try {
          await this.graphClient
            .api(`/sites/${siteId}/lists`)
            .select('id,displayName')
            .top(1)
            .get();

          // If we can read lists, user likely has contribute or higher permissions
          permissionLevel = 'contribute';
          
          // Additional check: try to access site columns (requires design or full control)
          try {
            await this.graphClient
              .api(`/sites/${siteId}/columns`)
              .select('id')
              .top(1)
              .get();
            
            hasOwnerPermission = true;
            permissionLevel = 'fullControl';
          } catch (columnError) {
            // Can't read site columns, stick with contribute level
          }
        } catch (permError) {
          // Can't read lists, but can access content
          permissionLevel = 'contribute';
        }
      } catch (driveError) {
        // Can't access drive, try other methods
        try {
          // Try to get site information - if successful, user has at least read access
          await this.graphClient
            .api(`/sites/${siteId}`)
            .select('id,displayName')
            .get();

          // Try to access lists to determine write permissions
          try {
            await this.graphClient
              .api(`/sites/${siteId}/lists`)
              .top(1)
              .get();

            hasWritePermission = true;
            permissionLevel = 'contribute';
          } catch (listError) {
            // Can only read basic site info
            permissionLevel = 'read';
          }
        } catch (siteError) {
          // No access at all
          permissionLevel = 'none';
          return {
            canCreateAlerts: false,
            canManageAlerts: false,
            canViewAlerts: false,
            permissionLevel: 'none'
          };
        }
      }

      // Additional check: if this is the current site and user is logged in, 
      // assume they have at least read access
      const currentSiteId = this.context.pageContext.site.id.toString();
      if (siteId === currentSiteId) {
        // User is on the current site, so they must have access
        hasWritePermission = true; // Assume write permission for current site
        permissionLevel = hasOwnerPermission ? 'owner' : 'contribute';
      }

      return {
        canCreateAlerts: hasWritePermission,
        canManageAlerts: hasOwnerPermission,
        canViewAlerts: true,
        permissionLevel
      };
    } catch (error) {
      logger.warn('SiteContextDetector', `Could not get user permissions for site ${siteId}`, error);

      // For the current site, assume user has permissions since they're viewing it
      const currentSiteId = this.context.pageContext.site.id.toString();
      if (siteId === currentSiteId) {
        return {
          canCreateAlerts: true,
          canManageAlerts: true,
          canViewAlerts: true,
          permissionLevel: 'contribute'
        };
      }

      return {
        canCreateAlerts: false,
        canManageAlerts: false,
        canViewAlerts: true,
        permissionLevel: 'read'
      };
    }
  }

  private isRootSiteCollection(siteUrl: string): boolean {
    try {
      const url = new URL(siteUrl);
      const path = url.pathname;
      return path === '/' || path === '' || path === '/sites/root';
    } catch {
      return false;
    }
  }

  private async getFollowedSites(): Promise<ISiteOption[]> {
    try {
      const followedSites = await this.graphClient
        .api('/me/followedSites')
        .select('id,displayName,webUrl,lastModifiedDateTime')
        .get();

      return followedSites.value.map((site: any) => ({
        id: site.id,
        name: site.displayName,
        url: site.webUrl,
        type: 'regular' as const,
        isHub: false,
        isHomesite: false,
        lastModified: site.lastModifiedDateTime,
        userPermissions: {
          canCreateAlerts: false, // Will be determined later if needed
          canManageAlerts: false,
          canViewAlerts: true,
          permissionLevel: 'read' as const
        }
      }));
    } catch (error) {
      logger.warn('SiteContextDetector', 'Could not get followed sites', error);
      return [];
    }
  }

  private async getHubAssociatedSites(hubSiteId: string): Promise<ISiteOption[]> {
    try {
      // Skip hub site filtering via Graph API as it's not supported in all tenants
      logger.debug('SiteContextDetector', 'Hub associated sites query skipped - Graph API filtering not reliable');
      return [];
    } catch (error) {
      logger.warn('SiteContextDetector', 'Could not get hub associated sites', error);
      return [];
    }
  }

  private async getRecentSites(): Promise<ISiteOption[]> {
    try {
      // Get recent sites from user's activity
      const recentSites = await this.graphClient
        .api('/me/insights/used')
        .filter("resourceVisualization/type eq 'Web'")
        .top(10)
        .get();

      return recentSites.value
        .filter((item: any) => item.resourceReference?.webUrl)
        .map((item: any) => ({
          id: this.extractSiteIdFromUrl(item.resourceReference.webUrl),
          name: item.resourceVisualization.title,
          url: item.resourceReference.webUrl,
          type: 'regular' as const,
          isHub: false,
          isHomesite: false,
          lastModified: item.lastUsed.lastAccessedDateTime,
          userPermissions: {
            canCreateAlerts: false,
            canManageAlerts: false,
            canViewAlerts: true,
            permissionLevel: 'read' as const
          }
        }))
        .filter((site: ISiteOption) => site.id); // Filter out sites where ID extraction failed
    } catch (error) {
      logger.warn('SiteContextDetector', 'Could not get recent sites', error);
      return [];
    }
  }

  private async getHomesite(): Promise<ISiteOption | null> {
    try {
      // Try to get the organization's home site
      const tenantUrl = this.currentSiteContext?.tenantUrl ||
        `https://${new URL(this.context.pageContext.web.absoluteUrl).hostname}`;

      const homeSite = await this.graphClient
        .api(`/sites/${tenantUrl}:/`)
        .select('id,displayName,webUrl')
        .get();

      return {
        id: homeSite.id,
        name: homeSite.displayName,
        url: homeSite.webUrl,
        type: 'homesite',
        isHub: false,
        isHomesite: true,
        lastModified: new Date().toISOString(),
        userPermissions: {
          canCreateAlerts: false,
          canManageAlerts: false,
          canViewAlerts: true,
          permissionLevel: 'read'
        }
      };
    } catch (error) {
      logger.warn('SiteContextDetector', 'Could not get homesite', error);
      return null;
    }
  }

  private extractSiteIdFromUrl(url: string): string {
    try {
      // Extract site ID from SharePoint URL
      // This is a simplified approach - in reality, you might need to make an API call
      const match = url.match(/\/sites\/([^\/]+)/);
      return match ? match[1] : '';
    } catch {
      return '';
    }
  }
}