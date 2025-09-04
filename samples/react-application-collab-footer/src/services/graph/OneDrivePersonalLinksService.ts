import { BaseComponentContext } from '@microsoft/sp-component-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { Log } from '@microsoft/sp-core-library';
import { IFooterService } from '../ServiceFactory';
import { IPersonalLink, ISharedLink, IOneDrivePersonalLinksData } from '../types/FooterTypes';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

const LOG_SOURCE: string = 'OneDrivePersonalLinksService';
const PERSONAL_LINKS_FILE_NAME = 'collaboration-footer-personal-links.json';

/**
 * Service to manage personal links stored as JSON file in user's OneDrive
 * This provides user-specific link storage and selection capabilities
 */
export class OneDrivePersonalLinksService implements IFooterService {
  private graphClient: MSGraphClientV3;

  constructor(context: BaseComponentContext, graphClient: MSGraphClientV3) {
    this.graphClient = graphClient;
    Log.info(LOG_SOURCE, 'OneDrivePersonalLinksService initialized with Graph API');
  }

  /**
   * Get shared links - this service only handles personal links
   * Shared links should come from SharePoint List service
   */
  public async getSharedLinks(): Promise<ISharedLink[]> {
    // This service only handles personal links
    // Shared links will be handled by the SharePoint List service
    Log.info(LOG_SOURCE, 'OneDrivePersonalLinksService does not provide shared links');
    return [];
  }

  /**
   * Get personal links from OneDrive JSON file
   */
  public async getPersonalLinks(): Promise<IPersonalLink[]> {
    try {
      Log.info(LOG_SOURCE, 'Retrieving personal links from OneDrive JSON file');
      
      const fileData = await this.getPersonalLinksFile();
      if (!fileData) {
        Log.info(LOG_SOURCE, 'No personal links file found, returning empty array');
        return [];
      }

      const personalLinks = fileData.personalLinks || [];
      Log.info(LOG_SOURCE, `Successfully retrieved ${personalLinks.length} personal links from OneDrive`);
      return personalLinks;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Save personal links to OneDrive JSON file
   */
  public async savePersonalLinks(links: IPersonalLink[]): Promise<boolean> {
    try {
      Log.info(LOG_SOURCE, `Saving ${links.length} personal links to OneDrive JSON file`);
      
      const currentUser = await this.getCurrentUser();
      const fileData: IOneDrivePersonalLinksData = {
        version: '1.0',
        lastModified: new Date().toISOString(),
        userId: currentUser.id,
        personalLinks: links.map((link, index) => ({
          ...link,
          userId: currentUser.id,
          order: link.order || index,
          isActive: true
        }))
      };

      await this.savePersonalLinksFile(fileData);
      Log.info(LOG_SOURCE, 'Successfully saved personal links to OneDrive');
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Get the personal links JSON file from OneDrive
   */
  private async getPersonalLinksFile(): Promise<IOneDrivePersonalLinksData | null> {
    try {
      // Try to get the file from OneDrive root
      const fileResponse = await this.graphClient
        .api(`/me/drive/root:/${PERSONAL_LINKS_FILE_NAME}:/content`)
        .get();

      if (fileResponse) {
        const fileContent = typeof fileResponse === 'string' 
          ? fileResponse 
          : JSON.stringify(fileResponse);
        
        const parsedData: IOneDrivePersonalLinksData = JSON.parse(fileContent);
        Log.info(LOG_SOURCE, `Retrieved personal links file from OneDrive (version: ${parsedData.version})`);
        return parsedData;
      }
    } catch (error) {
      if ((error as any)?.code === 'itemNotFound') {
        Log.info(LOG_SOURCE, 'Personal links file not found in OneDrive, will create when saving');
        return null;
      }
      Log.warn(LOG_SOURCE, `Error retrieving personal links file: ${(error as Error).message}`);
      throw error;
    }
    return null;
  }

  /**
   * Save the personal links JSON file to OneDrive
   */
  private async savePersonalLinksFile(data: IOneDrivePersonalLinksData): Promise<void> {
    try {
      const fileContent = JSON.stringify(data, null, 2);
      
      // Check if file exists first
      let fileExists = false;
      try {
        await this.graphClient
          .api(`/me/drive/root:/${PERSONAL_LINKS_FILE_NAME}`)
          .get();
        fileExists = true;
      } catch (checkError) {
        // File doesn't exist, which is fine
        fileExists = false;
      }

      if (fileExists) {
        // Update existing file
        await this.graphClient
          .api(`/me/drive/root:/${PERSONAL_LINKS_FILE_NAME}:/content`)
          .put(fileContent);
      } else {
        // Create new file using simple put approach
        await this.graphClient
          .api(`/me/drive/root:/${PERSONAL_LINKS_FILE_NAME}:/content`)
          .put(fileContent);
      }

      Log.info(LOG_SOURCE, `Successfully saved personal links file to OneDrive`);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  /**
   * Get current user information
   */
  private async getCurrentUser(): Promise<{ id: string; displayName: string; userPrincipalName: string }> {
    try {
      const user = await this.graphClient
        .api('/me')
        .select('id,displayName,userPrincipalName')
        .get();

      return {
        id: user.id,
        displayName: user.displayName,
        userPrincipalName: user.userPrincipalName
      };
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw new Error('Failed to get current user information');
    }
  }

  /**
   * Check if the personal links file exists in OneDrive
   */
  public async checkFileExists(): Promise<boolean> {
    try {
      await this.graphClient
        .api(`/me/drive/root:/${PERSONAL_LINKS_FILE_NAME}`)
        .get();
      return true;
    } catch (error) {
      if ((error as any)?.code === 'itemNotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get user's selected global link IDs from OneDrive JSON
   */
  public async getUserSelectedGlobalLinks(): Promise<number[]> {
    try {
      Log.info(LOG_SOURCE, 'Retrieving user selected global links from OneDrive JSON file');
      
      const fileData = await this.getPersonalLinksFile();
      if (!fileData || !fileData.selectedGlobalLinkIds) {
        Log.info(LOG_SOURCE, 'No selected global links found, returning empty array');
        return [];
      }

      Log.info(LOG_SOURCE, `Retrieved ${fileData.selectedGlobalLinkIds.length} selected global links from OneDrive`);
      return fileData.selectedGlobalLinkIds;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Save user's selected global link IDs to OneDrive JSON
   */
  public async saveUserSelectedGlobalLinks(selectedLinkIds: number[]): Promise<boolean> {
    try {
      Log.info(LOG_SOURCE, `Saving ${selectedLinkIds.length} selected global links to OneDrive JSON file`);
      
      // Get current data
      const currentData = await this.getPersonalLinksFile();
      const currentUser = await this.getCurrentUser();
      
      const updatedData: IOneDrivePersonalLinksData = {
        version: '1.0',
        lastModified: new Date().toISOString(),
        userId: currentUser.id,
        personalLinks: currentData?.personalLinks || [],
        selectedGlobalLinkIds: selectedLinkIds
      };

      await this.savePersonalLinksFile(updatedData);
      Log.info(LOG_SOURCE, 'Successfully saved selected global links to OneDrive');
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Initialize the service and create the file if it doesn't exist
   */
  public async initialize(): Promise<void> {
    try {
      Log.info(LOG_SOURCE, 'Initializing OneDrive personal links service');
      
      const fileExists = await this.checkFileExists();
      if (!fileExists) {
        Log.info(LOG_SOURCE, 'Creating initial personal links file in OneDrive');
        const currentUser = await this.getCurrentUser();
        
        const initialData: IOneDrivePersonalLinksData = {
          version: '1.0',
          lastModified: new Date().toISOString(),
          userId: currentUser.id,
          personalLinks: [],
          selectedGlobalLinkIds: []
        };

        await this.savePersonalLinksFile(initialData);
        Log.info(LOG_SOURCE, 'Successfully created initial personal links file');
      } else {
        Log.info(LOG_SOURCE, 'Personal links file already exists in OneDrive');
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }

  public async getSharedMenuItems(): Promise<IContextualMenuItem[]> {
    return []; // This service does not provide shared menu items
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
        data: link
      }));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Get user's deselected global link IDs from OneDrive JSON
   */
  public async getUserDeselectedGlobalLinks(): Promise<number[]> {
    try {
      const fileData = await this.getPersonalLinksFile();
      
      if (!fileData || !fileData.deselectedGlobalLinkIds) {
        Log.info(LOG_SOURCE, 'No deselected global links found, returning empty array');
        return [];
      }

      Log.info(LOG_SOURCE, `Retrieved ${fileData.deselectedGlobalLinkIds.length} deselected global links from OneDrive`);
      return fileData.deselectedGlobalLinkIds;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Save user's deselected global link IDs to OneDrive JSON
   */
  public async saveUserDeselectedGlobalLinks(deselectedLinkIds: number[]): Promise<boolean> {
    try {
      Log.info(LOG_SOURCE, `Saving ${deselectedLinkIds.length} deselected global links to OneDrive JSON file`);
      
      // Get current data
      const currentData = await this.getPersonalLinksFile();
      const currentUser = await this.getCurrentUser();
      
      const updatedData: IOneDrivePersonalLinksData = {
        version: '1.0',
        lastModified: new Date().toISOString(),
        userId: currentUser.id,
        personalLinks: currentData?.personalLinks || [],
        selectedGlobalLinkIds: currentData?.selectedGlobalLinkIds || [],
        deselectedGlobalLinkIds: deselectedLinkIds,
        userSettings: currentData?.userSettings || {}
      };

      await this.savePersonalLinksFile(updatedData);
      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }
}