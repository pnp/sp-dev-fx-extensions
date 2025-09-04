import { BaseComponentContext } from '@microsoft/sp-component-base';
import { Log } from '@microsoft/sp-core-library';
import { IFooterService } from '../ServiceFactory';
import { ISharedLink, IPersonalLink } from '../types/FooterTypes';
import { SharePointListService } from '../../extensions/collaborationFooter/services/SharePointListService';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

const LOG_SOURCE: string = 'SimpleSharePointFooterService';

/**
 * Simple SharePoint footer service for demonstration
 * In production, this would use PnP JS or SPFx APIs to interact with SharePoint lists
 */
export class SimpleSharePointFooterService implements IFooterService {
  private spListService: SharePointListService;
  private sharedLinksListTitle: string = 'Global Footer Links'; // Default list title
  private personalLinksListTitle: string = 'Personal Footer Links'; // Default list title

  constructor(context: BaseComponentContext, sharedLinksListTitle?: string, personalLinksListTitle?: string) {
    this.spListService = new SharePointListService(context as any);
    if (sharedLinksListTitle) { this.sharedLinksListTitle = sharedLinksListTitle; }
    if (personalLinksListTitle) { this.personalLinksListTitle = personalLinksListTitle; }
    Log.info(LOG_SOURCE, 'SimpleSharePointFooterService initialized');
  }

  public async initialize(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initializing SharePoint footer service');
    // In a real implementation, this would create SharePoint lists if they don't exist
  }

  public async getSharedLinks(): Promise<ISharedLink[]> {
    try {
      // This service will not return ISharedLink directly, but IContextualMenuItem
      // This method is kept for IFooterService compatibility but will return empty
      return [];
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async getPersonalLinks(): Promise<IPersonalLink[]> {
    try {
      // This service will not return IPersonalLink directly, but IContextualMenuItem
      // This method is kept for IFooterService compatibility but will return empty
      return [];
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async savePersonalLinks(links: IPersonalLink[]): Promise<boolean> {
    try {
      // For simplicity, we'll delete all existing personal links and then add the new ones
      // In a real-world scenario, you might want to update existing items and delete only those not present
      const existingItems = await this.spListService.getListItems(this.personalLinksListTitle, ['Id']);
      for (const item of existingItems) {
        await this.spListService.deleteListItem(this.personalLinksListTitle, item.Id);
      }

      for (const link of links) {
        const itemData = this.mapPersonalLinkToSharePointItem(link);
        await this.spListService.addListItem(this.personalLinksListTitle, itemData);
      }

      Log.info(LOG_SOURCE, `Successfully saved ${links.length} personal links to SharePoint list`);
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  private mapPersonalLinkToSharePointItem(link: IPersonalLink): any {
    return {
      Title: link.title,
      FooterLinkUrl: {
        Description: link.title,
        Url: link.url
      },
      FooterLinkDescription: link.description,
      FooterLinkIcon: link.iconName,
      FooterLinkCategory: link.category || 'Personal',
      FooterLinkOrder: link.order || 0,
      FooterLinkIsActive: link.isActive || true
    };
  }

  public async getSharedMenuItems(): Promise<IContextualMenuItem[]> {
    try {
      const items = await this.spListService.getSharedMenuItems(this.sharedLinksListTitle);
      Log.info(LOG_SOURCE, `Retrieved ${items.length} shared menu items from ${this.sharedLinksListTitle}`);
      return items;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  public async getPersonalMenuItems(): Promise<IContextualMenuItem[]> {
    try {
      const items = await this.spListService.getPersonalMenuItems(this.personalLinksListTitle);
      Log.info(LOG_SOURCE, `Retrieved ${items.length} personal menu items from ${this.personalLinksListTitle}`);
      return items;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }
}