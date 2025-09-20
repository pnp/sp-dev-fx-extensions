import { MSGraphClientV3, SPHttpClient } from "@microsoft/sp-http";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { AlertPriority, NotificationType, IAlertType, IPersonField, ContentType, TargetLanguage } from "../Alerts/IAlerts";
import { logger } from './LoggerService';

export interface IRepairResult {
  success: boolean;
  message: string;
  details: {
    columnsRemoved: string[];
    columnsAdded: string[];
    columnsUpdated: string[];
    errors: string[];
    warnings: string[];
  };
}

export interface IAlertItem {
  id: string;
  title: string;
  description: string;
  AlertType: string;
  priority: AlertPriority;
  isPinned: boolean;
  targetUsers?: IPersonField[]; // People/Groups who can see this alert. If empty, everyone sees it
  notificationType: NotificationType;
  linkUrl?: string;
  linkDescription?: string;
  targetSites: string[];
  status: 'Active' | 'Expired' | 'Scheduled';
  createdDate: string;
  createdBy: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  metadata?: any;
  // New language and classification properties
  contentType: ContentType;
  targetLanguage: TargetLanguage;
  languageGroup?: string;
  availableForAll?: boolean;
  // Store the original SharePoint list item for multi-language access
  _originalListItem?: IAlertListItem;
}

export interface IMultiLanguageContent {
  [languageCode: string]: string;
}

export interface IAlertListItem {
  Id: number;
  Title: string;
  Description: string;
  AlertType: string;
  Priority: string;
  IsPinned: boolean;
  NotificationType: string;
  LinkUrl?: string;
  LinkDescription?: string;
  TargetSites: string;
  Status: string;
  Created: string;
  Author: {
    Title: string;
  };
  ScheduledStart?: string;
  ScheduledEnd?: string;
  Metadata?: string;

  // Multi-language content fields
  Title_EN?: string;
  Title_FR?: string;
  Title_DE?: string;
  Title_ES?: string;
  Title_SV?: string;
  Title_FI?: string;
  Title_DA?: string;
  Title_NO?: string;

  Description_EN?: string;
  Description_FR?: string;
  Description_DE?: string;
  Description_ES?: string;
  Description_SV?: string;
  Description_FI?: string;
  Description_DA?: string;
  Description_NO?: string;

  LinkDescription_EN?: string;
  LinkDescription_FR?: string;
  LinkDescription_DE?: string;
  LinkDescription_ES?: string;
  LinkDescription_SV?: string;
  LinkDescription_FI?: string;
  LinkDescription_DA?: string;
  LinkDescription_NO?: string;

  // Targeting
  TargetUsers?: any[]; // SharePoint People/Groups field data

  // Language and classification properties
  ItemType?: string;
  TargetLanguage?: string;
  LanguageGroup?: string;
  AvailableForAll?: boolean;

  // Dynamic language support - for additional languages
  [key: string]: any;
}

export class SharePointAlertService {
  private graphClient: MSGraphClientV3;
  private context: ApplicationCustomizerContext;
  private alertsListName = 'Alerts';
  private alertTypesListName = 'AlertBannerTypes';

  constructor(graphClient: MSGraphClientV3, context: ApplicationCustomizerContext) {
    this.graphClient = graphClient;
    this.context = context;
  }

  /**
   * Execute SharePoint API call with retry logic for transient failures
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        const isRetryable = this.isRetryableError(error);
        const isLastAttempt = attempt === maxRetries;

        if (!isRetryable || isLastAttempt) {
          logger.error('SharePointAlertService', `Operation failed after ${attempt} attempts`, error);
          throw error;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        logger.warn('SharePointAlertService', `Attempt ${attempt} failed, retrying in ${delay}ms`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Maximum retry attempts exceeded');
  }

  /**
   * Determine if an error is retryable (transient)
   */
  private isRetryableError(error: any): boolean {
    if (!error) return false;
    
    const retryableStatusCodes = [429, 500, 502, 503, 504];
    const retryableMessages = [
      'timeout',
      'network',
      'throttled',
      'temporarily unavailable',
      'service unavailable'
    ];

    // Check status code
    if (error.status || error.code) {
      const statusCode = parseInt(error.status || error.code);
      if (retryableStatusCodes.includes(statusCode)) {
        return true;
      }
    }

    // Check error message
    const errorMessage = (error.message || error.toString()).toLowerCase();
    return retryableMessages.some(msg => errorMessage.includes(msg));
  }

  /**
   * Check if the current site is the SharePoint home site
   */
  private async isHomeSite(siteId: string): Promise<boolean> {
    try {
      // Get the SharePoint home site ID
      const homeSiteResponse = await this.graphClient
        .api("/sites/root")
        .select("id")
        .get();
      const homeSiteId: string = homeSiteResponse.id;

      return siteId === homeSiteId;
    } catch (error) {
      logger.warn('SharePointAlertService', 'Unable to determine if site is home site, assuming it is not', error);
      return false;
    }
  }

  /**
   * Initialize SharePoint lists if they don't exist
   */
  /**
   * Check which sites need list creation
   */
  public async checkListsNeeded(): Promise<{ site: string; needsAlerts: boolean; needsTypes: boolean; isHomeSite: boolean }[]> {
    const results = [];
    const currentSiteId = this.context.pageContext.site.id.toString();
    
    // Check if current site is home site
    const isHomeSite = await this.isHomeSite(currentSiteId);
    
    // Check current site
    let needsAlerts = false;
    let needsTypes = false;
    
    try {
      await this.graphClient.api(`/sites/${currentSiteId}/lists/Alerts`).get();
    } catch (error) {
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        needsAlerts = true;
      }
    }
    
    // Only check for AlertBannerTypes if this is the home site
    if (isHomeSite) {
      try {
        await this.graphClient.api(`/sites/${currentSiteId}/lists/AlertBannerTypes`).get();
      } catch (error) {
        if (error.message?.includes('not found') || error.message?.includes('404')) {
          needsTypes = true;
        }
      }
    }
    
    results.push({
      site: currentSiteId,
      needsAlerts,
      needsTypes,
      isHomeSite
    });
    
    return results;
  }

  public async initializeLists(): Promise<void> {
    try {
      const siteId = this.context.pageContext.site.id.toString();
      logger.info('SharePointAlertService', `Initializing lists for site ${siteId}`);

      // Determine if this is the home site
      const isHomeSite = await this.isHomeSite(siteId);
      logger.info('SharePointAlertService', `Site ${siteId} is home site: ${isHomeSite}`);

      // Check if alerts list exists or can be created
      let alertsListCreated = false;
      let typesListCreated = false;
      
      try {
        alertsListCreated = await this.ensureAlertsList(siteId);
        if (alertsListCreated) {
          logger.info('SharePointAlertService', 'Alert Banner alerts list created successfully');
        } else {
          logger.debug('SharePointAlertService', 'Alert Banner alerts list already exists');
        }
      } catch (alertsError) {
        if (alertsError.message?.includes('PERMISSION_DENIED')) {
          logger.warn('SharePointAlertService', 'Cannot create alerts list due to insufficient permissions. Alert functionality may be limited.');
          // Don't throw here, continue with types list
        } else {
          throw alertsError;
        }
      }

      // Only create AlertBannerTypes list on the home site
      if (isHomeSite) {
        try {
          typesListCreated = await this.ensureAlertTypesList(siteId);
          if (typesListCreated) {
            logger.info('SharePointAlertService', 'Alert Banner types list created successfully on home site');
          } else {
            logger.debug('SharePointAlertService', 'Alert Banner types list already exists on home site');
          }
        } catch (typesError) {
          if (typesError.message?.includes('PERMISSION_DENIED')) {
            logger.warn('SharePointAlertService', 'Cannot create types list on home site due to insufficient permissions. Alert types may need to be managed by a tenant administrator.');
            // Don't throw here as this is not critical for basic alert functionality
          } else {
            throw typesError;
          }
        }
      } else {
        logger.debug('SharePointAlertService', 'AlertBannerTypes list creation skipped - not on home site. Types list should be managed from the home site.');
      }
    } catch (error) {
      // Enhanced error handling for common permission issues
      if (error.message?.includes('PERMISSION_DENIED')) {
        logger.warn('SharePointAlertService', 'SharePoint list creation failed due to insufficient permissions.');
        throw new Error('PERMISSION_DENIED: User lacks permissions to create SharePoint lists.');
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        logger.warn('SharePointAlertService', 'SharePoint lists not found and cannot be created.');
        throw new Error('LISTS_NOT_FOUND: SharePoint lists do not exist and cannot be created.');
      } else {
        logger.error('SharePointAlertService', 'Failed to initialize SharePoint lists', error);
        throw new Error(`INITIALIZATION_FAILED: ${error.message || 'Unknown error during SharePoint initialization'}`);
      }
    }
  }

  /**
   * Create alerts list if it doesn't exist
   */
  private async ensureAlertsList(siteId: string): Promise<boolean> {
    try {
      // Try to get the list first
      await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertsListName}`)
        .get();
      return false; // List already exists
    } catch (error) {
      // Check if it's a permission error or list doesn't exist
      if (error.message?.includes('Access denied') || error.message?.includes('403')) {
        logger.warn('SharePointAlertService', 'Cannot access or create alerts list due to insufficient permissions');
        throw new Error('PERMISSION_DENIED: User lacks permissions to access or create SharePoint lists.');
      }

      // Check if user has permission to create lists before attempting
      try {
        // Test permissions by trying to get all lists
        await this.graphClient
          .api(`/sites/${siteId}/lists`)
          .select('id')
          .top(1)
          .get();
      } catch (permissionError) {
        const errorMessage = permissionError.message || '';
        const statusCode = permissionError.code || '';
        
        logger.error('SharePointAlertService', 'Permission check failed', permissionError, {
          message: errorMessage,
          code: statusCode,
          siteId
        });
        
        if (errorMessage.includes('Access denied') || statusCode === '403' || errorMessage.includes('403')) {
          throw new Error('PERMISSION_DENIED: User lacks Sites.ReadWrite.All permissions to create SharePoint lists. Please contact your SharePoint administrator to grant the required permissions.');
        } else if (statusCode === '401') {
          throw new Error('AUTHENTICATION_FAILED: User authentication failed. Please re-authenticate.');
        } else {
          throw new Error(`PERMISSION_CHECK_FAILED: Unable to verify permissions - ${errorMessage}`);
        }
      }

      // List doesn't exist, create it
      logger.info('SharePointAlertService', 'Creating alerts list');

      const listDefinition = {
        displayName: this.alertsListName,
        list: {
          template: 'genericList'
        }
      };

      try {
        logger.debug('SharePointAlertService', 'Creating basic list structure');
        await this.graphClient
          .api(`/sites/${siteId}/lists`)
          .post(listDefinition);
        logger.info('SharePointAlertService', 'Basic list structure created successfully');

        // Add custom columns after list creation
        logger.debug('SharePointAlertService', 'Adding custom columns to Alerts list');
        await this.addAlertsListColumns(siteId);
        logger.info('SharePointAlertService', 'All custom columns added successfully');

        // Create template items after columns are added
        logger.debug('SharePointAlertService', 'Creating template alert items');
        await this.createTemplateAlerts(siteId);
        logger.info('SharePointAlertService', 'Template alert items created successfully');

        return true; // List was created
      } catch (createError) {
        if (createError.message?.includes('Access denied') || createError.message?.includes('403')) {
          logger.warn('SharePointAlertService', 'User lacks permissions to create SharePoint lists');
          throw new Error('PERMISSION_DENIED: User lacks permissions to create SharePoint lists.');
        }
        if (createError.message?.includes('CRITICAL_COLUMNS_FAILED')) {
          logger.error('SharePointAlertService', 'List created but critical columns failed', createError);
          throw new Error(`LIST_INCOMPLETE: ${createError.message}`);
        }
        throw createError;
      }
    }
  }

  /**
   * Add custom columns to the Alerts list after creation
   */
  private async addAlertsListColumns(siteId: string): Promise<void> {
    // Get the AlertBannerTypes list ID for the lookup field
    let alertTypesListId = '';
    try {
      const alertTypesList = await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertTypesListName}`)
        .select('id')
        .get();
      alertTypesListId = alertTypesList.id;
    } catch (error) {
      logger.warn('SharePointAlertService', 'Could not get AlertBannerTypes list ID for lookup field', error);
      // If we can't get the list ID, we'll create AlertType as a text field instead
    }

    const columns = [
      // Create AlertType as lookup if we have the AlertBannerTypes list, otherwise as text
      alertTypesListId ? {
        name: 'AlertType',
        lookup: {
          listId: alertTypesListId,
          columnName: 'Title',
          allowMultipleValues: false,
          allowUnlimitedLength: false
        }
      } : {
        name: 'AlertType',
        text: { 
          maxLength: 255,
          allowMultipleLines: false
        }
      },
      {
        name: 'Priority',
        text: { 
          maxLength: 50,
          allowMultipleLines: false
        }
      },
      {
        name: 'IsPinned',
        boolean: {}
      },
      {
        name: 'NotificationType',
        text: { 
          maxLength: 50,
          allowMultipleLines: false
        }
      },
      {
        name: 'LinkUrl',
        text: {}
      },
      {
        name: 'LinkDescription',
        text: { 
          maxLength: 255,
          allowMultipleLines: false
        }
      },
      {
        name: 'TargetSites',
        text: { 
          allowMultipleLines: true,
          maxLength: 4000
        }
      },
      {
        name: 'Status',
        text: { 
          maxLength: 50,
          allowMultipleLines: false
        }
      },
      {
        name: 'ScheduledStart',
        dateTime: {}
      },
      {
        name: 'ScheduledEnd',
        dateTime: {}
      },
      {
        name: 'Metadata',
        text: { 
          allowMultipleLines: true,
          maxLength: 4000
        }
      },
      {
        name: 'Description',
        text: { 
          allowMultipleLines: true,
          maxLength: 4000,
          textType: 'richText',
          linesForEditing: 10,
          appendChangesToExistingText: false
        }
      },
      // Language and classification properties
      {
        name: 'ItemType',
        choice: {
          allowTextEntry: false,
          choices: ['alert', 'template'],
          displayAs: 'dropDownMenu'
        }
      },
      {
        name: 'TargetLanguage',
        choice: {
          allowTextEntry: false,
          choices: ['all', 'en-us'], // Start with minimum: all and English, more languages added via management
          displayAs: 'dropDownMenu'
        }
      },
      {
        name: 'LanguageGroup',
        text: { 
          maxLength: 255,
          allowMultipleLines: false
        }
      },
      {
        name: 'AvailableForAll',
        boolean: {}
      },
      {
        name: 'TargetUsers',
        personOrGroup: {
          allowMultipleSelection: true,
          chooseFromType: 'peopleAndGroups'
        }
      }
    ];

    const criticalColumns = ['ScheduledStart', 'ScheduledEnd'];
    const failedColumns: string[] = [];

    for (const column of columns) {
      try {
        logger.debug('SharePointAlertService', `Creating column: ${column.name}`);
        await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertsListName}/columns`)
          .post(column);
        logger.debug('SharePointAlertService', `Successfully created column: ${column.name}`);
      } catch (error) {
        logger.error('SharePointAlertService', `Failed to create column ${column.name}`, error, {
          columnName: column.name,
          columnDefinition: column,
          statusCode: error.code || error.status
        });
        
        failedColumns.push(column.name);
        
        if (criticalColumns.includes(column.name) && column.name.includes('Scheduled')) {
          logger.debug('SharePointAlertService', `Retrying critical column ${column.name} with alternative methods`);
          
          const alternativeMethods = [
            {
              name: column.name,
              dateTime: {}
            },
            {
              name: column.name,
              dateTime: {
                format: 'dateTime'
              }
            },
            {
              name: column.name,
              text: { 
                maxLength: 255,
                allowMultipleLines: false
              }
            }
          ];

          let retrySuccess = false;
          for (let methodIndex = 0; methodIndex < alternativeMethods.length; methodIndex++) {
            try {
              logger.debug('SharePointAlertService', `Trying method ${methodIndex + 1} for ${column.name}`);
              await this.graphClient
                .api(`/sites/${siteId}/lists/${this.alertsListName}/columns`)
                .post(alternativeMethods[methodIndex]);
              logger.debug('SharePointAlertService', `Successfully created ${column.name} with alternative method ${methodIndex + 1}`);
              retrySuccess = true;
              // Remove from failed columns since we succeeded with retry
              const failedIndex = failedColumns.indexOf(column.name);
              if (failedIndex > -1) {
                failedColumns.splice(failedIndex, 1);
              }
              break;
            } catch (retryError) {
              logger.debug('SharePointAlertService', `Alternative method ${methodIndex + 1} failed for ${column.name}`, retryError);
              // Continue to next method
            }
          }
          
          if (!retrySuccess) {
            logger.error('SharePointAlertService', `All alternative methods failed for critical column ${column.name}`);
          }
        }
      }
    }

    // Report summary of column creation
    if (failedColumns.length > 0) {
      logger.warn('SharePointAlertService', `Column creation summary: ${failedColumns.length} columns failed`, { failedColumns });
      
      // If critical columns failed, throw an error
      const failedCriticalColumns = failedColumns.filter(name => criticalColumns.includes(name));
      if (failedCriticalColumns.length > 0) {
        logger.error('SharePointAlertService', `Critical columns failed: ${failedCriticalColumns.join(', ')}`);
        throw new Error(`CRITICAL_COLUMNS_FAILED: Failed to create critical columns: ${failedCriticalColumns.join(', ')}`);
      }
    } else {
      logger.info('SharePointAlertService', `All ${columns.length} columns created successfully`);
    }
  }

  /**
   * Create template alert items when list is first created
   */
  private async createTemplateAlerts(siteId: string): Promise<void> {
    // Import template data from JSON file
    const defaultTemplates = require('../Data/defaultTemplates.json');
    
    // Add dynamic dates to templates and map ContentType to ItemType
    const templateAlerts = defaultTemplates.map((template: any) => ({
      ...template,
      fields: {
        ...template.fields,
        ScheduledStart: new Date().toISOString(),
        // Set different end dates based on alert type for variety
        ScheduledEnd: this.getTemplateEndDate(template.fields.AlertType),
        // Map ContentType to ItemType for SharePoint
        ItemType: template.fields.ContentType,
        // Remove ContentType as it's not a SharePoint column
        ContentType: undefined
      }
    }));

    for (const template of templateAlerts) {
      try {
        await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertsListName}/items`)
          .post(template);
        logger.debug('SharePointAlertService', `Created template: ${template.fields.Title}`);
      } catch (error) {
        logger.warn('SharePointAlertService', `Failed to create template: ${template.fields.Title}`, error);
        // Don't throw error for template creation failures - they're nice-to-have
      }
    }
  }

  /**
   * Get appropriate end date for template based on alert type
   */
  private getTemplateEndDate(alertType: string): string {
    const now = Date.now();
    switch (alertType.toLowerCase()) {
      case 'maintenance':
        return new Date(now + 24 * 60 * 60 * 1000).toISOString(); // 1 day
      case 'warning':
        return new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days
      case 'interruption':
        return new Date(now + 12 * 60 * 60 * 1000).toISOString(); // 12 hours
      case 'info':
        return new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(); // 1 week
      default:
        return new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(); // 1 month
    }
  }

  /**
   * Get template alerts for the AlertTemplates component
   */
  public async getTemplateAlerts(siteId: string): Promise<IAlertItem[]> {
    try {
      const response = await this.executeWithRetry(() => 
        this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertsListName}/items`)
          .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
          .expand("fields($select=Title,AlertType,Description,Priority,IsPinned,NotificationType,LinkUrl,LinkDescription,TargetSites,Status,ItemType,TargetLanguage,LanguageGroup,ScheduledStart,ScheduledEnd,TargetUsers)")
          .filter("fields/ItemType eq 'template'")
          .orderby("fields/Created desc")
          .get()
      );

      return response.value.map((item: any) => this.mapSharePointItemToAlert(item));
    } catch (error) {
      logger.warn('SharePointAlertService', 'Could not fetch template alerts after retries', error);
      return [];
    }
  }

  /**
   * Create alert types list if it doesn't exist
   */
  private async ensureAlertTypesList(siteId: string): Promise<boolean> {
    try {
      // Try to get the list first
      await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertTypesListName}`)
        .get();
      return false; // List already exists
    } catch (error) {
      // Check if it's a permission error or list doesn't exist
      if (error.message?.includes('Access denied') || error.message?.includes('403')) {
        logger.warn('SharePointAlertService', 'Cannot access or create alert types list due to insufficient permissions');
        throw new Error('PERMISSION_DENIED: User lacks permissions to access or create SharePoint lists.');
      }

      // Check if user has permission to create lists before attempting
      try {
        // Test permissions by trying to get all lists
        await this.graphClient
          .api(`/sites/${siteId}/lists`)
          .select('id')
          .top(1)
          .get();
      } catch (permissionError) {
        if (permissionError.message?.includes('Access denied') || permissionError.message?.includes('403')) {
          logger.warn('SharePointAlertService', 'User lacks permissions to create SharePoint lists');
          throw new Error('PERMISSION_DENIED: User lacks permissions to create SharePoint lists.');
        }
      }

      // List doesn't exist, create it
      logger.info('SharePointAlertService', 'Creating alert types list');

      const listDefinition = {
        displayName: this.alertTypesListName,
        list: {
          template: 'genericList'
        }
      };

      try {
        await this.graphClient
          .api(`/sites/${siteId}/lists`)
          .post(listDefinition);

        // Add custom columns after list creation
        await this.addAlertTypesListColumns(siteId);

        return true; // List was created
      } catch (createError) {
        if (createError.message?.includes('Access denied') || createError.message?.includes('403')) {
          logger.warn('SharePointAlertService', 'User lacks permissions to create SharePoint lists');
          throw new Error('PERMISSION_DENIED: User lacks permissions to create SharePoint lists.');
        }
        throw createError;
      }
    }
  }

  /**
   * Add custom columns to the AlertTypes list after creation
   */
  private async addAlertTypesListColumns(siteId: string): Promise<void> {
    const columns = [
      {
        name: 'IconName',
        text: { 
          maxLength: 100,
          allowMultipleLines: false
        }
      },
      {
        name: 'BackgroundColor',
        text: { 
          maxLength: 50,
          allowMultipleLines: false
        }
      },
      {
        name: 'TextColor',
        text: { 
          maxLength: 50,
          allowMultipleLines: false
        }
      },
      {
        name: 'AdditionalStyles',
        text: { 
          allowMultipleLines: true,
          maxLength: 4000
        }
      },
      {
        name: 'PriorityStyles',
        text: { 
          allowMultipleLines: true,
          maxLength: 4000
        }
      },
      {
        name: 'SortOrder',
        number: { 
          decimalPlaces: 'none'
        },
        indexed: true
      }
    ];

    for (const column of columns) {
      try {
        await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertTypesListName}/columns`)
          .post(column);
      } catch (error) {
        logger.warn('SharePointAlertService', `Failed to create AlertTypes column ${column.name}`, error);
        // Continue creating other columns even if one fails
      }
    }
  }

  /**
   * Get all alerts from SharePoint
   */
  public async getAlerts(siteIds?: string[]): Promise<IAlertItem[]> {
    try {
      let sitesToQuery = siteIds;
      
      // If no specific sites provided, use hierarchical sites from SiteContextService
      if (!sitesToQuery) {
        try {
          // Import dynamically to avoid circular dependency
          const { SiteContextService } = await import('./SiteContextService');
          const siteContextService = SiteContextService.getInstance(this.context, this.graphClient);
          await siteContextService.initialize();
          sitesToQuery = siteContextService.getAlertSourceSites();
        } catch (error) {
          logger.warn('SharePointAlertService', 'Failed to get hierarchical sites, falling back to current site', error);
          sitesToQuery = [this.context.pageContext.site.id.toString()];
        }
      }
      const allAlerts: IAlertItem[] = [];
      const seenAlerts = new Map<string, IAlertItem>(); // Track alerts by title+description to avoid duplicates

      // Query alerts from each site
      for (const siteId of sitesToQuery) {
        try {
          const response = await this.graphClient
            .api(`/sites/${siteId}/lists/${this.alertsListName}/items`)
            .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
            .expand("fields($select=Title,AlertType,Description,Priority,IsPinned,NotificationType,LinkUrl,LinkDescription,TargetSites,Status,ItemType,TargetLanguage,LanguageGroup,ScheduledStart,ScheduledEnd,TargetUsers,Created,Author)")
            .orderby("fields/Created desc")
            .get();

          const siteAlerts = response.value.map((item: any) => this.mapSharePointItemToAlert(item, siteId));
          
          // Deduplicate alerts based on SharePoint item ID and site ID
          for (const alert of siteAlerts) {
            const dedupeKey = `${siteId}-${alert.id.split('-').pop()}`; // Use actual SharePoint item ID
            if (!seenAlerts.has(dedupeKey)) {
              seenAlerts.set(dedupeKey, alert);
              allAlerts.push(alert);
            } else {
              logger.debug('SharePointAlertService', `Duplicate alert detected and skipped: ${alert.title} (ID: ${alert.id})`);
            }
          }
        } catch (error) {
          logger.warn('SharePointAlertService', `Failed to get alerts from site ${siteId}`, error);
          // Continue with other sites
        }
      }

      return allAlerts.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    } catch (error) {
      // Enhanced error handling for permission and access issues
      if (error.message?.includes('Access denied') || error.message?.includes('403')) {
        logger.warn('SharePointAlertService', 'Access denied when trying to get alerts from SharePoint');
        throw new Error('PERMISSION_DENIED: Cannot access SharePoint alerts due to insufficient permissions.');
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        logger.warn('SharePointAlertService', 'SharePoint alerts list not found');
        throw new Error('LISTS_NOT_FOUND: SharePoint alerts list does not exist.');
      } else {
        logger.error('SharePointAlertService', 'Failed to get alerts', error);
        throw new Error(`GET_ALERTS_FAILED: ${error.message || 'Unknown error when retrieving alerts'}`);
      }
    }
  }

  /**
   * Create a new alert
   */
  public async createAlert(alert: Omit<IAlertItem, 'id' | 'createdDate' | 'createdBy' | 'status'>): Promise<IAlertItem> {
    try {
      const siteId = this.context.pageContext.site.id.toString();

      // Validate required fields
      if (!alert.title?.trim()) {
        throw new Error('Alert title is required');
      }
      if (!alert.description?.trim()) {
        throw new Error('Alert description is required');
      }
      if (!alert.AlertType?.trim()) {
        throw new Error('Alert type is required');
      }
      if (!alert.targetSites || alert.targetSites.length === 0) {
        throw new Error('At least one target site is required');
      }

      // Validate list exists and has required columns
      try {
        const listInfo = await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertsListName}`)
          .expand('columns')
          .get();
        
        const columnNames = listInfo.columns.map((col: any) => col.name);
        const alertTypeColumn = listInfo.columns.find((col: any) => col.name === 'AlertType');
        
        logger.debug('SharePointAlertService', 'Available list columns', { 
          columns: columnNames,
          alertTypeColumn: alertTypeColumn ? {
            name: alertTypeColumn.name,
            type: Object.keys(alertTypeColumn).filter(key => key !== 'name' && alertTypeColumn[key] != null)
          } : null
        });
        
        const requiredColumns = ['Title', 'Description', 'AlertType', 'Priority', 'IsPinned'];
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
        if (missingColumns.length > 0) {
          throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }
      } catch (listError: any) {
        logger.error('SharePointAlertService', 'Failed to validate list structure', listError);
        if (listError.message?.includes('Missing required columns')) {
          throw listError;
        }
        // Continue if we can't check the list structure
      }

      // Build the list item carefully with proper data types
      const fields: any = {
        Title: alert.title.trim(),
        Description: alert.description.trim(),
        AlertType: alert.AlertType.trim(), // This should be the lookup value (just the text name)
        Priority: alert.priority,
        IsPinned: Boolean(alert.isPinned),
        NotificationType: alert.notificationType
      };

      // Add optional fields only if they have values
      if (alert.linkUrl?.trim()) {
        fields.LinkUrl = alert.linkUrl.trim();
      }
      if (alert.linkDescription?.trim()) {
        fields.LinkDescription = alert.linkDescription.trim();
      }
      if (alert.targetSites && alert.targetSites.length > 0) {
        fields.TargetSites = JSON.stringify(alert.targetSites);
      }
      
      // Add status and scheduling
      fields.Status = alert.scheduledStart && new Date(alert.scheduledStart) > new Date() ? 'Scheduled' : 'Active';
      
      if (alert.scheduledStart) {
        fields.ScheduledStart = new Date(alert.scheduledStart).toISOString();
      }
      if (alert.scheduledEnd) {
        fields.ScheduledEnd = new Date(alert.scheduledEnd).toISOString();
      }
      if (alert.metadata) {
        fields.Metadata = JSON.stringify(alert.metadata);
      }

      // Add targeting
      if (alert.targetUsers && alert.targetUsers.length > 0) {
        fields.TargetUsers = alert.targetUsers;
      }

      // Add language and classification properties
      fields.ItemType = alert.contentType;
      fields.TargetLanguage = alert.targetLanguage;
      
      if (alert.languageGroup) {
        fields.LanguageGroup = alert.languageGroup;
      }
      fields.AvailableForAll = Boolean(alert.availableForAll);

      const listItem = { fields };

      logger.debug('SharePointAlertService', 'Creating alert with data', { 
        alert, 
        listItem: { ...listItem, fields: { ...listItem.fields, Description: listItem.fields.Description?.substring(0, 100) + '...' } }
      });

      let response;
      try {
        response = await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertsListName}/items`)
          .post(listItem);
        
        logger.debug('SharePointAlertService', 'Alert created successfully', { alertId: response.id });
      } catch (graphError: any) {
        // Parse the error object properly  
        const errorDetails = {
          message: graphError.message || 'Unknown error',
          code: graphError.code,
          statusCode: graphError.statusCode,
          body: graphError.body,
          stack: graphError.stack,
          name: graphError.name,
          fullError: JSON.stringify(graphError, Object.getOwnPropertyNames(graphError)),
          requestData: listItem
        };
        
        logger.error('SharePointAlertService', 'MS Graph API error when creating alert', errorDetails);
        
        // Try with minimal fields if the full request fails
        logger.warn('SharePointAlertService', 'Full request failed, trying with minimal fields');
        
        try {
          const minimalItem = {
            fields: {
              Title: alert.title.trim(),
              Description: alert.description.trim(),
              AlertType: alert.AlertType.trim(),
              Priority: alert.priority,
              IsPinned: Boolean(alert.isPinned),
              NotificationType: alert.notificationType,
              Status: 'Active'
            }
          };
          
          logger.debug('SharePointAlertService', 'Trying minimal request', minimalItem);
          
          response = await this.graphClient
            .api(`/sites/${siteId}/lists/${this.alertsListName}/items`)
            .post(minimalItem);
            
          logger.info('SharePointAlertService', 'Alert created with minimal fields', { alertId: response.id });
        } catch (minimalError: any) {
          logger.error('SharePointAlertService', 'Even minimal request failed', {
            error: minimalError.message,
            fullError: JSON.stringify(minimalError, Object.getOwnPropertyNames(minimalError))
          });
          
          // Provide more specific error message based on the error
          if (graphError.message?.includes('column') || graphError.message?.includes('field')) {
            throw new Error(`Field validation error: ${graphError.message}`);
          } else if (graphError.message?.includes('lookup')) {
            throw new Error(`Lookup field error: ${graphError.message}`);
          } else if (graphError.message?.includes('required')) {
            throw new Error(`Required field missing: ${graphError.message}`);
          }
          throw minimalError;
        }
      }

      // Get the created item with expanded fields
      try {
        const createdItem = await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertsListName}/items/${response.id}`)
          .expand('fields')
          .get();

        return this.mapSharePointItemToAlert(createdItem, siteId);
      } catch (retrieveError: any) {
        logger.warn('SharePointAlertService', 'Alert created but failed to retrieve details', { 
          alertId: response.id, 
          error: retrieveError.message 
        });
        // Return basic alert info if we can't retrieve the full details
        throw new Error('Alert created but could not retrieve details');
      }
    } catch (error) {
      logger.error('SharePointAlertService', 'Failed to create alert', error);
      throw error;
    }
  }

  /**
   * Extract site ID and item ID from composite alert ID
   */
  private parseAlertId(alertId: string): { siteId: string; itemId: string } {
    const lastHyphenIndex = alertId.lastIndexOf('-');
    if (lastHyphenIndex > 0 && lastHyphenIndex < alertId.length - 1) {
      const siteId = alertId.substring(0, lastHyphenIndex);
      const itemId = alertId.substring(lastHyphenIndex + 1);
      // Check if itemId is numeric (valid SharePoint item ID)
      if (/^\d+$/.test(itemId)) {
        return { siteId, itemId };
      }
    }
    // For backward compatibility, assume current site if no composite ID
    return { siteId: this.context.pageContext.site.id.toString(), itemId: alertId };
  }

  /**
   * Update an existing alert
   */
  public async updateAlert(alertId: string, updates: Partial<IAlertItem>): Promise<IAlertItem> {
    try {
      const { siteId, itemId } = this.parseAlertId(alertId);

      const listItem = {
        fields: {
          ...(updates.title && { Title: updates.title }),
          ...(updates.description && { Description: updates.description }),
          ...(updates.AlertType && { AlertType: updates.AlertType }),
          ...(updates.priority && { Priority: updates.priority }),
          ...(updates.isPinned !== undefined && { IsPinned: updates.isPinned }),
          ...(updates.notificationType && { NotificationType: updates.notificationType }),
          ...(updates.linkUrl !== undefined && { LinkUrl: updates.linkUrl }),
          ...(updates.linkDescription !== undefined && { LinkDescription: updates.linkDescription }),
          ...(updates.targetSites && { TargetSites: JSON.stringify(updates.targetSites) }),
          ...(updates.scheduledStart !== undefined && { ScheduledStart: updates.scheduledStart }),
          ...(updates.scheduledEnd !== undefined && { ScheduledEnd: updates.scheduledEnd }),
          ...(updates.targetUsers !== undefined && { TargetUsers: updates.targetUsers || [] }),
          ...(updates.metadata && { Metadata: JSON.stringify(updates.metadata) })
        }
      };

      await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertsListName}/items/${itemId}/fields`)
        .patch(listItem.fields);

      // Get the updated item
      const updatedItem = await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertsListName}/items/${itemId}`)
        .expand('fields')
        .get();

      return this.mapSharePointItemToAlert(updatedItem, siteId);
    } catch (error) {
      logger.error('SharePointAlertService', 'Failed to update alert', error);
      throw error;
    }
  }

  /**
   * Delete an alert
   */
  public async deleteAlert(alertId: string): Promise<void> {
    try {
      const { siteId, itemId } = this.parseAlertId(alertId);

      await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertsListName}/items/${itemId}`)
        .delete();
    } catch (error) {
      logger.error('SharePointAlertService', 'Failed to delete alert', error);
      throw error;
    }
  }

  /**
   * Delete multiple alerts
   */
  public async deleteAlerts(alertIds: string[]): Promise<void> {
    const deletePromises = alertIds.map(id => this.deleteAlert(id));
    await Promise.allSettled(deletePromises);
  }

  /**
   * Get alert types from SharePoint
   */
  public async getAlertTypes(): Promise<IAlertType[]> {
    try {
      const siteId = this.context.pageContext.site.id.toString();

      // Try to ensure the alert types list exists
      try {
        await this.ensureAlertTypesList(siteId);
      } catch (ensureError) {
        logger.warn('SharePointAlertService', 'Could not ensure alert types list exists', ensureError);
      }

      const response = await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertTypesListName}/items`)
        .expand('fields')
        .orderby('fields/SortOrder')
        .get();

      return response.value.map((item: any) => this.mapSharePointItemToAlertType(item));
    } catch (error) {
      logger.warn('SharePointAlertService', 'Failed to get alert types from SharePoint, using defaults', error);
      return this.getDefaultAlertTypes();
    }
  }

  /**
   * Save alert types to SharePoint
   */
  public async saveAlertTypes(alertTypes: IAlertType[]): Promise<void> {
    try {
      const siteId = this.context.pageContext.site.id.toString();

      // Clear existing items
      const existingItems = await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertTypesListName}/items`)
        .expand('fields')
        .get();

      for (const item of existingItems.value) {
        await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertTypesListName}/items/${item.id}`)
          .delete();
      }

      // Add new items
      for (let i = 0; i < alertTypes.length; i++) {
        const alertType = alertTypes[i];
        const listItem = {
          fields: {
            Title: alertType.name,
            IconName: alertType.iconName,
            BackgroundColor: alertType.backgroundColor,
            TextColor: alertType.textColor,
            AdditionalStyles: alertType.additionalStyles || '',
            PriorityStyles: JSON.stringify(alertType.priorityStyles || {}),
            SortOrder: i
          }
        };

        await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertTypesListName}/items`)
          .post(listItem);
      }
    } catch (error) {
      // Enhanced error handling for permission and access issues
      if (error.message?.includes('Access denied') || error.message?.includes('403')) {
        logger.warn('SharePointAlertService', 'Access denied when trying to save alert types to SharePoint. Changes will be stored locally only');
        throw new Error('PERMISSION_DENIED: Cannot save alert types to SharePoint due to insufficient permissions. Changes stored locally only.');
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        logger.warn('SharePointAlertService', 'SharePoint alert types list not found. Cannot save alert types');
        throw new Error('LISTS_NOT_FOUND: SharePoint alert types list does not exist. Cannot save changes.');
      } else {
        logger.error('SharePointAlertService', 'Failed to save alert types', error);
        throw new Error(`SAVE_ALERT_TYPES_FAILED: ${error.message || 'Unknown error when saving alert types'}`);
      }
    }
  }

  /**
   * Map SharePoint list item to alert object
   */
  private mapSharePointItemToAlert(item: any, siteId?: string): IAlertItem {
    const fields = item.fields;
    
    // Debug log the raw SharePoint item to see what we're getting
    logger.debug('SharePointAlertService', 'Mapping SharePoint item to alert', {
      itemId: item.id,
      fieldKeys: Object.keys(fields),
      title: fields.Title,
      description: fields.Description,
      alertType: fields.AlertType,
      rawFields: fields
    });
    
    // Create the original list item for multi-language support
    const originalListItem: IAlertListItem = {
      Id: parseInt(item.id.toString()),
      Title: fields.Title || '',
      Description: fields.Description || '',
      AlertType: fields.AlertType?.LookupValue || fields.AlertType || '',
      Priority: fields.Priority || AlertPriority.Medium,
      IsPinned: fields.IsPinned || false,
      NotificationType: fields.NotificationType || NotificationType.None,
      LinkUrl: fields.LinkUrl || '',
      LinkDescription: fields.LinkDescription || '',
      TargetSites: fields.TargetSites || '',
      Status: fields.Status || 'Active',
      Created: fields.Created || item.createdDateTime,
      Author: {
        Title: item.createdBy?.user?.displayName || item.author?.Title || 'Unknown'
      },
      ScheduledStart: fields.ScheduledStart || undefined,
      ScheduledEnd: fields.ScheduledEnd || undefined,
      Metadata: fields.Metadata || undefined,
      
      // Add all multi-language fields
      Title_EN: fields.Title_EN || '',
      Title_FR: fields.Title_FR || '',
      Title_DE: fields.Title_DE || '',
      Title_ES: fields.Title_ES || '',
      Title_SV: fields.Title_SV || '',
      Title_FI: fields.Title_FI || '',
      Title_DA: fields.Title_DA || '',
      Title_NO: fields.Title_NO || '',
      
      Description_EN: fields.Description_EN || '',
      Description_FR: fields.Description_FR || '',
      Description_DE: fields.Description_DE || '',
      Description_ES: fields.Description_ES || '',
      Description_SV: fields.Description_SV || '',
      Description_FI: fields.Description_FI || '',
      Description_DA: fields.Description_DA || '',
      Description_NO: fields.Description_NO || '',
      
      LinkDescription_EN: fields.LinkDescription_EN || '',
      LinkDescription_FR: fields.LinkDescription_FR || '',
      LinkDescription_DE: fields.LinkDescription_DE || '',
      LinkDescription_ES: fields.LinkDescription_ES || '',
      LinkDescription_SV: fields.LinkDescription_SV || '',
      LinkDescription_FI: fields.LinkDescription_FI || '',
      LinkDescription_DA: fields.LinkDescription_DA || '',
      LinkDescription_NO: fields.LinkDescription_NO || '',

      // Language and classification properties
      ItemType: fields.ItemType || '',
      TargetLanguage: fields.TargetLanguage || '',
      LanguageGroup: fields.LanguageGroup || '',
      AvailableForAll: fields.AvailableForAll || false,
      
      // Include any additional dynamic language fields
      ...Object.keys(fields)
        .filter(key => key.match(/^(Title|Description|LinkDescription)_[A-Z]{2}$/))
        .reduce((acc, key) => ({ ...acc, [key]: fields[key] }), {})
    };

    return {
      id: siteId ? `${siteId}-${item.id}` : item.id.toString(),
      title: fields.Title || '',
      description: fields.Description || '',
      AlertType: fields.AlertType?.LookupValue || fields.AlertType || '',
      priority: fields.Priority || AlertPriority.Medium,
      isPinned: fields.IsPinned || false,
      notificationType: fields.NotificationType || NotificationType.None,
      linkUrl: fields.LinkUrl || '',
      linkDescription: fields.LinkDescription || '',
      targetSites: fields.TargetSites ? JSON.parse(fields.TargetSites) : [],
      status: fields.Status || 'Active',
      createdDate: fields.Created || item.createdDateTime,
      createdBy: item.createdBy?.user?.displayName || item.author?.Title || 'Unknown',
      scheduledStart: fields.ScheduledStart || undefined,
      scheduledEnd: fields.ScheduledEnd || undefined,
      metadata: fields.Metadata ? JSON.parse(fields.Metadata) : undefined,
      // Language and classification properties
      contentType: (fields.ItemType as ContentType) || ContentType.Alert,
      targetLanguage: (fields.TargetLanguage as TargetLanguage) || TargetLanguage.All,
      languageGroup: fields.LanguageGroup || undefined,
      availableForAll: fields.AvailableForAll || false,
      targetUsers: fields.TargetUsers || [],
      _originalListItem: originalListItem
    };
  }

  /**
   * Repair the alerts list by removing outdated fields and adding current ones
   */
  public async repairAlertsList(siteId: string, progressCallback?: (message: string, progress: number) => void): Promise<IRepairResult> {
    logger.info('SharePointAlertService', `Starting repair of alerts list for site: ${siteId}`);
    
    const result: IRepairResult = {
      success: false,
      message: '',
      details: {
        columnsRemoved: [],
        columnsAdded: [],
        columnsUpdated: [],
        errors: [],
        warnings: []
      }
    };

    try {
      progressCallback?.('Analyzing current list structure...', 10);

      // First, verify the list exists and we have access
      let alertsList;
      try {
        alertsList = await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertsListName}`)
          .get();
      } catch (error) {
        throw new Error(`Cannot access alerts list: ${error.message}. Please ensure you have proper permissions.`);
      }

      progressCallback?.('Retrieving current column information...', 20);

      // Get current list columns
      const currentColumns = await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertsListName}/columns`)
        .get();

      // Get all non-system columns that might be outdated
      const customColumns = currentColumns.value.filter((col: any) => 
        !col.readOnly && 
        col.name !== 'Title' && 
        col.name !== 'Created' && 
        col.name !== 'Modified' &&
        col.name !== 'Author' &&
        col.name !== 'Editor' &&
        col.name !== 'ID' &&
        !col.name.startsWith('_') // Exclude system columns
      );

      logger.info('SharePointAlertService', `Found ${customColumns.length} custom columns to evaluate`);
      progressCallback?.(`Found ${customColumns.length} custom columns to evaluate...`, 30);

      // Define current schema columns
      const keepColumns = [
        'Title', 'Description', 'AlertType', 'Priority', 'IsPinned', 
        'NotificationType', 'LinkUrl', 'LinkDescription', 'TargetSites', 
        'Status', 'ScheduledStart', 'ScheduledEnd', 'Metadata',
        'ItemType', 'TargetLanguage', 'LanguageGroup', 'AvailableForAll',
        'TargetUsers'
      ];

      // Language-specific columns are no longer needed - we use separate items per language

      progressCallback?.('Removing outdated columns...', 40);

      // Remove outdated custom columns
      let removedCount = 0;
      for (const column of customColumns) {
        if (!keepColumns.includes(column.name)) {
          try {
            await this.graphClient
              .api(`/sites/${siteId}/lists/${this.alertsListName}/columns/${column.id}`)
              .delete();
            
            result.details.columnsRemoved.push(column.name);
            removedCount++;
            logger.info('SharePointAlertService', `Removed outdated column: ${column.name}`);
            
            progressCallback?.(`Removed column: ${column.name}`, 40 + (removedCount * 20 / Math.max(customColumns.length, 1)));
          } catch (error) {
            const errorMsg = `Could not remove column ${column.name}: ${error.message}`;
            result.details.warnings.push(errorMsg);
            logger.warn('SharePointAlertService', errorMsg);
          }
        }
      }

      progressCallback?.('Adding/updating current columns...', 70);

      // Add current columns with updated definitions
      try {
        await this.addAlertsListColumns(siteId);
        
        // Get the expected columns that should have been added
        const expectedColumns = this.getExpectedAlertListColumns();
        result.details.columnsAdded = expectedColumns.map(col => col.name);
        
        progressCallback?.('Validating column structure...', 85);
      } catch (error) {
        const errorMsg = `Failed to add current columns: ${error.message}`;
        result.details.errors.push(errorMsg);
        logger.error('SharePointAlertService', errorMsg);
      }

      // Final validation - check if all expected columns exist
      progressCallback?.('Performing final validation...', 90);
      
      try {
        const finalColumns = await this.graphClient
          .api(`/sites/${siteId}/lists/${this.alertsListName}/columns`)
          .get();
        
        const finalColumnNames = finalColumns.value.map((col: any) => col.name);
        const missingColumns = keepColumns.filter(colName => !finalColumnNames.includes(colName));
        
        if (missingColumns.length > 0) {
          result.details.warnings.push(`Some expected columns are still missing: ${missingColumns.join(', ')}`);
        }
      } catch (error) {
        result.details.warnings.push(`Could not validate final column structure: ${error.message}`);
      }

      progressCallback?.('Repair completed successfully!', 100);

      const hasErrors = result.details.errors.length > 0;
      const hasWarnings = result.details.warnings.length > 0;
      
      result.success = !hasErrors;
      
      if (hasErrors) {
        result.message = `Repair completed with ${result.details.errors.length} error(s)`;
      } else if (hasWarnings) {
        result.message = `Repair completed successfully with ${result.details.warnings.length} warning(s)`;
      } else {
        result.message = 'Alerts list repair completed successfully';
      }
      
      result.message += `. Removed ${result.details.columnsRemoved.length} outdated column(s), added/updated ${result.details.columnsAdded.length} current column(s).`;

      logger.info('SharePointAlertService', result.message);
      return result;

    } catch (error) {
      const errorMessage = `Failed to repair alerts list: ${error.message}`;
      result.details.errors.push(errorMessage);
      result.message = errorMessage;
      logger.error('SharePointAlertService', errorMessage, error);
      return result;
    }
  }

  /**
   * Get the current site ID from context
   */
  public getCurrentSiteId(): string {
    return this.context.pageContext.site.id.toString();
  }

  /**
   * Get expected column definitions for validation
   */
  private getExpectedAlertListColumns(): any[] {
    return [
      { name: 'AlertType' },
      { name: 'Priority' },
      { name: 'IsPinned' },
      { name: 'NotificationType' },
      { name: 'LinkUrl' },
      { name: 'LinkDescription' },
      { name: 'TargetSites' },
      { name: 'Status' },
      { name: 'ScheduledStart' },
      { name: 'ScheduledEnd' },
      { name: 'Metadata' },
      { name: 'Description' },
      { name: 'ItemType' },
      { name: 'TargetLanguage' },
      { name: 'LanguageGroup' },
      { name: 'AvailableForAll' },
      { name: 'TargetUsers' }
    ];
  }

  /**
   * Map SharePoint list item to alert type object
   */
  private mapSharePointItemToAlertType(item: any): IAlertType {
    const fields = item.fields;
    return {
      name: fields.Title || '',
      iconName: fields.IconName || 'Info',
      backgroundColor: fields.BackgroundColor || '#0078d4',
      textColor: fields.TextColor || '#ffffff',
      additionalStyles: fields.AdditionalStyles || '',
      priorityStyles: fields.PriorityStyles ? JSON.parse(fields.PriorityStyles) : {}
    };
  }

  /**
   * Get default alert types for fallback
   */
  private getDefaultAlertTypes(): IAlertType[] {
    return [
      {
        name: "Info",
        iconName: "Info",
        backgroundColor: "#389899",
        textColor: "#ffffff",
        additionalStyles: "",
        priorityStyles: {
          [AlertPriority.Critical]: "border: 2px solid #E81123;",
          [AlertPriority.High]: "border: 1px solid #EA4300;",
          [AlertPriority.Medium]: "",
          [AlertPriority.Low]: ""
        }
      },
      {
        name: "Warning",
        iconName: "Warning",
        backgroundColor: "#f1c40f",
        textColor: "#000000",
        additionalStyles: "",
        priorityStyles: {
          [AlertPriority.Critical]: "border: 2px solid #E81123;",
          [AlertPriority.High]: "border: 1px solid #EA4300;",
          [AlertPriority.Medium]: "",
          [AlertPriority.Low]: ""
        }
      },
      {
        name: "Maintenance",
        iconName: "ConstructionCone",
        backgroundColor: "#afd6d6",
        textColor: "#000000",
        additionalStyles: "",
        priorityStyles: {
          [AlertPriority.Critical]: "border: 2px solid #E81123;",
          [AlertPriority.High]: "border: 1px solid #EA4300;",
          [AlertPriority.Medium]: "",
          [AlertPriority.Low]: ""
        }
      },
      {
        name: "Interruption",
        iconName: "Error",
        backgroundColor: "#c54644",
        textColor: "#ffffff",
        additionalStyles: "",
        priorityStyles: {
          [AlertPriority.Critical]: "border: 2px solid #E81123;",
          [AlertPriority.High]: "border: 1px solid #EA4300;",
          [AlertPriority.Medium]: "",
          [AlertPriority.Low]: ""
        }
      }
    ];
  }

  /**
   * Get active alerts for display (considering scheduling)
   */
  public async getActiveAlerts(siteIds?: string[]): Promise<IAlertItem[]> {
    const allAlerts = await this.getAlerts(siteIds);
    const now = new Date();

    return allAlerts.filter(alert => {
      // Check if alert is scheduled and within active period
      // If scheduledStart exists and is in the future, not yet active
      if (alert.scheduledStart && new Date(alert.scheduledStart) > now) {
        return false; // Not yet active
      }

      // If scheduledEnd exists and is in the past, already expired
      if (alert.scheduledEnd && new Date(alert.scheduledEnd) < now) {
        return false; // Already expired
      }

      // Alert is active if:
      // 1. Status is 'Active' (regardless of dates)
      // 2. Status is 'Scheduled' and start time has passed (or no start time = forever)
      // 3. No dates at all means it's a forever alert
      return alert.status === 'Active' ||
        (alert.status === 'Scheduled' &&
          (!alert.scheduledStart || new Date(alert.scheduledStart) <= now));
    });
  }


  /**
   * Update alert status based on scheduling
   */
  public async updateAlertStatuses(): Promise<void> {
    try {
      const allAlerts = await this.getAlerts();
      const now = new Date();
      const updatesNeeded: { id: string, status: string }[] = [];

      for (const alert of allAlerts) {
        let newStatus = alert.status;

        if (alert.scheduledEnd && new Date(alert.scheduledEnd) < now && alert.status !== 'Expired') {
          newStatus = 'Expired';
        } else if (alert.scheduledStart && new Date(alert.scheduledStart) <= now && alert.status === 'Scheduled') {
          newStatus = 'Active';
        }

        if (newStatus !== alert.status) {
          updatesNeeded.push({ id: alert.id, status: newStatus });
        }
      }

      // Batch update statuses
      for (const update of updatesNeeded) {
        await this.updateAlert(update.id, { status: update.status as any });
      }
    } catch (error) {
      logger.error('SharePointAlertService', 'Failed to update alert statuses', error);
    }
  }

  /**
   * Get localized content for a specific field and language
   */
  public getLocalizedField(item: IAlertListItem, fieldName: string, languageCode: string): string {
    // Convert language code to uppercase format for field names (e.g., 'en-us' -> 'EN')
    const languageSuffix = languageCode.split('-')[0].toUpperCase();
    const localizedFieldName = `${fieldName}_${languageSuffix}`;

    // Try localized field first, then fall back to English, then original field
    return item[localizedFieldName] || 
           item[`${fieldName}_EN`] || 
           item[fieldName] || 
           '';
  }

  /**
   * Get all available languages for multi-language content
   */
  public getAvailableContentLanguages(item: IAlertListItem): string[] {
    const languages: string[] = [];
    const fieldPrefixes = ['Title_', 'Description_', 'LinkDescription_'];
    
    // Check which language fields have content
    Object.keys(item).forEach(key => {
      fieldPrefixes.forEach(prefix => {
        if (key.startsWith(prefix)) {
          const languageCode = key.substring(prefix.length).toLowerCase();
          const fullLanguageCode = this.mapLanguageCodeToFull(languageCode);
          if (item[key] && !languages.includes(fullLanguageCode)) {
            languages.push(fullLanguageCode);
          }
        }
      });
    });

    return languages;
  }

  /**
   * Map short language codes to full codes (e.g., 'EN' -> 'en-us')
   */
  private mapLanguageCodeToFull(shortCode: string): string {
    const languageMap: { [key: string]: string } = {
      'EN': 'en-us',
      'FR': 'fr-fr',
      'DE': 'de-de',
      'ES': 'es-es',
      'SV': 'sv-se',
      'FI': 'fi-fi',
      'DA': 'da-dk',
      'NO': 'nb-no'
    };

    return languageMap[shortCode.toUpperCase()] || shortCode.toLowerCase();
  }


  /**
   * Get localized content from an alert item
   */
  public getLocalizedAlertContent(alertItem: IAlertItem, languageCode: string): {
    title: string;
    description: string;
    linkDescription: string;
  } {
    if (!alertItem._originalListItem) {
      // Fallback to default fields if no original list item
      return {
        title: alertItem.title,
        description: alertItem.description,
        linkDescription: alertItem.linkDescription || ''
      };
    }

    return {
      title: this.getLocalizedField(alertItem._originalListItem, 'Title', languageCode),
      description: this.getLocalizedField(alertItem._originalListItem, 'Description', languageCode),
      linkDescription: this.getLocalizedField(alertItem._originalListItem, 'LinkDescription', languageCode)
    };
  }

  /**
   * Check if alert has content in specific language
   */
  public alertHasLanguageContent(alertItem: IAlertItem, languageCode: string): boolean {
    if (!alertItem._originalListItem) return false;

    const content = this.getLocalizedAlertContent(alertItem, languageCode);
    return !!(content.title || content.description || content.linkDescription);
  }

  /**
   * Get all languages that have content for a specific alert
   */
  public getAlertContentLanguages(alertItem: IAlertItem): string[] {
    if (!alertItem._originalListItem) return [];
    
    return this.getAvailableContentLanguages(alertItem._originalListItem);
  }

  /**
   * Update multi-language content for an alert
   */
  public async updateAlertMultiLanguageContent(
    alertId: string, 
    multiLanguageContent: { [languageCode: string]: { title?: string; description?: string; linkDescription?: string } }
  ): Promise<void> {
    try {
      const siteId = this.context.pageContext.site.id.toString();
      const updateFields: any = {};

      // Convert multi-language content to SharePoint field format
      Object.entries(multiLanguageContent).forEach(([languageCode, content]) => {
        const languageSuffix = languageCode.split('-')[0].toUpperCase();
        
        if (content.title !== undefined) {
          updateFields[`Title_${languageSuffix}`] = content.title;
        }
        if (content.description !== undefined) {
          updateFields[`Description_${languageSuffix}`] = content.description;
        }
        if (content.linkDescription !== undefined) {
          updateFields[`LinkDescription_${languageSuffix}`] = content.linkDescription;
        }
      });

      await this.graphClient
        .api(`/sites/${siteId}/lists/${this.alertsListName}/items/${alertId}/fields`)
        .patch(updateFields);

      logger.debug('SharePointAlertService', `Updated multi-language content for alert ${alertId}`);
    } catch (error) {
      logger.error('SharePointAlertService', 'Failed to update multi-language content', error);
      throw error;
    }
  }

  /**
   * Get supported languages from TargetLanguage choice field
   */
  public async getSupportedLanguages(): Promise<string[]> {
    try {
      // Use SharePoint REST API for consistency with updateTargetLanguageChoices
      const webAbsoluteUrl = this.context.pageContext.web.absoluteUrl;
      const fieldInfoUrl = `${webAbsoluteUrl}/_api/web/lists/getbytitle('${this.alertsListName}')/fields/getbytitle('TargetLanguage')`;
      
      const fieldResponse = await this.context.spHttpClient.get(fieldInfoUrl, 
        SPHttpClient.configurations.v1, {
          headers: {
            'Accept': 'application/json;odata.metadata=minimal'
          }
        });
      
      if (fieldResponse.ok) {
        const fieldData = await fieldResponse.json();
        const targetLanguageColumn = fieldData.value || fieldData;
        const choices = targetLanguageColumn.Choices || ['en-us'];
        
        // Filter out 'all' and return actual language codes
        return choices.filter((choice: string) => choice !== 'all');
      }

      return ['en-us']; // Default fallback
    } catch (error) {
      logger.warn('SharePointAlertService', 'Failed to get supported languages:', error);
      return ['en-us'];
    }
  }

  /**
   * Add a language to the TargetLanguage choice field
   */
  public async addLanguageSupport(languageCode: string): Promise<void> {
    try {
      await this.updateTargetLanguageChoices('add', languageCode);
      logger.info('SharePointAlertService', `Successfully added language support for ${languageCode}`);
    } catch (error) {
      logger.error('SharePointAlertService', `Error adding language support for ${languageCode}:`, error);
      throw error;
    }
  }

  /**
   * Remove a language from the TargetLanguage choice field
   */
  public async removeLanguageSupport(languageCode: string): Promise<void> {
    try {
      await this.updateTargetLanguageChoices('remove', languageCode);
      logger.info('SharePointAlertService', `Successfully removed language support for ${languageCode}`);
    } catch (error) {
      logger.error('SharePointAlertService', `Error removing language support for ${languageCode}:`, error);
      throw error;
    }
  }

  /**
   * Update the TargetLanguage choice field choices
   */
  private async updateTargetLanguageChoices(action: 'add' | 'remove', languageCode: string): Promise<void> {
    try {
      const siteId = this.context.pageContext.site.id.toString();

      // Get current TargetLanguage column using SharePoint REST API for consistency
      const webAbsoluteUrl = this.context.pageContext.web.absoluteUrl;
      const fieldInfoUrl = `${webAbsoluteUrl}/_api/web/lists/getbytitle('${this.alertsListName}')/fields/getbytitle('TargetLanguage')`;
      
      const fieldResponse = await this.context.spHttpClient.get(fieldInfoUrl, 
        SPHttpClient.configurations.v1, {
          headers: {
            'Accept': 'application/json;odata.metadata=minimal'
          }
        });
      
      if (!fieldResponse.ok) {
        logger.warn('SharePointAlertService', 'TargetLanguage column not found via REST API');
        return;
      }
      
      const fieldData = await fieldResponse.json();
      const targetLanguageColumn = fieldData.value || fieldData;
      const currentChoices = targetLanguageColumn.Choices || ['all', 'en-us'];

      logger.info('SharePointAlertService', `Current TargetLanguage choices from REST API:`, { currentChoices });

      let updatedChoices: string[];
      if (action === 'add') {
        // Add the language if not already present
        if (!currentChoices.includes(languageCode)) {
          updatedChoices = [...currentChoices, languageCode].sort();
        } else {
          updatedChoices = currentChoices;
          logger.info('SharePointAlertService', `Language ${languageCode} already exists in choices`);
          return; // No update needed
        }
      } else {
        // Remove the language (but keep 'all' and 'en-us')
        updatedChoices = currentChoices.filter((choice: string) => 
          choice !== languageCode || choice === 'all' || choice === 'en-us'
        );
        if (updatedChoices.length === currentChoices.length) {
          logger.info('SharePointAlertService', `Language ${languageCode} not found in choices`);
          return; // No update needed
        }
      }

      logger.info('SharePointAlertService', `Updating TargetLanguage choices from [${currentChoices.join(', ')}] to [${updatedChoices.join(', ')}]`);

      // Use SharePoint REST API (the correct approach for choice field schema updates)
      // Graph API cannot update choice field schemas, only REST API works
      logger.info('SharePointAlertService', 'Using SharePoint REST API approach for choice field schema update');
      
      // Prepare the update payload for REST API (OData v4.0 format)
      const updatePayload = {
        '@odata.type': 'SP.FieldChoice',
        Choices: updatedChoices
      };
      
      // Update the field via REST API
      const updateUrl = `${webAbsoluteUrl}/_api/web/lists/getbytitle('${this.alertsListName}')/fields/getbytitle('TargetLanguage')`;
      
      const updateResponse = await this.context.spHttpClient.post(updateUrl, 
        SPHttpClient.configurations.v1, {
          headers: {
            'Accept': 'application/json;odata.metadata=minimal',
            'Content-Type': 'application/json;odata.metadata=minimal',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': targetLanguageColumn['@odata.etag'] || targetLanguageColumn.etag || '*'
          },
          body: JSON.stringify(updatePayload)
        });
      
      if (!updateResponse.ok && updateResponse.status !== 204) {
        const errorText = await updateResponse.text();
        throw new Error(`REST API update failed: ${updateResponse.status} ${updateResponse.statusText} - ${errorText}`);
      }

      logger.info('SharePointAlertService', `Successfully updated TargetLanguage choices:`, { 
        action, 
        languageCode, 
        updatedChoices 
      });

    } catch (error) {
      logger.error('SharePointAlertService', 'Failed to update TargetLanguage choices:', error);
      
      // More detailed error information
      if (error.code === 'BadRequest') {
        logger.error('SharePointAlertService', 'BadRequest details:', {
          message: error.message,
          requestId: error['request-id'],
          correlationId: error['correlation-id']
        });
      }
      
      throw new Error(`Failed to update TargetLanguage choices: ${error.message || error}`);
    }
  }
}