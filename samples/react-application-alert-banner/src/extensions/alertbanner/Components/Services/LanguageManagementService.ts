import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { logger } from './LoggerService';
import { LocalizationService, ILanguageInfo } from "./LocalizationService";
import { SharePointAlertService } from "./SharePointAlertService";

export interface ICustomLanguage extends ILanguageInfo {
  isCustom: boolean;
  hasContentColumns: boolean;
}

export class LanguageManagementService {
  private static _instance: LanguageManagementService;
  private _localizationService: LocalizationService;
  private _alertService: SharePointAlertService;
  private _customLanguages: ICustomLanguage[] = [];

  public static getInstance(
    context?: ApplicationCustomizerContext,
    localizationService?: LocalizationService,
    alertService?: SharePointAlertService
  ): LanguageManagementService {
    if (!LanguageManagementService._instance) {
      LanguageManagementService._instance = new LanguageManagementService(
        context,
        localizationService,
        alertService
      );
    }
    return LanguageManagementService._instance;
  }

  private constructor(
    context?: ApplicationCustomizerContext,
    localizationService?: LocalizationService,
    alertService?: SharePointAlertService
  ) {
    // Context is passed but not stored as it's not needed currently
    if (localizationService) this._localizationService = localizationService;
    if (alertService) this._alertService = alertService;
  }

  /**
   * Initialize the language management service
   */
  public async initialize(): Promise<void> {
    await this.loadCustomLanguages();
    await this.syncContentLanguages();
  }

  /**
   * Get all available languages (built-in + custom)
   */
  public async getAllAvailableLanguages(): Promise<ICustomLanguage[]> {
    const builtInLanguages = this._localizationService.getSupportedLanguages();
    const contentLanguages = await this._alertService.getSupportedLanguages();
    
    const allLanguages: ICustomLanguage[] = [];

    // Add built-in languages
    builtInLanguages.forEach(lang => {
      allLanguages.push({
        ...lang,
        isCustom: false,
        hasContentColumns: contentLanguages.includes(lang.code)
      });
    });

    // Add custom languages
    this._customLanguages.forEach(customLang => {
      if (!allLanguages.find(lang => lang.code === customLang.code)) {
        allLanguages.push({
          ...customLang,
          isCustom: true,
          hasContentColumns: contentLanguages.includes(customLang.code)
        });
      }
    });

    return allLanguages;
  }

  /**
   * Add a new custom language
   */
  public async addCustomLanguage(languageInfo: ILanguageInfo): Promise<void> {
    try {
      // Validate language info
      if (!this.validateLanguageInfo(languageInfo)) {
        throw new Error('Invalid language information provided');
      }

      // Check if language already exists
      const existing = await this.getAllAvailableLanguages();
      if (existing.find(lang => lang.code === languageInfo.code)) {
        throw new Error(`Language ${languageInfo.code} already exists`);
      }

      // Add columns to SharePoint list
      await this._alertService.addLanguageSupport(languageInfo.code);

      // Add to custom languages
      const customLanguage: ICustomLanguage = {
        ...languageInfo,
        isCustom: true,
        hasContentColumns: true
      };

      this._customLanguages.push(customLanguage);
      
      // Persist to storage
      await this.saveCustomLanguages();

      logger.info('LanguageManagementService', `Successfully added custom language: ${languageInfo.name} (${languageInfo.code})`);
    } catch (error) {
      logger.error('LanguageManagementService', 'Failed to add custom language', error);
      throw error;
    }
  }

  /**
   * Remove a custom language
   */
  public async removeCustomLanguage(languageCode: string): Promise<void> {
    try {
      const customLangIndex = this._customLanguages.findIndex(lang => lang.code === languageCode);
      if (customLangIndex === -1) {
        throw new Error(`Custom language ${languageCode} not found`);
      }

      // Note: We don't remove the SharePoint columns to preserve existing data
      // Just remove from custom languages list
      this._customLanguages.splice(customLangIndex, 1);
      
      await this.saveCustomLanguages();

      logger.info('LanguageManagementService', `Successfully removed custom language: ${languageCode}`);
    } catch (error) {
      logger.error('LanguageManagementService', 'Failed to remove custom language', error);
      throw error;
    }
  }

  /**
   * Get languages that have content columns but no UI support
   */
  public async getContentOnlyLanguages(): Promise<string[]> {
    try {
      const contentLanguages = await this._alertService.getSupportedLanguages();
      const uiLanguages = await this.getAllAvailableLanguages();
      
      return contentLanguages.filter(contentLang => 
        !uiLanguages.find(uiLang => uiLang.code === contentLang)
      );
    } catch (error) {
      logger.error('LanguageManagementService', 'Failed to get content-only languages', error);
      return [];
    }
  }

  /**
   * Validate language information
   */
  private validateLanguageInfo(languageInfo: ILanguageInfo): boolean {
    return !!(
      languageInfo.code &&
      languageInfo.name &&
      languageInfo.nativeName &&
      typeof languageInfo.isRTL === 'boolean' &&
      /^[a-z]{2}-[a-z]{2}$/i.test(languageInfo.code)
    );
  }

  /**
   * Load custom languages from storage
   */
  private async loadCustomLanguages(): Promise<void> {
    try {
      const stored = localStorage.getItem('alertbanner-custom-languages');
      if (stored) {
        this._customLanguages = JSON.parse(stored);
      }
    } catch (error) {
      logger.warn('LanguageManagementService', 'Failed to load custom languages from storage', error);
      this._customLanguages = [];
    }
  }

  /**
   * Save custom languages to storage
   */
  private async saveCustomLanguages(): Promise<void> {
    try {
      localStorage.setItem('alertbanner-custom-languages', JSON.stringify(this._customLanguages));
    } catch (error) {
      logger.warn('LanguageManagementService', 'Failed to save custom languages to storage', error);
    }
  }

  /**
   * Sync content languages with SharePoint columns
   */
  private async syncContentLanguages(): Promise<void> {
    try {
      const contentLanguages = await this._alertService.getSupportedLanguages();
      
      // Update hasContentColumns flag for all languages
      this._customLanguages.forEach(lang => {
        lang.hasContentColumns = contentLanguages.includes(lang.code);
      });
    } catch (error) {
      logger.warn('LanguageManagementService', 'Failed to sync content languages', error);
    }
  }

  /**
   * Get language-specific content fields for forms
   */
  public getContentFields(): { fieldName: string; displayName: string }[] {
    return [
      { fieldName: 'Title', displayName: 'Title' },
      { fieldName: 'Description', displayName: 'Description' },
      { fieldName: 'LinkDescription', displayName: 'Link Description' }
    ];
  }

  /**
   * Create field name for specific language
   */
  public createLanguageFieldName(fieldName: string, languageCode: string): string {
    const languageSuffix = languageCode.split('-')[0].toUpperCase();
    return `${fieldName}_${languageSuffix}`;
  }

  /**
   * Get suggested languages that users might want to add
   */
  public getSuggestedLanguages(): ILanguageInfo[] {
    const suggestions: ILanguageInfo[] = [
      { code: 'it-it', name: 'Italian', nativeName: 'Italiano', isRTL: false },
      { code: 'pt-pt', name: 'Portuguese', nativeName: 'Português', isRTL: false },
      { code: 'nl-nl', name: 'Dutch', nativeName: 'Nederlands', isRTL: false },
      { code: 'ru-ru', name: 'Russian', nativeName: 'Русский', isRTL: false },
      { code: 'ja-jp', name: 'Japanese', nativeName: '日本語', isRTL: false },
      { code: 'zh-cn', name: 'Chinese (Simplified)', nativeName: '简体中文', isRTL: false },
      { code: 'ko-kr', name: 'Korean', nativeName: '한국어', isRTL: false },
      { code: 'ar-sa', name: 'Arabic', nativeName: 'العربية', isRTL: true },
      { code: 'he-il', name: 'Hebrew', nativeName: 'עברית', isRTL: true },
      { code: 'pl-pl', name: 'Polish', nativeName: 'Polski', isRTL: false },
      { code: 'cs-cz', name: 'Czech', nativeName: 'Čeština', isRTL: false },
      { code: 'hu-hu', name: 'Hungarian', nativeName: 'Magyar', isRTL: false },
      { code: 'tr-tr', name: 'Turkish', nativeName: 'Türkçe', isRTL: false }
    ];

    return suggestions;
  }
}

// Export convenience function
export async function getLanguageManager(
  context?: ApplicationCustomizerContext,
  localizationService?: LocalizationService,
  alertService?: SharePointAlertService
): Promise<LanguageManagementService> {
  const manager = LanguageManagementService.getInstance(context, localizationService, alertService);
  await manager.initialize();
  return manager;
}