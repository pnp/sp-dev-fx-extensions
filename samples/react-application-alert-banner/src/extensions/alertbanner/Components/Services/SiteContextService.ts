import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { logger } from './LoggerService';
import { MSGraphClientV3 } from "@microsoft/sp-http";

export interface ISiteInfo {
  id: string;
  url: string;
  name: string;
  type: 'current' | 'hub' | 'home';
  hasAlertsList?: boolean;
}

export interface IAlertListStatus {
  exists: boolean;
  canAccess: boolean;
  canCreate: boolean;
  error?: string;
}

export class SiteContextService {
  private static _instance: SiteContextService;
  private _context: ApplicationCustomizerContext;
  private _graphClient: MSGraphClientV3;
  private _homeSiteInfo: ISiteInfo | null = null;
  private _hubSiteInfo: ISiteInfo | null = null;
  private _currentSiteInfo: ISiteInfo | null = null;
  private readonly alertsListName = 'Alerts';

  public static getInstance(
    context?: ApplicationCustomizerContext,
    graphClient?: MSGraphClientV3
  ): SiteContextService {
    if (!SiteContextService._instance) {
      SiteContextService._instance = new SiteContextService(context, graphClient);
    }
    return SiteContextService._instance;
  }

  private constructor(
    context?: ApplicationCustomizerContext,
    graphClient?: MSGraphClientV3
  ) {
    if (context) this._context = context;
    if (graphClient) this._graphClient = graphClient;
  }

  /**
   * Initialize the service and detect site context
   */
  public async initialize(): Promise<void> {
    if (!this._context || !this._graphClient) {
      throw new Error('SiteContextService requires context and graphClient');
    }

    await this.detectSiteContext();
  }

  /**
   * Detect current site, hub site, and home site
   */
  private async detectSiteContext(): Promise<void> {
    try {
      // Get current site info
      this._currentSiteInfo = {
        id: this._context.pageContext.site.id.toString(),
        url: this._context.pageContext.site.absoluteUrl,
        name: (this._context.pageContext.site as any).displayName || 'Current Site',
        type: 'current'
      };

      // Detect home site
      await this.detectHomeSite();

      // Detect hub site if current site is connected to a hub
      await this.detectHubSite();

      // Check alert lists for all sites
      await this.checkAlertLists();

    } catch (error) {
      logger.error('SiteContextService', 'Failed to detect site context', error);
    }
  }

  /**
   * Detect the tenant's home site using user-accessible APIs
   */
  private async detectHomeSite(): Promise<void> {
    try {
      // Use the more accessible approach: try to get organization settings
      // This doesn't require SharePoint Admin permissions
      const orgResponse = await this._graphClient
        .api('/organization')
        .get();

      // Try to get tenant information which might include home site
      if (orgResponse?.value?.[0]) {
        const tenantId = orgResponse.value[0].id;
        
        // Try to find home site through organization information
        try {
          const homeSiteResponse = await this._graphClient
            .api('/sites/root')
            .get();

          // Check if root site is configured as home site
          if (homeSiteResponse?.sharepointIds?.tenantId === tenantId) {
            this._homeSiteInfo = {
              id: homeSiteResponse.id,
              url: homeSiteResponse.webUrl,
              name: (homeSiteResponse as any).displayName || (homeSiteResponse as any).name || 'Home Site',
              type: 'home'
            };
          }
        } catch (rootError) {
          logger.debug('SiteContextService', 'Root site not accessible or not home site');
        }
      }

      // If still no home site found, try alternative search method
      if (!this._homeSiteInfo) {
        await this.searchForHomeSite();
      }
    } catch (error) {
      logger.warn('SiteContextService', 'Could not detect home site through organization API', error);
      // Try alternative method using search
      await this.searchForHomeSite();
    }
  }

  /**
   * Alternative method to find home site using user-accessible APIs
   */
  private async searchForHomeSite(): Promise<void> {
    try {
      // Try to use Microsoft Search API which is more accessible
      const searchResponse = await this._graphClient
        .api('/search/query')
        .post({
          requests: [{
            entityTypes: ['site'],
            query: 'IsHomeSite:true OR SiteTemplate:SITEPAGEPUBLISHING',
            from: 0,
            size: 5
          }]
        });

      const results = searchResponse.value[0]?.hitsContainers[0]?.hits;
      if (results && results.length > 0) {
        // Look for a site that might be the home site
        for (const result of results) {
          const site = result.resource;
          // Check if this looks like a home site (typically has specific characteristics)
          if (site.webUrl && (site.webUrl.includes('/sites/home') || 
                             site.webUrl.includes('/sites/intranet') ||
                             site.displayName?.toLowerCase().includes('home') ||
                             site.displayName?.toLowerCase().includes('intranet'))) {
            this._homeSiteInfo = {
              id: site.id || site.siteId,
              url: site.webUrl,
              name: site.displayName || site.name || 'Home Site',
              type: 'home'
            };
            break;
          }
        }

        // If no obvious home site found, use the first result as a fallback
        if (!this._homeSiteInfo && results.length > 0) {
          const firstSite = results[0].resource;
          this._homeSiteInfo = {
            id: firstSite.id || firstSite.siteId,
            url: firstSite.webUrl,
            name: firstSite.displayName || firstSite.name || 'Tenant Root Site',
            type: 'home'
          };
        }
      }
    } catch (error) {
      logger.warn('SiteContextService', 'Could not find home site through search API', error);
      
      // Final fallback: try to find sites the user can access and look for patterns
      try {
        const sitesResponse = await this._graphClient
          .api('/sites')
          .filter("siteCollection/root ne null")
          .top(10)
          .get();

        if (sitesResponse?.value?.length > 0) {
          // Look for a site that might be home site based on naming patterns
          const potentialHomeSite = sitesResponse.value.find((site: any) => 
            site.webUrl?.includes('/sites/home') || 
            site.webUrl?.includes('/sites/intranet') ||
            site.displayName?.toLowerCase().includes('home') ||
            site.displayName?.toLowerCase().includes('intranet')
          );

          if (potentialHomeSite) {
            this._homeSiteInfo = {
              id: potentialHomeSite.id,
              url: potentialHomeSite.webUrl,
              name: potentialHomeSite.displayName || 'Home Site',
              type: 'home'
            };
          }
        }
      } catch (sitesError) {
        logger.warn('SiteContextService', 'Could not access sites collection', sitesError);
        // At this point, we'll proceed without home site detection
      }
    }
  }

  /**
   * Detect hub site if current site is connected to one
   */
  private async detectHubSite(): Promise<void> {
    try {
      if (this._context.pageContext.legacyPageContext.hubSiteId) {
        // Current site is connected to a hub
        const hubSiteId = this._context.pageContext.legacyPageContext.hubSiteId;
        const hubResponse = await this._graphClient
          .api(`/sites/${hubSiteId}`)
          .get();

        this._hubSiteInfo = {
          id: hubSiteId,
          url: hubResponse.webUrl,
          name: (hubResponse as any).displayName || (hubResponse as any).name || 'Hub Site',
          type: 'hub'
        };
      }
    } catch (error) {
      logger.warn('SiteContextService', 'Could not detect hub site', error);
    }
  }

  /**
   * Check if alert lists exist on all relevant sites
   */
  private async checkAlertLists(): Promise<void> {
    const sites = [this._currentSiteInfo, this._hubSiteInfo, this._homeSiteInfo].filter(Boolean);
    
    for (const site of sites) {
      if (site) {
        try {
          site.hasAlertsList = await this.checkAlertListExists(site.id);
        } catch (error) {
          logger.warn('SiteContextService', `Failed to check alerts list for site ${site.name}`, error);
          site.hasAlertsList = false;
        }
      }
    }
  }

  /**
   * Check if alerts list exists on a specific site
   */
  public async checkAlertListExists(siteId: string): Promise<boolean> {
    try {
      await this._graphClient
        .api(`/sites/${siteId}/lists/${this.alertsListName}`)
        .get();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get detailed status of alerts list on a site
   */
  public async getAlertListStatus(siteId: string): Promise<IAlertListStatus> {
    try {
      // Try to access the list
      await this._graphClient
        .api(`/sites/${siteId}/lists/${this.alertsListName}`)
        .get();
      
      return {
        exists: true,
        canAccess: true,
        canCreate: false // Already exists
      };
    } catch (error) {
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        // List doesn't exist, check if we can create it
        try {
          // Test permissions by trying to get all lists
          await this._graphClient
            .api(`/sites/${siteId}/lists`)
            .select('id')
            .top(1)
            .get();

          return {
            exists: false,
            canAccess: true,
            canCreate: true
          };
        } catch (permError) {
          return {
            exists: false,
            canAccess: false,
            canCreate: false,
            error: 'Insufficient permissions to access or create lists'
          };
        }
      } else if (error.message?.includes('403') || error.message?.includes('Access denied')) {
        return {
          exists: true, // Assume it exists but we can't access it
          canAccess: false,
          canCreate: false,
          error: 'Access denied to alerts list'
        };
      }

      return {
        exists: false,
        canAccess: false,
        canCreate: false,
        error: error.message
      };
    }
  }

  /**
   * Create alerts list on a specific site using SharePointAlertService
   */
  public async createAlertsList(siteId: string, selectedLanguages?: string[]): Promise<boolean> {
    try {
      // Import SharePointAlertService dynamically to avoid circular dependency
      const { SharePointAlertService } = await import('./SharePointAlertService');
      const alertService = new SharePointAlertService(this._graphClient, this._context);
      
      // Temporarily override the site context to create list on specific site
      const originalSiteId = this._context.pageContext.site.id.toString();
      (this._context.pageContext.site as any).id = { toString: () => siteId };
      
      try {
        await alertService.initializeLists();
        
        // Add language columns if specific languages were selected
        if (selectedLanguages && selectedLanguages.length > 0) {
          logger.debug('SiteContextService', `Adding language columns for: ${selectedLanguages.join(', ')}`);
          for (const languageCode of selectedLanguages) {
            try {
              await alertService.addLanguageSupport(languageCode);
              logger.debug('SiteContextService', `Added language columns for ${languageCode}`);
            } catch (langError) {
              logger.warn('SiteContextService', `Failed to add language columns for ${languageCode}`, langError);
              // Continue with other languages
            }
          }
        }
        
        logger.info('SiteContextService', `Successfully created alerts list on site ${siteId}`);
        
        // Update the hasAlertsList flag for the site
        const sites = [this._currentSiteInfo, this._hubSiteInfo, this._homeSiteInfo];
        const targetSite = sites.find(s => s && s.id === siteId);
        if (targetSite) {
          targetSite.hasAlertsList = true;
        }
        
        return true;
      } finally {
        // Restore original site context
        (this._context.pageContext.site as any).id = { toString: () => originalSiteId };
      }
    } catch (error) {
      logger.error('SiteContextService', `Failed to create alerts list on site ${siteId}`, error);
      
      // Provide more detailed error messages
      if (error.message?.includes('PERMISSION_DENIED')) {
        throw new Error(`PERMISSION_DENIED: Cannot create alerts list on site ${siteId}. User lacks required permissions.`);
      } else if (error.message?.includes('CRITICAL_COLUMNS_FAILED')) {
        throw new Error(`LIST_INCOMPLETE: Alerts list created but some critical columns failed. ${error.message}`);
      } else {
        throw new Error(`LIST_CREATION_FAILED: ${error.message || 'Unknown error during list creation'}`);
      }
    }
  }

  /**
   * Get supported languages for a specific site's alerts list
   */
  public async getSupportedLanguagesForSite(siteId: string): Promise<string[]> {
    try {
      // Import SharePointAlertService dynamically to avoid circular dependency
      const { SharePointAlertService } = await import('./SharePointAlertService');
      const alertService = new SharePointAlertService(this._graphClient, this._context);
      
      // Temporarily override the site context to query the specific site
      const originalSiteId = this._context.pageContext.site.id.toString();
      (this._context.pageContext.site as any).id = { toString: () => siteId };
      
      try {
        return await alertService.getSupportedLanguages();
      } finally {
        // Restore original site context
        (this._context.pageContext.site as any).id = { toString: () => originalSiteId };
      }
    } catch (error) {
      logger.warn('SiteContextService', `Failed to get supported languages for site ${siteId}`, error);
      return ['en-us']; // Default fallback
    }
  }

  /**
   * Get all relevant sites in hierarchical order
   */
  public getSitesHierarchy(): ISiteInfo[] {
    const sites: ISiteInfo[] = [];
    
    // Add in priority order: Home → Hub → Current
    if (this._homeSiteInfo) sites.push(this._homeSiteInfo);
    if (this._hubSiteInfo && this._hubSiteInfo.id !== this._homeSiteInfo?.id) {
      sites.push(this._hubSiteInfo);
    }
    if (this._currentSiteInfo && 
        this._currentSiteInfo.id !== this._homeSiteInfo?.id && 
        this._currentSiteInfo.id !== this._hubSiteInfo?.id) {
      sites.push(this._currentSiteInfo);
    }

    return sites;
  }

  /**
   * Get sites that should show alerts for current user context
   */
  public getAlertSourceSites(): string[] {
    const siteIds: string[] = [];
    
    // Always include home site alerts (shown everywhere)
    if (this._homeSiteInfo?.hasAlertsList) {
      siteIds.push(this._homeSiteInfo.id);
    }

    // Include hub site alerts if current site is connected to hub
    if (this._hubSiteInfo?.hasAlertsList && this._context.pageContext.legacyPageContext.hubSiteId) {
      siteIds.push(this._hubSiteInfo.id);
    }

    // Always include current site alerts
    if (this._currentSiteInfo?.hasAlertsList) {
      siteIds.push(this._currentSiteInfo.id);
    }

    return siteIds;
  }

  /**
   * Get current site info
   */
  public getCurrentSite(): ISiteInfo | null {
    return this._currentSiteInfo;
  }

  /**
   * Get hub site info
   */
  public getHubSite(): ISiteInfo | null {
    return this._hubSiteInfo;
  }

  /**
   * Get home site info
   */
  public getHomeSite(): ISiteInfo | null {
    return this._homeSiteInfo;
  }

  /**
   * Get application context
   */
  public getContext(): ApplicationCustomizerContext {
    return this._context;
  }

  /**
   * Get Microsoft Graph client
   */
  public async getGraphClient(): Promise<MSGraphClientV3> {
    return this._graphClient;
  }

  /**
   * Utility methods
   */
  // Removed unused extractHostnameFromUrl and extractPathFromUrl methods

  /**
   * Refresh site context (useful after list creation)
   */
  public async refresh(): Promise<void> {
    await this.detectSiteContext();
  }
}