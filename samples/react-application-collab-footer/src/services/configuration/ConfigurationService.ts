import { BaseComponentContext } from '@microsoft/sp-component-base';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'ConfigurationService';

export interface IFooterConfiguration {
  // Legacy properties for backward compatibility
  sourceTermSet?: string;
  personalItemsStorageProperty?: string;
  
  // Modern SharePoint List configuration
  sharedLinksListTitle: string;
  personalLinksListTitle: string;
  storageType: 'sharepoint-lists' | 'legacy-taxonomy' | 'graph' | 'hybrid';
  
  // Feature flags and settings
  cacheDuration: number;
  enableDragDrop: boolean;
  enableCategories: boolean;
  maxPersonalLinks: number;
  autoCreateLists: boolean;
  enableSampleData: boolean;
  
  // Centralized home site configuration
  homeSiteUrl?: string;
}

export class ConfigurationService {
  private defaultConfig: Partial<IFooterConfiguration> = {
    storageType: 'hybrid',
    sharedLinksListTitle: 'Footer Shared Links',
    personalLinksListTitle: 'Footer Personal Links',
    cacheDuration: 300000, // 5 minutes
    enableDragDrop: true,
    enableCategories: false,
    maxPersonalLinks: 10,
    autoCreateLists: true,
    enableSampleData: false
  };

  constructor(context: BaseComponentContext, private properties: any) {}

  public getConfig(): IFooterConfiguration {
    try {
      // Merge properties from Application Customizer with defaults
      const config: IFooterConfiguration = {
        // Legacy properties for backward compatibility
        sourceTermSet: this.properties.sourceTermSet || this.properties.sharedLinksTermSet || '',
        personalItemsStorageProperty: this.properties.personalItemsStorageProperty || '',
        
        // Modern SharePoint List configuration
        sharedLinksListTitle: this.properties.sharedLinksListTitle || this.defaultConfig.sharedLinksListTitle!,
        personalLinksListTitle: this.properties.personalLinksListTitle || this.defaultConfig.personalLinksListTitle!,
        storageType: this.properties.storageType || this.defaultConfig.storageType!,
        
        // Feature settings
        cacheDuration: this.properties.cacheDuration || this.defaultConfig.cacheDuration!,
        enableDragDrop: this.properties.enableDragDrop !== undefined ? this.properties.enableDragDrop : this.defaultConfig.enableDragDrop!,
        enableCategories: this.properties.enableCategories !== undefined ? this.properties.enableCategories : this.defaultConfig.enableCategories!,
        maxPersonalLinks: this.properties.maxPersonalLinks || this.defaultConfig.maxPersonalLinks!,
        autoCreateLists: this.properties.autoCreateLists !== undefined ? this.properties.autoCreateLists : this.defaultConfig.autoCreateLists!,
        enableSampleData: this.properties.enableSampleData !== undefined ? this.properties.enableSampleData : this.defaultConfig.enableSampleData!,
        
        // Centralized home site URL
        homeSiteUrl: this.properties.homeSiteUrl
      };

      // Validate configuration
      this.validateConfig(config);
      Log.info(LOG_SOURCE, `Configuration loaded successfully with storage type: ${config.storageType}`);
      return config;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      // Return minimum viable configuration
      return {
        sharedLinksListTitle: 'Footer Shared Links',
        personalLinksListTitle: 'Footer Personal Links',
        storageType: 'sharepoint-lists',
        cacheDuration: 300000,
        enableDragDrop: true,
        enableCategories: false,
        maxPersonalLinks: 10,
        autoCreateLists: true,
        enableSampleData: false
      };
    }
  }

  private validateConfig(config: IFooterConfiguration): void {
    // Validate based on storage type
    if (config.storageType === 'sharepoint-lists') {
      if (!config.sharedLinksListTitle) {
        throw new Error('sharedLinksListTitle is required for SharePoint Lists storage type');
      }
      if (!config.personalLinksListTitle) {
        throw new Error('personalLinksListTitle is required for SharePoint Lists storage type');
      }
    }

    // Legacy validation for backward compatibility
    if (config.storageType === 'legacy-taxonomy') {
      if (!config.sourceTermSet) {
        throw new Error('sourceTermSet is required for legacy taxonomy storage type');
      }
      if (!config.personalItemsStorageProperty) {
        throw new Error('personalItemsStorageProperty is required for legacy taxonomy storage type');
      }
    }

    if (config.cacheDuration < 0) {
      throw new Error('cacheDuration must be non-negative');
    }

    if (config.maxPersonalLinks < 1 || config.maxPersonalLinks > 50) {
      throw new Error('maxPersonalLinks must be between 1 and 50');
    }
  }
}