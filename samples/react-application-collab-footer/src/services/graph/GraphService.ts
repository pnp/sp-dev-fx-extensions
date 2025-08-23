import { BaseComponentContext } from '@microsoft/sp-component-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { Log } from '@microsoft/sp-core-library';
import { IFooterService } from '../ServiceFactory';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { ISharedLink, IPersonalLink } from '../types/FooterTypes';

const LOG_SOURCE: string = 'GraphService';

interface IGraphListItem {
  id: string;
  fields: {
    Title: string;
    FooterURL?: string;
    Description?: string;
    IconName?: string;
    IconUrl?: string;
    SortOrder?: number;
    Category?: string;
    IsMandatory?: boolean;
    IsActive?: boolean;
    TargetAudience?: string;
    ValidFrom?: string;
    ValidTo?: string;
  };
}

interface IGraphSite {
  id: string;
  webUrl: string;
}

/**
 * Graph API-based footer service for SharePoint lists
 * Uses Microsoft Graph API to interact with SharePoint lists directly
 */
export class GraphService implements IFooterService {
  private siteId: string = '';
  private initialized: boolean = false;

  constructor(
    private context: BaseComponentContext,
    private graphClient: MSGraphClientV3,
    private sharedLinksListTitle: string = 'Footer Shared Links',
    private personalLinksListTitle: string = 'Footer Personal Links'
  ) {
    Log.info(LOG_SOURCE, 'GraphService initialized');
  }

  /**
   * Initialize the service by resolving the site ID
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const siteUrl = this.context.pageContext.web.absoluteUrl;
      const hostname = new URL(siteUrl).hostname;
      const sitePath = new URL(siteUrl).pathname;
      
      // Get site ID using Graph API
      const site: IGraphSite = await this.graphClient
        .api(`/sites/${hostname}:${sitePath}`)
        .get();
      
      this.siteId = site.id;
      this.initialized = true;
      Log.info(LOG_SOURCE, `Initialized with site ID: ${this.siteId}`);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  public async getSharedLinks(): Promise<ISharedLink[]> {
    try {
      await this.initialize();
      
      // Get list items using Graph API
      const response = await this.graphClient
        .api(`/sites/${this.siteId}/lists/${this.sharedLinksListTitle}/items`)
        .expand('fields')
        .filter('fields/IsActive eq true')
        .orderby('fields/IsMandatory desc, fields/SortOrder asc, fields/Title asc')
        .get();

      const items: IGraphListItem[] = response.value;
      
      return items
        .filter(item => this.isLinkValid(item))
        .map(item => this.mapGraphItemToSharedLink(item));
        
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async getPersonalLinks(): Promise<IPersonalLink[]> {
    try {
      await this.initialize();
      
      const userEmail = this.context.pageContext.user.email;
      
      // Get personal links filtered by current user
      const response = await this.graphClient
        .api(`/sites/${this.siteId}/lists/${this.personalLinksListTitle}/items`)
        .expand('fields')
        .filter(`fields/Author/Email eq '${userEmail}' and fields/IsActive eq true`)
        .orderby('fields/SortOrder asc, fields/Title asc')
        .get();

      const items: IGraphListItem[] = response.value;
      
      return items
        .filter(item => this.isLinkValid(item))
        .map(item => this.mapGraphItemToPersonalLink(item));
        
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async savePersonalLinks(links: IPersonalLink[]): Promise<boolean> {
    try {
      await this.initialize();
      
      // const userEmail = this.context.pageContext.user.email; // Future use for filtering
      
      // First, get existing personal links to identify what to update/delete
      const existingLinks = await this.getPersonalLinks();
      const existingIds = new Set(existingLinks.map(link => link.id?.toString()));
      
      // Process each link
      for (const link of links) {
        const linkData = {
          Title: link.title,
          FooterURL: link.url,
          Description: link.description || '',
          IconName: link.iconName || 'Link',
          Category: link.category || 'Personal',
          SortOrder: link.order || 0,
          IsActive: true
        };
        
        if (link.id && existingIds.has(link.id.toString())) {
          // Update existing item
          await this.graphClient
            .api(`/sites/${this.siteId}/lists/${this.personalLinksListTitle}/items/${link.id}`)
            .patch({ fields: linkData });
        } else {
          // Create new item
          await this.graphClient
            .api(`/sites/${this.siteId}/lists/${this.personalLinksListTitle}/items`)
            .post({ fields: linkData });
        }
      }
      
      // Delete items that are no longer in the links array
      const currentIds = new Set(links.filter(l => l.id).map(l => l.id!.toString()));
      const toDelete = existingLinks.filter(link => 
        link.id && !currentIds.has(link.id.toString())
      );
      
      for (const linkToDelete of toDelete) {
        await this.graphClient
          .api(`/sites/${this.siteId}/lists/${this.personalLinksListTitle}/items/${linkToDelete.id}`)
          .delete();
      }
      
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  public async getSharedMenuItems(): Promise<IContextualMenuItem[]> {
    try {
      const sharedLinks = await this.getSharedLinks();
      return sharedLinks.map(link => ({
        key: `shared-${link.id}`,
        name: link.title,
        href: link.url,
        title: link.description,
        iconProps: { iconName: link.iconName || 'Link' },
        target: '_blank',
        data: {
          id: link.id,
          description: link.description,
          iconName: link.iconName,
          category: 'Shared'
        }
      }));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async getPersonalMenuItems(): Promise<IContextualMenuItem[]> {
    try {
      const personalLinks = await this.getPersonalLinks();
      return personalLinks.map(link => ({
        key: `personal-${link.id || link.title}`,
        name: link.title,
        href: link.url,
        title: link.description,
        iconProps: { iconName: link.iconName || 'Link' },
        target: '_blank',
        data: {
          id: link.id,
          description: link.description,
          iconName: link.iconName,
          category: link.category || 'Personal'
        }
      }));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Helper method to validate if a link is still valid (not expired)
   */
  private isLinkValid(item: IGraphListItem): boolean {
    const now = new Date();
    
    // Check if link is active
    if (item.fields.IsActive === false) {
      return false;
    }
    
    // Check valid from date
    if (item.fields.ValidFrom) {
      const validFrom = new Date(item.fields.ValidFrom);
      if (now < validFrom) {
        return false;
      }
    }
    
    // Check valid to date
    if (item.fields.ValidTo) {
      const validTo = new Date(item.fields.ValidTo);
      if (now > validTo) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Map Graph API list item to ISharedLink
   */
  private mapGraphItemToSharedLink(item: IGraphListItem): ISharedLink {
    return {
      id: parseInt(item.id),
      title: item.fields.Title,
      url: item.fields.FooterURL || '',
      description: item.fields.Description || '',
      iconName: item.fields.IconName || 'Link',
      iconUrl: item.fields.IconUrl,
      order: item.fields.SortOrder || 0,
      isActive: item.fields.IsActive !== false
    };
  }

  /**
   * Map Graph API list item to IPersonalLink
   */
  private mapGraphItemToPersonalLink(item: IGraphListItem): IPersonalLink {
    return {
      id: parseInt(item.id),
      userId: this.context.pageContext.user.email,
      title: item.fields.Title,
      url: item.fields.FooterURL || '',
      description: item.fields.Description || '',
      iconName: item.fields.IconName || 'Link',
      category: item.fields.Category || 'Personal',
      order: item.fields.SortOrder || 0,
      isActive: item.fields.IsActive !== false
    };
  }

  /**
   * Create the SharePoint lists if they don't exist
   */
  public async createListsIfNotExist(): Promise<void> {
    try {
      await this.initialize();
      
      // Check if shared links list exists, create if not
      try {
        await this.graphClient
          .api(`/sites/${this.siteId}/lists/${this.sharedLinksListTitle}`)
          .get();
      } catch (error) {
        Log.info(LOG_SOURCE, `Creating shared links list: ${this.sharedLinksListTitle}`);
        await this.createSharedLinksList();
      }
      
      // Check if personal links list exists, create if not
      try {
        await this.graphClient
          .api(`/sites/${this.siteId}/lists/${this.personalLinksListTitle}`)
          .get();
      } catch (error) {
        Log.info(LOG_SOURCE, `Creating personal links list: ${this.personalLinksListTitle}`);
        await this.createPersonalLinksList();
      }
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Create the shared links list with proper schema
   */
  private async createSharedLinksList(): Promise<void> {
    const listDefinition = {
      displayName: this.sharedLinksListTitle,
      columns: [
        {
          name: 'Title',
          text: {}
        },
        {
          name: 'FooterURL',
          text: {}
        },
        {
          name: 'Description',
          text: {}
        },
        {
          name: 'IconName',
          text: {}
        },
        {
          name: 'IconUrl',
          text: {}
        },
        {
          name: 'SortOrder',
          number: {}
        },
        {
          name: 'Category',
          text: {}
        },
        {
          name: 'IsMandatory',
          boolean: {}
        },
        {
          name: 'IsActive',
          boolean: {}
        },
        {
          name: 'TargetAudience',
          text: {}
        },
        {
          name: 'ValidFrom',
          dateTime: {}
        },
        {
          name: 'ValidTo',
          dateTime: {}
        }
      ]
    };

    await this.graphClient
      .api(`/sites/${this.siteId}/lists`)
      .post(listDefinition);
  }

  /**
   * Create the personal links list with proper schema
   */
  private async createPersonalLinksList(): Promise<void> {
    const listDefinition = {
      displayName: this.personalLinksListTitle,
      columns: [
        {
          name: 'Title',
          text: {}
        },
        {
          name: 'FooterURL',
          text: {}
        },
        {
          name: 'Description',
          text: {}
        },
        {
          name: 'IconName',
          text: {}
        },
        {
          name: 'Category',
          text: {}
        },
        {
          name: 'SortOrder',
          number: {}
        },
        {
          name: 'IsActive',
          boolean: {}
        }
      ]
    };

    await this.graphClient
      .api(`/sites/${this.siteId}/lists`)
      .post(listDefinition);
  }
}