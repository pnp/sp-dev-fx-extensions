import { BaseComponentContext } from '@microsoft/sp-component-base';
import { Log } from '@microsoft/sp-core-library';
import { IUserSettings, IUserSettingsService, DEFAULT_USER_SETTINGS } from '../types/UserSettings';
import { OneDriveService, IOneDriveService } from './OneDriveService';
import { IOneDrivePersonalLinksData } from '../../../services/types/FooterTypes';

const LOG_SOURCE = 'UserSettingsService';

/**
 * Service for managing user settings and preferences
 * Stores settings in browser localStorage with user-specific keys
 */
export class UserSettingsService implements IUserSettingsService {
  private context: BaseComponentContext;
  private readonly STORAGE_KEY_PREFIX = 'collabFooter_userSettings_';
  private readonly ONEDRIVE_FILENAME = 'collaboration-footer-personal-links.json';
  private oneDriveService: IOneDriveService;
  private oneDriveAvailable: boolean | null = null;

  constructor(context: BaseComponentContext) {
    this.context = context;
    this.oneDriveService = new OneDriveService(context);
  }

  /**
   * Check if OneDrive is available for storage
   */
  private async checkOneDriveAvailability(): Promise<boolean> {
    if (this.oneDriveAvailable !== null) {
      return this.oneDriveAvailable;
    }

    try {
      const available = await this.oneDriveService.testConnection();
      this.oneDriveAvailable = available;
      Log.info(LOG_SOURCE, `OneDrive availability: ${available ? 'Available' : 'Not available'}`);
      return available;
    } catch (error) {
      Log.warn(LOG_SOURCE, `Failed to check OneDrive availability: ${(error as Error).message}`);
      this.oneDriveAvailable = false;
      return false;
    }
  }

  /**
   * Load settings from OneDrive personal links JSON
   */
  private async loadFromOneDrive(): Promise<IUserSettings | null> {
    try {
      const content = await this.oneDriveService.loadFile(this.ONEDRIVE_FILENAME);
      if (!content) {
        return null;
      }

      const personalLinksData = JSON.parse(content) as IOneDrivePersonalLinksData;
      if (personalLinksData.userSettings) {
        Log.info(LOG_SOURCE, 'Settings loaded from OneDrive personal links file');
        return personalLinksData.userSettings as IUserSettings;
      }
      
      return null;
    } catch (error) {
      Log.warn(LOG_SOURCE, `Failed to load settings from OneDrive: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Save settings to OneDrive personal links JSON
   */
  private async saveToOneDrive(settings: IUserSettings): Promise<boolean> {
    try {
      // Get existing personal links data
      let personalLinksData: IOneDrivePersonalLinksData;
      
      try {
        const existingContent = await this.oneDriveService.loadFile(this.ONEDRIVE_FILENAME);
        if (existingContent) {
          personalLinksData = JSON.parse(existingContent) as IOneDrivePersonalLinksData;
        } else {
          // Create new structure if file doesn't exist
          personalLinksData = {
            version: '1.0',
            lastModified: new Date().toISOString(),
            userId: this.context.pageContext.user.email,
            personalLinks: [],
            selectedGlobalLinkIds: []
          };
        }
      } catch (error) {
        // File doesn't exist, create new structure
        personalLinksData = {
          version: '1.0',
          lastModified: new Date().toISOString(),
          userId: this.context.pageContext.user.email,
          personalLinks: [],
          selectedGlobalLinkIds: []
        };
      }
      
      // Update user settings and lastModified
      personalLinksData.userSettings = settings;
      personalLinksData.lastModified = new Date().toISOString();
      
      const content = JSON.stringify(personalLinksData, null, 2);
      const success = await this.oneDriveService.saveFile(this.ONEDRIVE_FILENAME, content);
      if (success) {
        Log.info(LOG_SOURCE, 'Settings saved to OneDrive personal links file');
      }
      return success;
    } catch (error) {
      Log.warn(LOG_SOURCE, `Failed to save settings to OneDrive: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadFromLocalStorage(): IUserSettings | null {
    try {
      const userEmail = this.context.pageContext.user.email;
      const storageKey = this.getStorageKey(userEmail);
      const storedSettings = localStorage.getItem(storageKey);
      
      if (!storedSettings) {
        return null;
      }

      return JSON.parse(storedSettings) as IUserSettings;
    } catch (error) {
      Log.warn(LOG_SOURCE, `Failed to load settings from localStorage: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveToLocalStorage(settings: IUserSettings): boolean {
    try {
      const userEmail = this.context.pageContext.user.email;
      const storageKey = this.getStorageKey(userEmail);
      localStorage.setItem(storageKey, JSON.stringify(settings));
      return true;
    } catch (error) {
      Log.warn(LOG_SOURCE, `Failed to save settings to localStorage: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Get user settings, falling back to defaults if not found
   */
  public async getSettings(): Promise<IUserSettings> {
    try {
      let settings: IUserSettings | null = null;
      let loadedFrom = 'defaults';

      // Try to load from OneDrive first
      const oneDriveAvailable = await this.checkOneDriveAvailability();
      if (oneDriveAvailable) {
        settings = await this.loadFromOneDrive();
        if (settings) {
          loadedFrom = 'OneDrive';
        }
      }

      // Fallback to localStorage if OneDrive failed or not available
      if (!settings) {
        settings = this.loadFromLocalStorage();
        if (settings) {
          loadedFrom = 'localStorage';
        }
      }

      // Use defaults if nothing found
      if (!settings) {
        Log.info(LOG_SOURCE, 'No stored settings found, using defaults');
        return { ...DEFAULT_USER_SETTINGS };
      }

      Log.info(LOG_SOURCE, `Settings loaded from: ${loadedFrom}`);

      // Check if settings need migration
      if (!settings.version || settings.version !== DEFAULT_USER_SETTINGS.version) {
        Log.info(LOG_SOURCE, 'Migrating user settings to new version');
        const migratedSettings = this.migrateSettings(settings, settings.version || '0.0.0');
        await this.saveSettings(migratedSettings);
        return migratedSettings;
      }

      // Merge with defaults to ensure all properties exist
      return { ...DEFAULT_USER_SETTINGS, ...settings };
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return { ...DEFAULT_USER_SETTINGS };
    }
  }

  /**
   * Save user settings to both OneDrive and localStorage
   */
  public async saveSettings(settings: IUserSettings): Promise<boolean> {
    try {
      // Validate settings before saving
      const validatedSettings = this.validateSettings(settings);
      
      let oneDriveSuccess = false;
      let localStorageSuccess = false;

      // Try to save to OneDrive first
      const oneDriveAvailable = await this.checkOneDriveAvailability();
      if (oneDriveAvailable) {
        oneDriveSuccess = await this.saveToOneDrive(validatedSettings);
      }

      // Always save to localStorage as backup
      localStorageSuccess = this.saveToLocalStorage(validatedSettings);

      if (oneDriveSuccess) {
        Log.info(LOG_SOURCE, 'User settings saved to OneDrive and localStorage');
      } else if (localStorageSuccess) {
        Log.info(LOG_SOURCE, 'User settings saved to localStorage (OneDrive unavailable)');
      } else {
        Log.error(LOG_SOURCE, new Error('Failed to save settings to any storage'));
        return false;
      }

      return true;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Reset settings to defaults
   */
  public async resetToDefaults(): Promise<boolean> {
    try {
      let oneDriveSuccess = false;
      let localStorageSuccess = false;

      // Try to reset settings in OneDrive (keep personal links, just reset settings)
      const oneDriveAvailable = await this.checkOneDriveAvailability();
      if (oneDriveAvailable) {
        try {
          const existingContent = await this.oneDriveService.loadFile(this.ONEDRIVE_FILENAME);
          if (existingContent) {
            const personalLinksData = JSON.parse(existingContent) as IOneDrivePersonalLinksData;
            // Keep personal links but remove user settings
            delete personalLinksData.userSettings;
            personalLinksData.lastModified = new Date().toISOString();
            
            const content = JSON.stringify(personalLinksData, null, 2);
            oneDriveSuccess = await this.oneDriveService.saveFile(this.ONEDRIVE_FILENAME, content);
          } else {
            oneDriveSuccess = true; // No file exists, so no settings to reset
          }
        } catch (error) {
          Log.warn(LOG_SOURCE, `Failed to reset OneDrive settings: ${(error as Error).message}`);
        }
      }

      // Remove from localStorage
      try {
        const userEmail = this.context.pageContext.user.email;
        const storageKey = this.getStorageKey(userEmail);
        localStorage.removeItem(storageKey);
        localStorageSuccess = true;
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to clear localStorage: ${(error as Error).message}`);
      }

      if (oneDriveSuccess || localStorageSuccess) {
        Log.info(LOG_SOURCE, 'User settings reset to defaults');
        return true;
      } else {
        Log.error(LOG_SOURCE, new Error('Failed to reset settings in any storage'));
        return false;
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Migrate settings from older versions
   */
  public migrateSettings(oldSettings: any, oldVersion: string): IUserSettings {
    Log.info(LOG_SOURCE, `Migrating settings from version ${oldVersion} to ${DEFAULT_USER_SETTINGS.version}`);
    
    // Start with defaults and overlay valid old settings
    const migratedSettings: IUserSettings = { ...DEFAULT_USER_SETTINGS };
    
    // Migrate known properties
    if (oldSettings) {
      // Display settings
      if (oldSettings.displayMode) migratedSettings.displayMode = oldSettings.displayMode;
      if (oldSettings.pillStyle) migratedSettings.pillStyle = oldSettings.pillStyle;
      if (oldSettings.density) migratedSettings.density = oldSettings.density;
      
      // Icon and badge settings
      if (typeof oldSettings.showIcons === 'boolean') migratedSettings.showIcons = oldSettings.showIcons;
      if (oldSettings.iconSize) migratedSettings.iconSize = oldSettings.iconSize;
      if (typeof oldSettings.showBadges === 'boolean') migratedSettings.showBadges = oldSettings.showBadges;
      
      // Organization settings
      if (oldSettings.sortOrder) migratedSettings.sortOrder = oldSettings.sortOrder;
      if (typeof oldSettings.maxVisibleItems === 'number') migratedSettings.maxVisibleItems = oldSettings.maxVisibleItems;
      if (Array.isArray(oldSettings.hiddenCategories)) migratedSettings.hiddenCategories = oldSettings.hiddenCategories;
      if (oldSettings.defaultCategory) migratedSettings.defaultCategory = oldSettings.defaultCategory;
      
      // Personal link settings
      if (typeof oldSettings.enableAutoCategories === 'boolean') migratedSettings.enableAutoCategories = oldSettings.enableAutoCategories;
      if (typeof oldSettings.enableQuickAdd === 'boolean') migratedSettings.enableQuickAdd = oldSettings.enableQuickAdd;
      if (oldSettings.syncFrequency) migratedSettings.syncFrequency = oldSettings.syncFrequency;
      
      // Interaction settings
      if (oldSettings.clickBehavior) migratedSettings.clickBehavior = oldSettings.clickBehavior;
      if (typeof oldSettings.enableGlobalSearch === 'boolean') migratedSettings.enableGlobalSearch = oldSettings.enableGlobalSearch;
      if (typeof oldSettings.enableHoverEffects === 'boolean') migratedSettings.enableHoverEffects = oldSettings.enableHoverEffects;
      if (typeof oldSettings.enableKeyboardNavigation === 'boolean') migratedSettings.enableKeyboardNavigation = oldSettings.enableKeyboardNavigation;
      
      // Performance & privacy settings
      if (typeof oldSettings.cacheDuration === 'number') migratedSettings.cacheDuration = oldSettings.cacheDuration;
      if (typeof oldSettings.enableAnalytics === 'boolean') migratedSettings.enableAnalytics = oldSettings.enableAnalytics;
      if (typeof oldSettings.recentItemsCount === 'number') migratedSettings.recentItemsCount = oldSettings.recentItemsCount;
    }
    
    return migratedSettings;
  }

  /**
   * Validate settings values
   */
  private validateSettings(settings: IUserSettings): IUserSettings {
    const validated = { ...settings };
    
    // Validate numeric values
    validated.maxVisibleItems = Math.max(1, Math.min(50, validated.maxVisibleItems));
    validated.cacheDuration = Math.max(5, Math.min(1440, validated.cacheDuration)); // 5 minutes to 24 hours
    validated.recentItemsCount = Math.max(0, Math.min(20, validated.recentItemsCount));
    
    // Ensure arrays are valid
    if (!Array.isArray(validated.hiddenCategories)) {
      validated.hiddenCategories = [];
    }
    
    // Set current version
    validated.version = DEFAULT_USER_SETTINGS.version;
    
    return validated;
  }

  /**
   * Get storage key for user
   */
  private getStorageKey(userEmail: string): string {
    return `${this.STORAGE_KEY_PREFIX}${userEmail}`;
  }

  /**
   * Export settings for backup
   */
  public async exportSettings(): Promise<string> {
    const settings = await this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from backup
   */
  public async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const settings = JSON.parse(settingsJson) as IUserSettings;
      return await this.saveSettings(settings);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Get storage information with error details
   */
  public async getStorageInfo(): Promise<{ 
    oneDriveAvailable: boolean; 
    primaryStorage: 'OneDrive' | 'Local';
    lastSync: Date | null;
    error?: string;
    errorType?: string;
  }> {
    try {
      const storageInfo = await this.oneDriveService.getStorageInfo();
      return {
        oneDriveAvailable: storageInfo.available,
        primaryStorage: storageInfo.location,
        lastSync: null,
        error: storageInfo.error,
        errorType: storageInfo.errorType
      };
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return {
        oneDriveAvailable: false,
        primaryStorage: 'Local',
        lastSync: null,
        error: (error as Error).message,
        errorType: 'unknown'
      };
    }
  }

  /**
   * Get user-friendly error message for OneDrive issues
   */
  public getOneDriveErrorMessage(errorType?: string): string {
    return this.oneDriveService.getErrorMessage(errorType);
  }

  /**
   * Force sync from OneDrive (refresh local cache)
   */
  public async syncFromOneDrive(): Promise<boolean> {
    try {
      const oneDriveAvailable = await this.checkOneDriveAvailability();
      if (!oneDriveAvailable) {
        Log.warn(LOG_SOURCE, 'OneDrive not available for sync');
        return false;
      }

      const oneDriveSettings = await this.loadFromOneDrive();
      if (oneDriveSettings) {
        // Update localStorage with OneDrive data
        this.saveToLocalStorage(oneDriveSettings);
        Log.info(LOG_SOURCE, 'Successfully synced settings from OneDrive personal links file');
        return true;
      } else {
        Log.info(LOG_SOURCE, 'No settings found in OneDrive personal links file to sync');
        return false;
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }

  /**
   * Force sync to OneDrive (upload local settings)
   */
  public async syncToOneDrive(): Promise<boolean> {
    try {
      const oneDriveAvailable = await this.checkOneDriveAvailability();
      if (!oneDriveAvailable) {
        Log.warn(LOG_SOURCE, 'OneDrive not available for sync');
        return false;
      }

      const localSettings = this.loadFromLocalStorage();
      if (localSettings) {
        const success = await this.saveToOneDrive(localSettings);
        if (success) {
          Log.info(LOG_SOURCE, 'Successfully synced settings to OneDrive');
          return true;
        }
      } else {
        Log.info(LOG_SOURCE, 'No local settings found to sync');
        return false;
      }
      
      return false;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return false;
    }
  }
}