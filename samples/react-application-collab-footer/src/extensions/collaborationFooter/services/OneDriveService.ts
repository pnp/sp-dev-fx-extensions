import { BaseComponentContext } from '@microsoft/sp-component-base';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE = 'OneDriveService';

export interface IOneDriveService {
  saveFile(fileName: string, content: string): Promise<boolean>;
  loadFile(fileName: string): Promise<string | null>;
  deleteFile(fileName: string): Promise<boolean>;
  fileExists(fileName: string): Promise<boolean>;
  testConnection(): Promise<boolean>;
  getStorageInfo(): Promise<{ 
    available: boolean; 
    location: 'OneDrive' | 'Local';
    error?: string;
    errorType?: 'permission' | 'authentication' | 'network' | 'quota' | 'unknown';
  }>;
  getErrorMessage(errorType?: string): string;
}

/**
 * Service for managing files in user's OneDrive
 * Uses Microsoft Graph API through SPFx context
 */
export class OneDriveService implements IOneDriveService {
  private context: BaseComponentContext;
  private readonly APP_FOLDER = 'CollaborationFooter';

  constructor(context: BaseComponentContext) {
    this.context = context;
  }

  /**
   * Get Microsoft Graph client with proper error handling
   */
  private async getGraphClient(): Promise<any> {
    try {
      // Check if we have the context
      if (!this.context) {
        Log.warn(LOG_SOURCE, 'SPFx context not available');
        return null;
      }

      // Use the SPFx MSGraphClientV3 if available
      if ((this.context as any).msGraphClientFactory) {
        try {
          return await (this.context as any).msGraphClientFactory.getClient('3');
        } catch (factoryError) {
          Log.warn(LOG_SOURCE, `MSGraphClientV3 factory failed: ${(factoryError as Error).message}`);
          
          // Fallback to standard MSGraphClient
          try {
            return await (this.context as any).msGraphClientFactory.getClient();
          } catch (fallbackError) {
            Log.error(LOG_SOURCE, new Error(`All Graph client factories failed: ${(fallbackError as Error).message}`));
            return null;
          }
        }
      }

      Log.error(LOG_SOURCE, new Error('Microsoft Graph client factory not available'));
      return null;
    } catch (error) {
      const errorMsg = (error as Error).message;
      
      // Handle specific permission errors
      if (errorMsg.includes('Forbidden') || errorMsg.includes('403')) {
        Log.warn(LOG_SOURCE, 'Insufficient permissions for Microsoft Graph API');
      } else if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        Log.warn(LOG_SOURCE, 'User not authenticated for Microsoft Graph API');
      } else {
        Log.error(LOG_SOURCE, error as Error);
      }
      
      return null;
    }
  }

  /**
   * Ensure app folder exists in OneDrive
   */
  private async ensureAppFolder(graphClient: any): Promise<string | null> {
    try {
      // Try to get the app folder
      try {
        const folderResponse = await graphClient
          .api(`/me/drive/root:/${this.APP_FOLDER}`)
          .get();
        return folderResponse.id;
      } catch (error) {
        // Folder doesn't exist, create it
        Log.info(LOG_SOURCE, 'Creating app folder in OneDrive');
        const newFolder = await graphClient
          .api('/me/drive/root/children')
          .post({
            name: this.APP_FOLDER,
            folder: {},
            '@microsoft.graph.conflictBehavior': 'rename'
          });
        return newFolder.id;
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return null;
    }
  }

  /**
   * Save a file to OneDrive with comprehensive error handling
   */
  public async saveFile(fileName: string, content: string): Promise<boolean> {
    try {
      const graphClient = await this.getGraphClient();
      if (!graphClient) {
        Log.warn(LOG_SOURCE, 'Graph client not available, cannot save to OneDrive');
        return false;
      }

      const folderId = await this.ensureAppFolder(graphClient);
      if (!folderId) {
        Log.error(LOG_SOURCE, new Error('Cannot create or access app folder'));
        return false;
      }

      // Save file to the app folder
      const fileContent = new Blob([content], { type: 'application/json' });
      
      await graphClient
        .api(`/me/drive/items/${folderId}:/${fileName}:/content`)
        .put(fileContent);

      Log.info(LOG_SOURCE, `File saved to OneDrive: ${fileName}`);
      return true;
    } catch (error) {
      const errorMsg = (error as Error).message;
      
      if (errorMsg.includes('Forbidden') || errorMsg.includes('403')) {
        Log.warn(LOG_SOURCE, `Insufficient permissions to save file to OneDrive: ${fileName}`);
      } else if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        Log.warn(LOG_SOURCE, `User not authenticated to save file to OneDrive: ${fileName}`);
      } else if (errorMsg.includes('QuotaLimitReached') || errorMsg.includes('InsufficientStorage')) {
        Log.warn(LOG_SOURCE, `OneDrive storage quota exceeded when saving: ${fileName}`);
      } else if (errorMsg.includes('ThrottledRequest') || errorMsg.includes('TooManyRequests')) {
        Log.warn(LOG_SOURCE, `OneDrive API throttled when saving: ${fileName}`);
      } else {
        Log.error(LOG_SOURCE, new Error(`Failed to save file to OneDrive: ${fileName} - ${errorMsg}`));
      }
      
      return false;
    }
  }

  /**
   * Load a file from OneDrive with comprehensive error handling
   */
  public async loadFile(fileName: string): Promise<string | null> {
    try {
      const graphClient = await this.getGraphClient();
      if (!graphClient) {
        Log.warn(LOG_SOURCE, 'Graph client not available, cannot load from OneDrive');
        return null;
      }

      // Try to get file content
      const response = await graphClient
        .api(`/me/drive/root:/${this.APP_FOLDER}/${fileName}:/content`)
        .get();

      // Handle different response types
      let content: string;
      if (typeof response === 'string') {
        content = response;
      } else if (response instanceof Blob) {
        content = await response.text();
      } else {
        content = JSON.stringify(response);
      }

      Log.info(LOG_SOURCE, `File loaded from OneDrive: ${fileName}`);
      return content;
    } catch (error) {
      const errorMsg = (error as Error).message;
      const errorCode = (error as any).code;
      
      if (errorCode === 'itemNotFound' || errorCode === 'NotFound') {
        Log.info(LOG_SOURCE, `File not found in OneDrive: ${fileName}`);
        return null;
      } else if (errorMsg.includes('Forbidden') || errorMsg.includes('403')) {
        Log.warn(LOG_SOURCE, `Insufficient permissions to load file from OneDrive: ${fileName}`);
        return null;
      } else if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        Log.warn(LOG_SOURCE, `User not authenticated to load file from OneDrive: ${fileName}`);
        return null;
      } else if (errorMsg.includes('ThrottledRequest') || errorMsg.includes('TooManyRequests')) {
        Log.warn(LOG_SOURCE, `OneDrive API throttled when loading: ${fileName}`);
        return null;
      } else {
        Log.error(LOG_SOURCE, new Error(`Failed to load file from OneDrive: ${fileName} - ${errorMsg}`));
        return null;
      }
    }
  }

  /**
   * Delete a file from OneDrive
   */
  public async deleteFile(fileName: string): Promise<boolean> {
    try {
      const graphClient = await this.getGraphClient();
      if (!graphClient) {
        Log.warn(LOG_SOURCE, 'Graph client not available, cannot delete from OneDrive');
        return false;
      }

      await graphClient
        .api(`/me/drive/root:/${this.APP_FOLDER}/${fileName}`)
        .delete();

      Log.info(LOG_SOURCE, `File deleted from OneDrive: ${fileName}`);
      return true;
    } catch (error) {
      if ((error as any).code === 'itemNotFound') {
        Log.info(LOG_SOURCE, `File not found for deletion: ${fileName}`);
        return true; // Consider it successful if file doesn't exist
      }
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Check if a file exists in OneDrive
   */
  public async fileExists(fileName: string): Promise<boolean> {
    try {
      const graphClient = await this.getGraphClient();
      if (!graphClient) {
        return false;
      }

      await graphClient
        .api(`/me/drive/root:/${this.APP_FOLDER}/${fileName}`)
        .get();

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test OneDrive connectivity
   */
  public async testConnection(): Promise<boolean> {
    try {
      const graphClient = await this.getGraphClient();
      if (!graphClient) {
        return false;
      }

      // Try to access user's drive
      await graphClient.api('/me/drive').get();
      return true;
    } catch (error) {
      Log.warn(LOG_SOURCE, `OneDrive connection test failed: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Get storage info with error details
   */
  public async getStorageInfo(): Promise<{ 
    available: boolean; 
    location: 'OneDrive' | 'Local';
    error?: string;
    errorType?: 'permission' | 'authentication' | 'network' | 'quota' | 'unknown';
  }> {
    try {
      const oneDriveAvailable = await this.testConnection();
      return {
        available: oneDriveAvailable,
        location: oneDriveAvailable ? 'OneDrive' : 'Local'
      };
    } catch (error) {
      const errorMsg = (error as Error).message;
      let errorType: 'permission' | 'authentication' | 'network' | 'quota' | 'unknown' = 'unknown';
      
      if (errorMsg.includes('Forbidden') || errorMsg.includes('403')) {
        errorType = 'permission';
      } else if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        errorType = 'authentication';
      } else if (errorMsg.includes('QuotaLimitReached') || errorMsg.includes('InsufficientStorage')) {
        errorType = 'quota';
      } else if (errorMsg.includes('NetworkError') || errorMsg.includes('ENOTFOUND')) {
        errorType = 'network';
      }
      
      return {
        available: false,
        location: 'Local',
        error: errorMsg,
        errorType
      };
    }
  }

  /**
   * Get user-friendly error message for UI display
   */
  public getErrorMessage(errorType?: string): string {
    switch (errorType) {
      case 'permission':
        return 'Insufficient permissions to access OneDrive. Please contact your administrator.';
      case 'authentication':
        return 'Please sign in to access OneDrive storage.';
      case 'quota':
        return 'OneDrive storage is full. Please free up space or contact your administrator.';
      case 'network':
        return 'Network connection issue. Please check your internet connection.';
      default:
        return 'OneDrive is temporarily unavailable. Settings will be stored locally.';
    }
  }
}