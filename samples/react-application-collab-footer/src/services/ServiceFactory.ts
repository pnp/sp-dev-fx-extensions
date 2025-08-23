import { BaseComponentContext } from '@microsoft/sp-component-base';
import { Log } from '@microsoft/sp-core-library';
import { IFooterConfiguration } from './configuration/ConfigurationService';
import { ISharedLink, IPersonalLink } from './types/FooterTypes';
import { SimpleSharePointFooterService } from './sharepoint/SimpleSharePointFooterService';

const LOG_SOURCE: string = 'ServiceFactory';

import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

export interface IFooterService {
  getSharedLinks(): Promise<ISharedLink[]>;
  getPersonalLinks(): Promise<IPersonalLink[]>;
  savePersonalLinks(links: IPersonalLink[]): Promise<boolean>;
  getSharedMenuItems(): Promise<IContextualMenuItem[]>;
  getPersonalMenuItems(): Promise<IContextualMenuItem[]>;
}

export class ServiceFactory {
  /**
   * Creates the appropriate footer service based on configuration
   */
  public static async createFooterService(
    context: BaseComponentContext,
    config: IFooterConfiguration
  ): Promise<IFooterService> {
    const { storageType } = config;
    
    Log.info(LOG_SOURCE, `Creating footer service for storage type: ${storageType}`);

    try {
      switch (storageType) {
        case 'sharepoint-lists': {
          // Use the simple SharePoint Lists service
          const service = new SimpleSharePointFooterService(context, config.sharedLinksListTitle, config.personalLinksListTitle);
          
          // Initialize if needed
          if (config.autoCreateLists) {
            await service.initialize?.();
          }
          
          return service;
        }

        case 'legacy-taxonomy': {
          // Use legacy taxonomy/user profile services
          const { LegacyFooterService } = await import('./legacy/LegacyFooterService');
          return new LegacyFooterService(context, config);
        }

        case 'graph': {
          // Use Graph API service
          const { GraphService } = await import('./graph/GraphService');
          const graphClient = await context.msGraphClientFactory.getClient('3');
          return new GraphService(context, graphClient, 'shared-links-list', 'personal-links-list');
        }

        case 'hybrid': {
          // Use hybrid OneDrive + SharePoint service (new architecture)
          const { HybridFooterService } = await import('./HybridFooterService');
          const graphClient = await context.msGraphClientFactory.getClient('3');
          const hybridService = new HybridFooterService(context, graphClient, config.homeSiteUrl);
          await hybridService.initialize();
          return hybridService;
        }

        default:
          throw new Error(`Unsupported storage type: ${storageType}`);
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      
      // Fallback to SharePoint Lists service
      Log.warn(LOG_SOURCE, 'Falling back to SharePoint Lists service');
      const fallbackService = new SimpleSharePointFooterService(context);
      try {
        await fallbackService.initialize?.();
      } catch (initError) {
        Log.warn(LOG_SOURCE, `Failed to initialize fallback service: ${(initError as Error).message}`);
      }
      return fallbackService;
    }
  }

}