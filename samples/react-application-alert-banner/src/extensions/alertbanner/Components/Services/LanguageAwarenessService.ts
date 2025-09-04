import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { TargetLanguage, ContentType } from '../Alerts/IAlerts';
import { IAlertItem } from './SharePointAlertService';
import { logger } from './LoggerService';

export interface ISupportedLanguage {
  code: TargetLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isSupported: boolean;
  columnExists: boolean;
}

export interface ILanguageContent {
  language: TargetLanguage;
  title: string;
  description: string;
  linkDescription?: string;
  availableForAll?: boolean; // If true, this version can be shown to users of other languages
}

export interface IMultiLanguageAlert {
  baseAlert: Omit<IAlertItem, 'title' | 'description' | 'linkDescription'>;
  content: ILanguageContent[];
  languageGroup: string;
}

/**
 * Service for managing language-aware alert content and audience targeting
 */
export class LanguageAwarenessService {
  private graphClient: MSGraphClientV3;
  private context: ApplicationCustomizerContext;

  constructor(graphClient: MSGraphClientV3, context: ApplicationCustomizerContext) {
    this.graphClient = graphClient;
    this.context = context;
  }

  /**
   * Get tenant's default language from SharePoint context
   */
  public getTenantDefaultLanguage(): TargetLanguage {
    try {
      const spLanguage = (window as any)._spPageContextInfo?.currentCultureName;
      if (spLanguage) {
        return this.mapLanguageCode(spLanguage.toLowerCase());
      }
      
      const webLanguage = this.context.pageContext.web.language;
      if (webLanguage) {
        return this.mapSharePointLCID(webLanguage);
      }
    } catch (error) {
      logger.warn('LanguageAwarenessService', 'Could not detect tenant language', error);
    }
    
    return TargetLanguage.EnglishUS; // Default fallback
  }

  /**
   * Get all supported languages for the tenant
   */
  public static getSupportedLanguages(): ISupportedLanguage[] {
    return [
      { code: TargetLanguage.EnglishUS, name: 'English (US)', nativeName: 'English', flag: '🇺🇸', isSupported: true, columnExists: false },
      { code: TargetLanguage.FrenchFR, name: 'French (France)', nativeName: 'Français', flag: '🇫🇷', isSupported: false, columnExists: false },
      { code: TargetLanguage.GermanDE, name: 'German (Germany)', nativeName: 'Deutsch', flag: '🇩🇪', isSupported: false, columnExists: false },
      { code: TargetLanguage.SpanishES, name: 'Spanish (Spain)', nativeName: 'Español', flag: '🇪🇸', isSupported: false, columnExists: false },
      { code: TargetLanguage.SwedishSE, name: 'Swedish (Sweden)', nativeName: 'Svenska', flag: '🇸🇪', isSupported: false, columnExists: false },
      { code: TargetLanguage.FinnishFI, name: 'Finnish (Finland)', nativeName: 'Suomi', flag: '🇫🇮', isSupported: false, columnExists: false },
      { code: TargetLanguage.DanishDK, name: 'Danish (Denmark)', nativeName: 'Dansk', flag: '🇩🇰', isSupported: false, columnExists: false },
      { code: TargetLanguage.NorwegianNO, name: 'Norwegian (Norway)', nativeName: 'Norsk', flag: '🇳🇴', isSupported: false, columnExists: false }
    ];
  }

  /**
   * Detect user's preferred language from browser, Azure AD, or SharePoint profile
   */
  public async getUserPreferredLanguage(): Promise<TargetLanguage> {
    try {
      // 1. Try to get from Microsoft Graph user profile
      try {
        const userProfile = await this.graphClient.api('/me').select('preferredLanguage,mailboxSettings').get();
        if (userProfile.preferredLanguage) {
          const graphLanguage = this.mapLanguageCode(userProfile.preferredLanguage);
          if (graphLanguage !== TargetLanguage.EnglishUS) {
            logger.info('LanguageAwarenessService', `User preferred language from Graph: ${graphLanguage}`);
            return graphLanguage;
          }
        }
      } catch (error) {
        logger.warn('LanguageAwarenessService', 'Could not retrieve user language from Graph', error);
      }

      // 2. Try SharePoint context language
      const spLanguage = (window as any).SPClientContext?.web?.language;
      if (spLanguage) {
        const mappedLanguage = this.mapSharePointLCID(spLanguage);
        if (mappedLanguage !== TargetLanguage.EnglishUS) {
          logger.info('LanguageAwarenessService', `User language from SharePoint LCID ${spLanguage}: ${mappedLanguage}`);
          return mappedLanguage;
        }
      }

      // 3. Try browser language
      const browserLanguage = navigator.language?.toLowerCase();
      if (browserLanguage) {
        const mappedLanguage = this.mapLanguageCode(browserLanguage);
        if (mappedLanguage !== TargetLanguage.EnglishUS) {
          logger.info('LanguageAwarenessService', `User language from browser: ${mappedLanguage}`);
          return mappedLanguage;
        }
      }

      // 4. Default to English
      logger.info('LanguageAwarenessService', 'Using default language: English');
      return TargetLanguage.EnglishUS;

    } catch (error) {
      logger.error('LanguageAwarenessService', 'Error detecting user preferred language', error);
      return TargetLanguage.EnglishUS;
    }
  }

  /**
   * Map various language codes to our TargetLanguage enum
   */
  private mapLanguageCode(languageCode: string): TargetLanguage {
    const code = languageCode.toLowerCase();
    
    const languageMap: { [key: string]: TargetLanguage } = {
      'en': TargetLanguage.EnglishUS,
      'en-us': TargetLanguage.EnglishUS,
      'en-gb': TargetLanguage.EnglishUS, // Map UK English to US English for now
      'fr': TargetLanguage.FrenchFR,
      'fr-fr': TargetLanguage.FrenchFR,
      'fr-ca': TargetLanguage.FrenchFR, // Map Canadian French to France French
      'de': TargetLanguage.GermanDE,
      'de-de': TargetLanguage.GermanDE,
      'es': TargetLanguage.SpanishES,
      'es-es': TargetLanguage.SpanishES,
      'sv': TargetLanguage.SwedishSE,
      'sv-se': TargetLanguage.SwedishSE,
      'fi': TargetLanguage.FinnishFI,
      'fi-fi': TargetLanguage.FinnishFI,
      'da': TargetLanguage.DanishDK,
      'da-dk': TargetLanguage.DanishDK,
      'nb': TargetLanguage.NorwegianNO,
      'nb-no': TargetLanguage.NorwegianNO,
      'no': TargetLanguage.NorwegianNO
    };

    return languageMap[code] || TargetLanguage.EnglishUS;
  }

  /**
   * Map SharePoint LCID to our TargetLanguage enum
   */
  private mapSharePointLCID(lcid: number): TargetLanguage {
    const lcidMap: { [key: number]: TargetLanguage } = {
      1033: TargetLanguage.EnglishUS, // English (US)
      1036: TargetLanguage.FrenchFR,  // French (France)
      1031: TargetLanguage.GermanDE,  // German (Germany)
      1034: TargetLanguage.SpanishES, // Spanish (Spain)
      1053: TargetLanguage.SwedishSE, // Swedish (Sweden)
      1035: TargetLanguage.FinnishFI, // Finnish (Finland)
      1030: TargetLanguage.DanishDK,  // Danish (Denmark)
      1044: TargetLanguage.NorwegianNO // Norwegian (Norway)
    };

    return lcidMap[lcid] || TargetLanguage.EnglishUS;
  }

  /**
   * Filter and prioritize alerts based on user's preferred language with fallback logic
   */
  public filterAlertsForUser(alerts: IAlertItem[], userLanguage: TargetLanguage): IAlertItem[] {
    const tenantDefault = this.getTenantDefaultLanguage();
    
    // Group alerts by language group
    const alertGroups = new Map<string, IAlertItem[]>();
    const standaloneAlerts: IAlertItem[] = [];
    
    alerts.forEach(alert => {
      if (alert.languageGroup) {
        if (!alertGroups.has(alert.languageGroup)) {
          alertGroups.set(alert.languageGroup, []);
        }
        alertGroups.get(alert.languageGroup)!.push(alert);
      } else {
        // Handle standalone alerts (non-multi-language)
        if (alert.targetLanguage === TargetLanguage.All || alert.targetLanguage === userLanguage) {
          standaloneAlerts.push(alert);
        }
      }
    });
    
    // Process language groups with fallback logic
    const selectedAlerts: IAlertItem[] = [];
    
    alertGroups.forEach(groupAlerts => {
      // Try to find alert in user's preferred language
      let selectedAlert = groupAlerts.find(alert => alert.targetLanguage === userLanguage);
      
      // If not found, try to find alert marked as "available for all"
      if (!selectedAlert) {
        const fallbackContent = this.getLanguageContent(groupAlerts, groupAlerts[0].languageGroup!);
        const availableForAllContent = fallbackContent.find(content => content.availableForAll);
        
        if (availableForAllContent) {
          selectedAlert = groupAlerts.find(alert => alert.targetLanguage === availableForAllContent.language);
        }
      }
      
      // If still not found, fall back to tenant default language
      if (!selectedAlert) {
        selectedAlert = groupAlerts.find(alert => alert.targetLanguage === tenantDefault);
      }
      
      // Last resort: pick the first available alert in the group
      if (!selectedAlert) {
        selectedAlert = groupAlerts[0];
      }
      
      if (selectedAlert) {
        selectedAlerts.push(selectedAlert);
      }
    });
    
    return [...selectedAlerts, ...standaloneAlerts];
  }

  /**
   * Create a multi-language alert with content for each language
   */
  public createMultiLanguageAlert(baseAlert: Omit<IAlertItem, 'title' | 'description' | 'linkDescription'>, content: ILanguageContent[]): IMultiLanguageAlert {
    const languageGroup = `lang-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      baseAlert: {
        ...baseAlert,
        languageGroup
      },
      content,
      languageGroup
    };
  }

  /**
   * Generate individual alert items from multi-language alert
   */
  public generateAlertItems(multiLangAlert: IMultiLanguageAlert): IAlertItem[] {
    return multiLangAlert.content.map(content => ({
      ...multiLangAlert.baseAlert,
      title: content.title,
      description: content.description,
      linkUrl: multiLangAlert.baseAlert.linkUrl || '',
      linkDescription: content.linkDescription || '',
      targetLanguage: content.language,
      languageGroup: multiLangAlert.languageGroup,
      id: '0' // Will be set by SharePoint when created
    }));
  }

  /**
   * Get available languages for a specific site
   */
  public async getSiteLanguages(siteId: string): Promise<ISupportedLanguage[]> {
    try {
      // This would check which language columns exist in the SharePoint list
      // For now, return the supported languages - in a real implementation,
      // Get actual SharePoint list columns to determine available languages
      try {
        const listFields = await this.graphClient
          .api(`/sites/${siteId}/lists/Alerts/columns`)
          .select('name,displayName')
          .get();

        const availableLanguages: ISupportedLanguage[] = [];
        const supportedLanguages = LanguageAwarenessService.getSupportedLanguages();

        // Check which language columns exist in the SharePoint list
        for (const supportedLang of supportedLanguages) {
          const titleColumn = `Title_${supportedLang.code.replace('-', '').toUpperCase()}`;
          const descriptionColumn = `Description_${supportedLang.code.replace('-', '').toUpperCase()}`;
          
          // Check if both title and description columns exist for this language
          const hasTitleColumn = listFields.value.some((field: any) => field.name === titleColumn);
          const hasDescriptionColumn = listFields.value.some((field: any) => field.name === descriptionColumn);
          
          if (hasTitleColumn && hasDescriptionColumn) {
            availableLanguages.push(supportedLang);
          }
        }

        // Always include English as fallback if columns exist
        const englishLang = supportedLanguages.find(lang => lang.code === 'en-us');
        if (englishLang && !availableLanguages.some(lang => lang.code === 'en-us')) {
          // Check if basic Title and Description columns exist (English fallback)
          const hasTitle = listFields.value.some((field: any) => field.name === 'Title');
          const hasDescription = listFields.value.some((field: any) => field.name === 'Description');
          
          if (hasTitle && hasDescription) {
            availableLanguages.unshift(englishLang); // Add English at the beginning
          }
        }

        logger.info('LanguageAwarenessService', `Found ${availableLanguages.length} available languages in SharePoint list`, {
          siteId,
          availableLanguages: availableLanguages.map(lang => lang.code)
        });

        return availableLanguages.length > 0 ? availableLanguages : LanguageAwarenessService.getSupportedLanguages();
      } catch (listError) {
        logger.warn('LanguageAwarenessService', 'Could not check SharePoint list columns, using default languages', listError);
        // Fallback to default supported languages if list checking fails
        return LanguageAwarenessService.getSupportedLanguages();
      }
    } catch (error) {
      logger.error('LanguageAwarenessService', 'Error getting site languages', error);
      return LanguageAwarenessService.getSupportedLanguages();
    }
  }

  /**
   * Get language-specific content for editing
   */
  public getLanguageContent(alerts: IAlertItem[], languageGroup: string): ILanguageContent[] {
    const groupAlerts = alerts.filter(alert => alert.languageGroup === languageGroup);
    
    return groupAlerts.map(alert => ({
      language: alert.targetLanguage,
      title: alert.title,
      description: alert.description,
      linkDescription: alert.linkDescription
    }));
  }
}