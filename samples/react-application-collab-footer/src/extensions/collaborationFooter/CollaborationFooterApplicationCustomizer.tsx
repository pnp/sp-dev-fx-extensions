import { createElement } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import * as strings from 'CollaborationFooterApplicationCustomizerStrings';
import { ServiceFactory, IFooterService } from '../../services/ServiceFactory';
import { ConfigurationService, IFooterConfiguration } from '../../services/configuration/ConfigurationService';
import { IPersonalLink } from '../../services/types/FooterTypes';
import ModernCollabFooter from './components/footer/ModernCollabFooter';
import ModernLinkSelectionDialog from './components/linkSelection/ModernLinkSelectionDialog';
import { PersonalLinkManagementDialog } from './components/dialogs/PersonalLinkManagementDialog';
import { HybridFooterService } from '../../services/HybridFooterService';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { initializeIcons } from '@fluentui/react';
import { createTheme, loadTheme } from '@fluentui/react/lib/Styling';
import { ICollabFooterEditResult } from './components/footer/ICollabFooterProps';
import ErrorBoundary from './components/common/ErrorBoundary';

const LOG_SOURCE: string = 'CollaborationFooterApplicationCustomizer';
initializeIcons();

// Apply SharePoint-compliant theme
const sharePointTheme = createTheme({
  palette: {
    themePrimary: '#0078d4',
    themeLighterAlt: '#eff6fc',
    themeLighter: '#deecf9',
    themeLight: '#c7e0f4',
    themeTertiary: '#71afe5',
    themeSecondary: '#2b88d8',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
    neutralLighterAlt: '#faf9f8',
    neutralLighter: '#f3f2f1',
    neutralLight: '#edebe9',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralQuaternary: '#d0d0d0',
    neutralTertiaryAlt: '#c8c6c4',
    neutralTertiary: '#a19f9d',
    neutralSecondary: '#605e5c',
    neutralPrimaryAlt: '#3b3a39',
    neutralPrimary: '#323130',
    neutralDark: '#201f1e',
    black: '#000000',
    white: '#ffffff',
  },
});
loadTheme(sharePointTheme);

export interface ICollaborationFooterApplicationCustomizerProperties {
  // Legacy properties for backward compatibility
  sourceTermSet?: string;
  personalItemsStorageProperty?: string;
  
  // Modern SharePoint List properties
  sharedLinksListTitle?: string;
  personalLinksListTitle?: string;
  storageType?: 'sharepoint-lists' | 'legacy-taxonomy' | 'graph' | 'hybrid';
  
  // Feature configuration
  autoCreateLists?: boolean;
  enableSampleData?: boolean;
  maxPersonalLinks?: number;
  cacheDuration?: number;
  
  // Centralized home site configuration
  homeSiteUrl?: string; // URL of the SharePoint home site where organization links should be managed
}

export default class CollaborationFooterApplicationCustomizer
  extends BaseApplicationCustomizer<ICollaborationFooterApplicationCustomizerProperties> {

  private _footerPlaceholder: PlaceholderContent | undefined;
  private _myLinks: IPersonalLink[] = [];
  private _configService!: ConfigurationService;
  private _config!: IFooterConfiguration;
  private _footerService!: IFooterService;

  @override
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    try {
      // Initialize configuration service
      this._configService = new ConfigurationService(this.context, this.properties);
      this._config = this._configService.getConfig();

      // Initialize footer service based on configuration
      this._footerService = await ServiceFactory.createFooterService(this.context, this._config);
      
      Log.info(LOG_SOURCE, `Footer service initialized with storage type: ${this._config.storageType}`);
      

      await this._renderPlaceHolders();
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
    }
  }

  private async _editMyLinks(): Promise<ICollabFooterEditResult> {
    const result: ICollabFooterEditResult = {
      editResult: null,
      myLinks: null,
    };

    try {
      // Open modern link management dialog
      const dialog = new PersonalLinkManagementDialog(
        this._myLinks.map(link => ({
          key: link.id?.toString() || link.title,
          name: link.title,
          href: link.url,
          iconProps: { iconName: link.iconName || 'Link' },
          target: '_blank',
          data: link
        })), // Pass current personal links to the dialog
        async (updatedLinks: IContextualMenuItem[]) => {
          try {
            // Convert back to IPersonalLink[] format for saving
            const personalLinksToSave: IPersonalLink[] = updatedLinks.map((item, index) => {
              // Extract ID from key (handles both "personal-123" and numeric keys)
              let itemId = index; // fallback to index
              if (item.key) {
                if (item.key.startsWith('personal-')) {
                  const extractedId = parseInt(item.key.replace('personal-', ''));
                  if (!isNaN(extractedId)) {
                    itemId = extractedId;
                  }
                } else {
                  const parsedKey = parseInt(item.key);
                  if (!isNaN(parsedKey)) {
                    itemId = parsedKey;
                  }
                }
              }
              
              return {
                id: itemId,
                userId: '', // Will be set by the service
                title: item.name || '',
                url: item.href || '',
                iconName: item.iconProps?.iconName || 'Link',
                isActive: true,
                // Include additional data from item.data if available
                description: (item.data as any)?.description || item.title || '',
                category: (item.data as any)?.category || 'Personal',
                order: (item.data as any)?.displayOrder || index
              };
            });
            
            const success = await this._footerService.savePersonalLinks(personalLinksToSave);

            if (success) {
              Log.info(LOG_SOURCE, 'Successfully saved personal links');
              this._myLinks = personalLinksToSave;
              // Refresh the footer to show updated links
              this._footerPlaceholder = undefined;
              await this._renderPlaceHolders();
            }
            return success;
          } catch (error) {
            Log.error(LOG_SOURCE, error as Error);
            return false;
          }
        }
      );

      await dialog.show();
      result.editResult = true; // Assume success if dialog closes without error
      result.myLinks = this._myLinks.map(link => ({
        key: link.id?.toString() || link.title,
        name: link.title,
        href: link.url,
        iconProps: { iconName: link.iconName || 'Link' },
        target: '_blank',
        data: link
      }));
      return result;

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      result.editResult = false;
      return result;
    }
  }


  private async _openLinkSelectionDialog(): Promise<void> {
    try {
      if (this._footerService instanceof HybridFooterService) {
        const globalLinksService = this._footerService.getGlobalLinksService();
        
        // Get all global links
        const globalLinks = await globalLinksService.getAllGlobalLinks();
        const currentUser = this.context.pageContext.user;
        
        // Extract user ID from login name (same approach as HybridFooterService)
        const userId = parseInt(currentUser.loginName.split('|')[2] || '1');
        const userSelections = await globalLinksService.getUserLinkSelections(userId);
        const currentSelectionIds = userSelections
          .filter(selection => selection.isSelected)
          .map(selection => selection.globalLinkId);

        // Open modern link selection dialog
        const dialog = new ModernLinkSelectionDialog(
          globalLinks,
          currentSelectionIds,
          async (selectedLinkIds: number[]) => {
            try {
              const success = await globalLinksService.saveUserLinkSelections(
                userId, 
                selectedLinkIds
              );
              
              if (success) {
                // Refresh the footer to show updated links
                this._footerPlaceholder = undefined;
                await this._renderPlaceHolders();
              }
              
              return success;
            } catch (error) {
              Log.error(LOG_SOURCE, error as Error);
              return false;
            }
          }
        );

        await dialog.show();
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
    }
  }

  private async _renderPlaceHolders(): Promise<void> {
    if (this._footerPlaceholder) return;

    this._footerPlaceholder = this.context.placeholderProvider.tryCreateContent(
      PlaceholderName.Bottom,
      { onDispose: this._onDispose }
    );

    if (!this._footerPlaceholder) {
      Log.error(LOG_SOURCE, new Error('Placeholder not found'));
      return;
    }

    try {
      // Fetch shared and personal menu items in parallel for better performance
      const [sharedMenuItems, personalMenuItems] = await Promise.all([
        this._footerService.getSharedMenuItems(),
        this._footerService.getPersonalMenuItems()
      ]);

      Log.info(LOG_SOURCE, `Footer initialized with ${sharedMenuItems.length} shared links and ${personalMenuItems.length} personal links`);
      

      const element = createElement(
        ErrorBoundary,
        { 
          fallback: createElement('div', { style: { color: 'red', padding: '10px' } }, 'Error loading collaboration footer'),
          children: createElement(
            ModernCollabFooter,
            {
              sharedLinks: sharedMenuItems,
              myLinks: personalMenuItems,
              editMyLinks: this._editMyLinks.bind(this),
              openLinkSelection: this._config.storageType === 'hybrid' ? this._openLinkSelectionDialog.bind(this) : undefined,
              storageType: this._config.storageType,
              context: this.context,
              footerService: this._footerService,
              homeSiteUrl: this.properties.homeSiteUrl
            }
          )
        }
      );

      render(element, this._footerPlaceholder.domElement);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
    }
  }

  private _onDispose(): void {
    Log.info(LOG_SOURCE, 'Disposing collaboration footer and cleaning up resources');
    if (this._footerPlaceholder?.domElement) {
      unmountComponentAtNode(this._footerPlaceholder.domElement);
    }
  }
}