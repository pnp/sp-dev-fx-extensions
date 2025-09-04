import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Log } from '@microsoft/sp-core-library';
import { SharePointListService } from './SharePointListService';
import { OneDriveService } from './OneDriveService';
import { IOneDrivePersonalLinksData } from '../../../services/types/FooterTypes';
import { cacheService } from '../../../services/performance/CacheService';
import { LINK_CONSTANTS } from '../constants/ApplicationConstants';

const LOG_SOURCE = 'LinkService';

export interface ILinkData {
  id?: number;
  title: string;
  url: string;
  description?: string;
  iconName?: string;
  iconUrl?: string;
  category?: string;
  targetUsers?: any[];
  isMandatory?: boolean;
  validFrom?: string;
  validTo?: string;
  displayOrder?: number;
  lastUsed?: string;
  clickCount?: number;
  isActive?: boolean;
}

export interface IPersonalLinkData {
  id?: number;
  title: string;
  url: string;
  description?: string;
  iconName?: string;
  category?: string;
  displayOrder?: number;
  lastUsed?: string;
  clickCount?: number;
}

export interface IUserLinkSelection {
  userId: string;
  selectedLinkIds: number[];
  lastUpdated: Date;
}

// Memory manager removed - using shared CacheService for better performance and consistency

export class LinkService {
  private context: WebPartContext;
  private sharePointService: SharePointListService;
  private oneDriveService: OneDriveService;
  private globalLinksListTitle: string;
  private userSelectionsListTitle: string;
  private readonly ONEDRIVE_FILENAME = 'collaboration-footer-personal-links.json';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(context: WebPartContext, globalLinksListTitle: string = 'Global Footer Links') {
    this.context = context;
    this.sharePointService = new SharePointListService(context);
    this.oneDriveService = new OneDriveService(context);
    this.globalLinksListTitle = globalLinksListTitle;
    this.userSelectionsListTitle = 'User Link Selections';
  }

  /**
   * Helper method for cached requests using shared CacheService
   */
  private async getCachedRequest<T>(cacheKey: string, factory: () => Promise<T>): Promise<T> {
    const cached = await cacheService.get<T>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const result = await factory();
    await cacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  // ===============================
  // ORGANIZATION LINKS (Global)
  // ===============================

  /**
   * Get all available organization links (cached)
   */
  public async getAllOrganizationLinks(): Promise<IContextualMenuItem[]> {
    const cacheKey = `orgLinks_${this.globalLinksListTitle}`;
    
    return this.getCachedRequest(cacheKey, async () => {
      try {
        const items = await this.sharePointService.getListItems(
          this.globalLinksListTitle,
          ['ID', 'Title', 'FooterLinkUrl', 'FooterLinkDescription', 'FooterLinkIcon', 
           'FooterLinkCategory', 'FooterLinkOrder', 'FooterLinkTargetUsers', 
           'FooterLinkIsMandatory', 'FooterLinkValidFrom', 'FooterLinkValidTo'],
          'FooterLinkValidTo eq null or FooterLinkValidTo ge datetime\'now\'',
          'FooterLinkOrder,Title'
        );

        return items.map(item => this.mapSharePointItemToMenuItem(item, 'organization'));
      } catch (error) {
        Log.error(LOG_SOURCE, error as Error);
        return [];
      }
    });
  }

  /**
   * Get user's selected organization links (cached by user)
   */
  public async getUserSelectedOrganizationLinks(userId?: string): Promise<IContextualMenuItem[]> {
    const userEmail = userId || this.context.pageContext.user.email;
    const cacheKey = `userOrgLinks_${userEmail}`;
    
    return this.getCachedRequest(cacheKey, async () => {
      try {
        const allLinks = await this.getAllOrganizationLinks();
        
        // Get user selections
        const userSelections = await this.getUserLinkSelections(userEmail);
        
        if (!userSelections || userSelections.selectedLinkIds.length === 0) {
          // Return mandatory links if no selections (use pre-computed filter)
          return allLinks.filter(link => (link.data as any)?.isMandatory);
        }

        // Convert to Set for O(1) lookup instead of O(n) includes
        const selectedIdSet = new Set(userSelections.selectedLinkIds);
        
        // Return selected links + mandatory links (optimized filter)
        return allLinks.filter(link => {
          const linkId = parseInt((link.data as any)?.id || '0');
          return selectedIdSet.has(linkId) || (link.data as any)?.isMandatory;
        });
      } catch (error) {
        Log.error(LOG_SOURCE, error as Error);
        return [];
      }
    });
  }

  /**
   * Add new organization link
   */
  public async addOrganizationLink(linkData: ILinkData): Promise<IContextualMenuItem | null> {
    try {
      const sharePointData: any = {
        Title: linkData.title,
        FooterLinkUrl: { Url: linkData.url, Description: linkData.title },
        FooterLinkDescription: linkData.description || '',
        FooterLinkIcon: linkData.iconName || LINK_CONSTANTS.DEFAULT_ICON,
        FooterLinkCategory: linkData.category || LINK_CONSTANTS.DEFAULT_CATEGORY,
        FooterLinkOrder: linkData.displayOrder || 0,
        FooterLinkIsMandatory: linkData.isMandatory || false,
        FooterLinkValidFrom: linkData.validFrom ? new Date(linkData.validFrom) : null,
        FooterLinkValidTo: linkData.validTo ? new Date(linkData.validTo) : null
      };

      // Add target users if specified
      if (linkData.targetUsers && linkData.targetUsers.length > 0) {
        sharePointData['FooterLinkTargetUsersId'] = linkData.targetUsers.map(user => user.id);
      }

      const result = await this.sharePointService.addListItem(this.globalLinksListTitle, sharePointData);
      
      if (result) {
        return this.mapSharePointItemToMenuItem({
          ID: result.ID,
          Title: linkData.title,
          FooterLinkUrl: { Url: linkData.url },
          FooterLinkDescription: linkData.description,
          FooterLinkIcon: linkData.iconName,
          FooterLinkCategory: linkData.category,
          FooterLinkOrder: linkData.displayOrder,
          FooterLinkIsMandatory: linkData.isMandatory
        }, 'organization');
      }

      return null;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Update organization link
   */
  public async updateOrganizationLink(linkId: number, linkData: Partial<ILinkData>): Promise<boolean> {
    try {
      const sharePointData: any = {};
      
      if (linkData.title) sharePointData.Title = linkData.title;
      if (linkData.url) sharePointData.FooterLinkUrl = { Url: linkData.url, Description: linkData.title || '' };
      if (linkData.description !== undefined) sharePointData.FooterLinkDescription = linkData.description;
      if (linkData.iconName) sharePointData.FooterLinkIcon = linkData.iconName;
      if (linkData.category) sharePointData.FooterLinkCategory = linkData.category;
      if (linkData.displayOrder !== undefined) sharePointData.FooterLinkOrder = linkData.displayOrder;
      if (linkData.isMandatory !== undefined) sharePointData.FooterLinkIsMandatory = linkData.isMandatory;

      await this.sharePointService.updateListItem(this.globalLinksListTitle, linkId, sharePointData);
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Delete organization link
   */
  public async deleteOrganizationLink(linkId: number): Promise<boolean> {
    try {
      await this.sharePointService.deleteListItem(this.globalLinksListTitle, linkId);
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  // ===============================
  // PERSONAL LINKS
  // ===============================

  /**
   * Get user's personal links (stored in OneDrive and localStorage as backup)
   */
  public async getPersonalLinks(userId?: string): Promise<IContextualMenuItem[]> {
    try {
      const userEmail = userId || this.context.pageContext.user.email;
      const storageKey = `personalLinks_${userEmail}`;
      let personalLinks: IPersonalLinkData[] = [];
      
      // Try to get from OneDrive first
      try {
        const oneDriveContent = await this.oneDriveService.loadFile(this.ONEDRIVE_FILENAME);
        if (oneDriveContent) {
          const personalLinksData = JSON.parse(oneDriveContent) as IOneDrivePersonalLinksData;
          if (personalLinksData.personalLinks && personalLinksData.personalLinks.length > 0) {
            personalLinks = personalLinksData.personalLinks.map(link => ({
              id: link.id,
              title: link.title,
              url: link.url,
              description: link.description,
              iconName: link.iconName,
              category: link.category,
              displayOrder: link.order,
              lastUsed: undefined,
              clickCount: 0
            }));
            
            Log.info(LOG_SOURCE, `Loaded ${personalLinks.length} personal links from OneDrive`);
          }
        }
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to load from OneDrive, falling back to localStorage: ${(error as Error).message}`);
      }
      
      // Fallback to localStorage if OneDrive failed or no data
      if (personalLinks.length === 0) {
        const localData = localStorage.getItem(storageKey);
        if (localData) {
          personalLinks = JSON.parse(localData);
          Log.info(LOG_SOURCE, `Loaded ${personalLinks.length} personal links from localStorage`);
        }
      }
      
      // Ensure all links have unique IDs
      const linksWithIds = personalLinks.map((link, index) => {
        if (!link.id || link.id === undefined || link.id === null) {
          return {
            ...link,
            id: this.generateUniqueId() + index
          };
        }
        return link;
      });
      
      return linksWithIds.map(link => this.mapPersonalLinkToMenuItem(link));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Save personal links to OneDrive and localStorage
   */
  public async savePersonalLinks(links: IContextualMenuItem[], userId?: string): Promise<boolean> {
    try {
      const userEmail = userId || this.context.pageContext.user.email;
      const storageKey = `personalLinks_${userEmail}`;
      
      const personalLinksData: IPersonalLinkData[] = links.map((link, index) => ({
        id: parseInt((link.data as any)?.id || '0') || this.generateUniqueId(),
        title: link.name || '',
        url: link.href || '',
        description: (link.data as any)?.description || '',
        iconName: (link.data as any)?.iconName || link.iconProps?.iconName || LINK_CONSTANTS.DEFAULT_ICON,
        category: (link.data as any)?.category || 'Personal',
        displayOrder: (link.data as any)?.displayOrder || index,
        lastUsed: (link.data as any)?.lastUsed,
        clickCount: (link.data as any)?.clickCount || 0
      }));

      // Always save to localStorage as backup
      localStorage.setItem(storageKey, JSON.stringify(personalLinksData));
      
      // Try to save to OneDrive
      try {
        // Get existing OneDrive data or create new structure
        let oneDriveData: IOneDrivePersonalLinksData;
        
        try {
          const existingContent = await this.oneDriveService.loadFile(this.ONEDRIVE_FILENAME);
          if (existingContent) {
            oneDriveData = JSON.parse(existingContent) as IOneDrivePersonalLinksData;
          } else {
            oneDriveData = {
              version: '1.0',
              lastModified: new Date().toISOString(),
              userId: userEmail,
              personalLinks: [],
              selectedGlobalLinkIds: []
            };
          }
        } catch (error) {
          // File doesn't exist, create new structure
          oneDriveData = {
            version: '1.0',
            lastModified: new Date().toISOString(),
            userId: userEmail,
            personalLinks: [],
            selectedGlobalLinkIds: []
          };
        }
        
        // Update personal links and metadata
        oneDriveData.personalLinks = personalLinksData.map(link => ({
          id: link.id,
          userId: userEmail,
          title: link.title,
          url: link.url,
          description: link.description,
          iconName: link.iconName,
          order: link.displayOrder,
          isActive: true,
          category: link.category
        }));
        oneDriveData.lastModified = new Date().toISOString();
        
        const success = await this.oneDriveService.saveFile(this.ONEDRIVE_FILENAME, JSON.stringify(oneDriveData, null, 2));
        if (success) {
          Log.info(LOG_SOURCE, 'Personal links saved to OneDrive and localStorage');
        } else {
          Log.info(LOG_SOURCE, 'Personal links saved to localStorage (OneDrive failed)');
        }
      } catch (error) {
        Log.warn(LOG_SOURCE, `OneDrive save failed, localStorage backup saved: ${(error as Error).message}`);
      }
      
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Add personal link
   */
  public async addPersonalLink(linkData: IPersonalLinkData, userId?: string): Promise<IContextualMenuItem | null> {
    try {
      const currentLinks = await this.getPersonalLinks(userId);
      const newId = Math.max(0, ...currentLinks.map(l => parseInt((l.data as any)?.id || '0'))) + 1;
      
      const newLink: IPersonalLinkData = {
        ...linkData,
        id: newId,
        clickCount: 0,
        lastUsed: new Date().toISOString()
      };

      const newMenuItem = this.mapPersonalLinkToMenuItem(newLink);
      const updatedLinks = [...currentLinks, newMenuItem];
      
      const saved = await this.savePersonalLinks(updatedLinks, userId);
      return saved ? newMenuItem : null;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return null;
    }
  }

  /**
   * Update personal link
   */
  public async updatePersonalLink(linkId: number, linkData: Partial<IPersonalLinkData>, userId?: string): Promise<boolean> {
    try {
      const currentLinks = await this.getPersonalLinks(userId);
      const linkIndex = currentLinks.findIndex(l => parseInt((l.data as any)?.id || '0') === linkId);
      
      if (linkIndex === -1) return false;

      const currentLinkData = currentLinks[linkIndex].data as any;
      const updatedLinkData = { ...currentLinkData, ...linkData };
      
      currentLinks[linkIndex] = this.mapPersonalLinkToMenuItem(updatedLinkData);
      
      return await this.savePersonalLinks(currentLinks, userId);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Delete personal link
   */
  public async deletePersonalLink(linkId: number, userId?: string): Promise<boolean> {
    try {
      const currentLinks = await this.getPersonalLinks(userId);
      const updatedLinks = currentLinks.filter(l => parseInt((l.data as any)?.id || '0') !== linkId);
      
      return await this.savePersonalLinks(updatedLinks, userId);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  // ===============================
  // USER SELECTIONS
  // ===============================

  /**
   * Get user's organization link selections
   */
  public async getUserLinkSelections(userEmail: string): Promise<IUserLinkSelection | null> {
    try {
      const items = await this.sharePointService.getListItems(
        this.userSelectionsListTitle,
        ['ID', 'SelectedLinkIds', 'UserEmail', 'LastUpdated'],
        `UserEmail eq '${userEmail}'`
      );

      if (items.length > 0) {
        const item = items[0];
        return {
          userId: userEmail,
          selectedLinkIds: item.SelectedLinkIds ? JSON.parse(item.SelectedLinkIds) : [],
          lastUpdated: new Date(item.LastUpdated || Date.now())
        };
      }

      return null;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return null;
    }
  }

  /**
   * Save user's organization link selections
   */
  public async saveUserLinkSelections(userEmail: string, selectedLinkIds: number[]): Promise<boolean> {
    try {
      const existingSelections = await this.getUserLinkSelections(userEmail);
      const selectionData = {
        UserEmail: userEmail,
        SelectedLinkIds: JSON.stringify(selectedLinkIds),
        LastUpdated: new Date()
      };

      if (existingSelections) {
        // Update existing
        const items = await this.sharePointService.getListItems(
          this.userSelectionsListTitle,
          ['ID'],
          `UserEmail eq '${userEmail}'`
        );
        
        if (items.length > 0) {
          await this.sharePointService.updateListItem(this.userSelectionsListTitle, items[0].ID, selectionData);
        }
      } else {
        // Create new
        await this.sharePointService.addListItem(this.userSelectionsListTitle, selectionData);
      }

      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  // ===============================
  // ANALYTICS & TRACKING
  // ===============================

  /**
   * Track link click
   */
  public async trackLinkClick(linkId: string, linkType: 'personal' | 'organization', userId?: string): Promise<void> {
    try {
      if (linkType === 'personal') {
        const userEmail = userId || this.context.pageContext.user.email;
        const links = await this.getPersonalLinks(userEmail);
        const linkIndex = links.findIndex(l => (l.key || l.name) === linkId);
        
        if (linkIndex !== -1) {
          const linkData = links[linkIndex].data as any;
          linkData.clickCount = (linkData.clickCount || 0) + 1;
          linkData.lastUsed = new Date().toISOString();
          
          links[linkIndex] = this.mapPersonalLinkToMenuItem(linkData);
          await this.savePersonalLinks(links, userEmail);
        }
      }
      // Organization link tracking would be implemented via SharePoint analytics
      // This could integrate with the existing AnalyticsService for centralized tracking
    } catch (error) {
      Log.warn(LOG_SOURCE, `Error tracking link click: ${(error as Error).message}`);
    }
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Map SharePoint list item to IContextualMenuItem
   */
  private mapSharePointItemToMenuItem(item: any, type: 'organization' | 'personal'): IContextualMenuItem {
    return {
      key: `${type}-${item.ID}`,
      name: item.Title,
      href: item.FooterLinkUrl?.Url || item.FooterLinkUrl,
      iconProps: { iconName: item.FooterLinkIcon || LINK_CONSTANTS.DEFAULT_ICON },
      data: {
        id: item.ID,
        description: item.FooterLinkDescription,
        iconName: item.FooterLinkIcon,
        category: item.FooterLinkCategory || 'General',
        displayOrder: item.FooterLinkOrder || 0,
        isMandatory: item.FooterLinkIsMandatory || false,
        validFrom: item.FooterLinkValidFrom,
        validTo: item.FooterLinkValidTo,
        targetUsers: item.FooterLinkTargetUsers,
        type
      }
    };
  }

  /**
   * Generate a unique ID for links
   */
  private generateUniqueId(): number {
    return Date.now() + Math.floor(Math.random() * 10000);
  }

  /**
   * Map personal link data to IContextualMenuItem
   */
  private mapPersonalLinkToMenuItem(linkData: IPersonalLinkData): IContextualMenuItem {
    const uniqueId = linkData.id || this.generateUniqueId();
    return {
      key: `personal-${uniqueId}`,
      name: linkData.title,
      href: linkData.url,
      iconProps: { iconName: linkData.iconName || LINK_CONSTANTS.DEFAULT_ICON },
      data: {
        id: uniqueId,
        description: linkData.description,
        iconName: linkData.iconName,
        category: linkData.category || 'Personal',
        displayOrder: linkData.displayOrder || 0,
        lastUsed: linkData.lastUsed,
        clickCount: linkData.clickCount || 0,
        type: 'personal'
      }
    };
  }

  /**
   * Validate URL format
   */
  public isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Upload custom icon
   */
  public async uploadCustomIcon(file: File): Promise<string> {
    return await this.sharePointService.uploadCustomIcon(file);
  }
}