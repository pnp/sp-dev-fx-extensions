import * as React from "react";
import { createContext, useReducer, useContext, useCallback } from "react";
import { IAlertType, AlertPriority, IPersonField, ITargetingRule, ContentType, TargetLanguage } from "../Alerts/IAlerts";
import { IAlertItem } from "../Services/SharePointAlertService";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import UserTargetingService from "../Services/UserTargetingService";
import { NotificationService } from "../Services/NotificationService";
import StorageService from "../Services/StorageService";
import { LanguageAwarenessService } from "../Services/LanguageAwarenessService";
import { logger } from "../Services/LoggerService";

// Define the shape of our state
interface AlertsState {
  alerts: IAlertItem[];
  alertTypes: { [key: string]: IAlertType };
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  userDismissedAlerts: string[];
  userHiddenAlerts: string[];
}

// Define the actions we can perform
type AlertsAction =
  | { type: 'SET_ALERTS'; payload: IAlertItem[] }
  | { type: 'SET_ALERT_TYPES'; payload: { [key: string]: IAlertType } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { hasError: boolean; message?: string } }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'HIDE_ALERT_FOREVER'; payload: string }
  | { type: 'SET_DISMISSED_ALERTS'; payload: string[] }
  | { type: 'SET_HIDDEN_ALERTS'; payload: string[] }
  | { type: 'BATCH_UPDATE'; payload: Partial<AlertsState> };

// Initial state
const initialState: AlertsState = {
  alerts: [],
  alertTypes: {},
  isLoading: true,
  hasError: false,
  errorMessage: undefined,
  userDismissedAlerts: [],
  userHiddenAlerts: []
};

// Create the reducer
const alertsReducer = (state: AlertsState, action: AlertsAction): AlertsState => {
  switch (action.type) {
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };

    case 'SET_ALERT_TYPES':
      return { ...state, alertTypes: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return {
        ...state,
        hasError: action.payload.hasError,
        errorMessage: action.payload.message
      };

    case 'DISMISS_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload),
        userDismissedAlerts: [...state.userDismissedAlerts, action.payload]
      };

    case 'HIDE_ALERT_FOREVER':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload),
        userHiddenAlerts: [...state.userHiddenAlerts, action.payload]
      };

    case 'SET_DISMISSED_ALERTS':
      return { ...state, userDismissedAlerts: action.payload };

    case 'SET_HIDDEN_ALERTS':
      return { ...state, userHiddenAlerts: action.payload };

    case 'BATCH_UPDATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// Create the context
interface AlertsContextProps {
  state: AlertsState;
  dispatch: React.Dispatch<AlertsAction>;
  removeAlert: (id: string) => void;
  hideAlertForever: (id: string) => void;
  initializeAlerts: (options: AlertsContextOptions) => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextProps | undefined>(undefined);

// Options for initializing the context
export interface AlertsContextOptions {
  graphClient: MSGraphClientV3;
  context: ApplicationCustomizerContext;
  siteIds: string[];
  alertTypesJson: string;
  userTargetingEnabled?: boolean;
  notificationsEnabled?: boolean;
}

// Using StorageService instead of direct localStorage access

// Provider component
export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(alertsReducer, initialState);
  
  // Storage service instance
  const storageService = React.useMemo(() => StorageService.getInstance(), []);

  // Services - Use refs to prevent recreating on every render
  const servicesRef = React.useRef<{
    graphClient?: MSGraphClientV3;
    userTargetingService?: UserTargetingService;
    notificationService?: NotificationService;
    languageAwarenessService?: LanguageAwarenessService;
    options?: AlertsContextOptions;
  }>({});

  // Load alert types from JSON
  const loadAlertTypes = useCallback((alertTypesJson: string) => {
    const endPerformanceTracking = logger.startPerformanceTracking('loadAlertTypes');
    
    try {
      const alertTypesData: IAlertType[] = JSON.parse(alertTypesJson);
      const alertTypesMap: { [key: string]: IAlertType } = {};
      
      alertTypesData.forEach((type) => {
        alertTypesMap[type.name] = type;
      });

      dispatch({ type: 'SET_ALERT_TYPES', payload: alertTypesMap });
      logger.info('AlertsContext', `Loaded ${alertTypesData.length} alert types`);
      
    } catch (error) {
      logger.error("AlertsContext", "Error parsing alert types JSON", error, { alertTypesJson });
      dispatch({ type: 'SET_ALERT_TYPES', payload: {} });
    } finally {
      endPerformanceTracking();
    }
  }, []);

  // Map SharePoint item to alert
  const mapSharePointItemToAlert = useCallback((item: any): IAlertItem => {
    const createdBy = item.fields.CreatedBy ?
      item.fields.CreatedBy.LookupValue || "Unknown" :
      "Unknown";

    let priority = AlertPriority.Medium; // Default
    if (item.fields.Priority) {
      try {
        priority = AlertPriority[item.fields.Priority as keyof typeof AlertPriority];
      } catch {
        priority = AlertPriority.Medium;
      }
    }

    // Get target users directly from SharePoint People field
    let targetUsers: IPersonField[] = [];
    try {
      if (item.fields.TargetUsers) {
        if (Array.isArray(item.fields.TargetUsers)) {
          targetUsers = item.fields.TargetUsers.map((user: any) => mapPersonFieldData(user, user.isGroup || false));
        } else {
          // Handle single user case
          targetUsers = [mapPersonFieldData(item.fields.TargetUsers, item.fields.TargetUsers.isGroup || false)];
        }
      }
    } catch (error) {
      logger.warn('AlertsContext', `Error processing target users for alert: ${item.id}`, error);
    }

    // Determine content type - check multiple possible fields
    let contentType = ContentType.Alert; // Default to alert
    if (item.fields.ItemType) {
      if (item.fields.ItemType.toLowerCase() === 'template') {
        contentType = ContentType.Template;
      } else if (item.fields.ItemType.toLowerCase() === 'alert') {
        contentType = ContentType.Alert;
      }
    } else if (item.fields.ContentType) {
      if (item.fields.ContentType.toLowerCase() === 'template') {
        contentType = ContentType.Template;
      }
    }

    return {
      id: item.id,
      title: item.fields.Title || "",
      description: item.fields.Description || "",
      AlertType: item.fields.AlertType || "Default",
      priority: priority,
      isPinned: item.fields.IsPinned || false,
      targetUsers: targetUsers,
      notificationType: item.fields.NotificationType || "none",
      linkUrl: item.fields.LinkUrl || "",
      linkDescription: item.fields.LinkDescription || "Learn More",
      targetSites: item.fields.TargetSites ? item.fields.TargetSites.split(',') : [],
      status: item.fields.Status || 'Active',
      createdDate: item.fields.CreatedDateTime || "",
      createdBy: createdBy,
      contentType: contentType,
      targetLanguage: (item.fields.TargetLanguage as TargetLanguage) || TargetLanguage.All,
      languageGroup: item.fields.LanguageGroup || undefined
    };
  }, []);


  // Helper to map Person field data
  const mapPersonFieldData = (personField: any, isGroup: boolean): IPersonField => {
    if (personField.LookupId && personField.LookupValue) {
      return {
        id: personField.LookupId,
        displayName: personField.LookupValue,
        isGroup: isGroup
      };
    }

    if (personField.ID || personField.id) {
      return {
        id: personField.ID || personField.id,
        displayName: personField.Title || personField.displayName,
        email: personField.EMail || personField.email,
        loginName: personField.Name || personField.loginName,
        isGroup: isGroup
      };
    }
    return {
      id: personField.id || "",
      displayName: personField.displayName || personField.title || "",
      email: personField.email || personField.mail || "",
      loginName: personField.loginName || personField.userPrincipalName || "",
      isGroup: isGroup
    };
  };

  const alertCacheRef = React.useRef<Map<string, { alerts: IAlertItem[]; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; 

  const fetchAlerts = useCallback(async (siteId: string): Promise<IAlertItem[]> => {
    // Check cache first
    const cached = alertCacheRef.current.get(siteId);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      logger.debug('AlertsContext', `Using cached alerts for site ${siteId}`, { 
        alertCount: cached.alerts.length,
        cacheAge: now - cached.timestamp 
      });
      return cached.alerts;
    }

    const dateTimeNow = new Date().toISOString();

    try {
      // First, try to get list with custom fields
      let response;
      try {
        const filterQuery = `(fields/ScheduledStart le '${dateTimeNow}' or fields/ScheduledStart eq null) and (fields/ScheduledEnd ge '${dateTimeNow}' or fields/ScheduledEnd eq null) and (fields/ItemType ne 'template')`;
        if (!servicesRef.current.graphClient) throw new Error('GraphClient not initialized');
        response = await servicesRef.current.graphClient
          .api(`/sites/${siteId}/lists/Alerts/items`)
          .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
          .expand("fields($select=Title,AlertType,Description,ScheduledStart,ScheduledEnd,Priority,IsPinned,NotificationType,LinkUrl,LinkDescription,TargetSites,Status,ItemType,TargetLanguage,LanguageGroup,Metadata)")
          .filter(filterQuery)
          .orderby("fields/ScheduledStart desc")
          .top(25) // Reduced from 50 to 25 for better performance
          .get();
      } catch (customFieldError) {
        logger.warn('AlertsContext', 'Custom fields not found, falling back to basic fields', customFieldError);
        // Fall back to basic SharePoint fields only - no filtering since we don't have ScheduledStart field
        if (!servicesRef.current.graphClient) throw new Error('GraphClient not initialized');
        response = await servicesRef.current.graphClient
          .api(`/sites/${siteId}/lists/Alerts/items`)
          .expand("fields($select=Title,Description,Created,Author)")
          .orderby("fields/Created desc")
          .top(25) // Reduced from 50 to 25 for better performance
          .get();
      }

      let alerts = response.value.map(mapSharePointItemToAlert);
      
      // Log raw data for debugging
      logger.debug('AlertsContext', `Raw SharePoint items fetched`, { 
        count: response.value.length,
        items: response.value.map((item: any) => ({
          id: item.id,
          title: item.fields.Title,
          itemType: item.fields.ItemType,
          contentType: item.fields.ContentType
        }))
      });
      
      // Client-side filter to ensure templates are never shown (additional safety measure)
      const alertsBeforeFilter = alerts.length;
      alerts = alerts.filter((alert: IAlertItem) => {
        const isTemplate = alert.contentType === ContentType.Template || 
                          alert.AlertType?.toLowerCase().includes('template') ||
                          alert.title?.toLowerCase().includes('template');
        return !isTemplate;
      });
      
      logger.debug('AlertsContext', `Filtered out templates`, { 
        beforeFilter: alertsBeforeFilter,
        afterFilter: alerts.length,
        filtered: alertsBeforeFilter - alerts.length
      });
      
      // Cache the results
      alertCacheRef.current.set(siteId, { alerts, timestamp: now });
      logger.info('AlertsContext', `Fetched and cached alerts for site ${siteId}`, { 
        alertCount: alerts.length,
        siteId
      });
      
      return alerts;
    } catch (error) {
      logger.error('AlertsContext', `Error fetching alerts from site ${siteId}`, error, { siteId });
      return [];
    }
  }, [mapSharePointItemToAlert]);

  // Sort alerts by priority
  const sortAlertsByPriority = useCallback((alertsToSort: IAlertItem[]): IAlertItem[] => {
    const priorityOrder: { [key in AlertPriority]: number } = {
      [AlertPriority.Critical]: 0,
      [AlertPriority.High]: 1,
      [AlertPriority.Medium]: 2,
      [AlertPriority.Low]: 3
    };

    return [...alertsToSort].sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then sort by priority
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, []);

  // Remove duplicates
  const removeDuplicateAlerts = useCallback((alertsToFilter: IAlertItem[]): IAlertItem[] => {
    const seenIds = new Set<string>();
    const duplicates: IAlertItem[] = [];
    
    const unique = alertsToFilter.filter((alert) => {
      if (seenIds.has(alert.id)) {
        duplicates.push(alert);
        return false;
      } else {
        seenIds.add(alert.id);
        return true;
      }
    });

    if (duplicates.length > 0) {
      logger.debug('AlertsContext', `Removed ${duplicates.length} duplicate alerts`, { duplicates: duplicates.map(a => `${a.id} (${a.title})`) });
    }

    return unique;
  }, []);

  // Check if alerts have changed
  const areAlertsDifferent = useCallback((newAlerts: IAlertItem[], cachedAlerts: IAlertItem[] | null): boolean => {
    if (!cachedAlerts) return true;
    if (newAlerts.length !== cachedAlerts.length) return true;

    // Create maps for faster comparison
    const newAlertsMap = new Map(newAlerts.map(alert => [alert.id, alert]));
    const cachedAlertsMap = new Map(cachedAlerts.map(alert => [alert.id, alert]));

    // Check if all IDs match
    if (newAlerts.some(alert => !cachedAlertsMap.has(alert.id))) return true;

    // Check if any alert properties have changed
    for (const [id, newAlert] of newAlertsMap.entries()) {
      const cachedAlert = cachedAlertsMap.get(id);
      if (!cachedAlert) return true;

      if (
        newAlert.title !== cachedAlert.title ||
        newAlert.description !== cachedAlert.description ||
        newAlert.AlertType !== cachedAlert.AlertType ||
        newAlert.priority !== cachedAlert.priority ||
        newAlert.isPinned !== cachedAlert.isPinned ||
        newAlert.linkUrl !== cachedAlert.linkUrl || newAlert.linkDescription !== cachedAlert.linkDescription
      ) {
        return true;
      }
    }

    return false;
  }, []);

  // Filter alerts based on user preferences - optimized with Sets for faster lookups
  const filterAlerts = useCallback((alertsToFilter: IAlertItem[]): IAlertItem[] => {
    if (state.userDismissedAlerts.length === 0 && state.userHiddenAlerts.length === 0) {
      return alertsToFilter; // No filtering needed
    }
    
    const dismissedSet = new Set(state.userDismissedAlerts);
    const hiddenSet = new Set(state.userHiddenAlerts);
    
    return alertsToFilter.filter(alert =>
      !dismissedSet.has(alert.id) && !hiddenSet.has(alert.id)
    );
  }, [state.userDismissedAlerts, state.userHiddenAlerts]);

  // Apply language-aware filtering to show appropriate language variants
  const applyLanguageAwareFiltering = useCallback(async (alertsToFilter: IAlertItem[]): Promise<IAlertItem[]> => {
    if (!servicesRef.current.languageAwarenessService) {
      return alertsToFilter; // No language service, return as-is
    }

    try {
      const userLanguage = await servicesRef.current.languageAwarenessService.getUserPreferredLanguage();
      const filteredAlerts = servicesRef.current.languageAwarenessService.filterAlertsForUser(alertsToFilter, userLanguage);
      
      logger.info('AlertsContext', `Applied language filtering: ${userLanguage}`, {
        originalCount: alertsToFilter.length,
        filteredCount: filteredAlerts.length,
        userLanguage
      });
      
      return filteredAlerts;
    } catch (error) {
      logger.warn('AlertsContext', 'Error applying language filtering, using all alerts', error);
      return alertsToFilter;
    }
  }, []);

  // Send notifications
  const sendNotifications = useCallback(async (alertsToNotify: IAlertItem[]): Promise<void> => {
    if (!servicesRef.current.options?.notificationsEnabled || alertsToNotify.length === 0 || !servicesRef.current.notificationService) return;

    for (const alert of alertsToNotify) {
      await servicesRef.current.notificationService.showInfo(`New alert: ${alert.title}`, 'Alert Notification');
    }
  }, []);

  // Initialize alerts
  const initializeAlerts = useCallback(async (initOptions: AlertsContextOptions): Promise<void> => {
    try {
      servicesRef.current.options = initOptions;
      servicesRef.current.graphClient = initOptions.graphClient;

      // Initialize services
      servicesRef.current.userTargetingService = UserTargetingService.getInstance(servicesRef.current.graphClient);
      servicesRef.current.notificationService = NotificationService.getInstance(initOptions.context);
      servicesRef.current.languageAwarenessService = new LanguageAwarenessService(servicesRef.current.graphClient, initOptions.context);

      dispatch({ type: 'SET_LOADING', payload: true });

      // Initialize user targeting service first
      if (servicesRef.current.options.userTargetingEnabled) {
        await servicesRef.current.userTargetingService.initialize();
      }

      // Load alert types from JSON
      loadAlertTypes(servicesRef.current.options.alertTypesJson);

      // Get user's dismissed and hidden alerts - batch update to reduce re-renders
      if (servicesRef.current.options.userTargetingEnabled) {
        const dismissedAlerts = servicesRef.current.userTargetingService.getUserDismissedAlerts();
        const hiddenAlerts = servicesRef.current.userTargetingService.getUserHiddenAlerts();

        dispatch({ 
          type: 'BATCH_UPDATE', 
          payload: { 
            userDismissedAlerts: dismissedAlerts,
            userHiddenAlerts: hiddenAlerts
          } 
        });
      }

      // Fetch and process alerts
      await refreshAlerts();

    } catch (error) {
      logger.error("AlertsContext", "Error initializing alerts", error, {
        options: servicesRef.current.options
      });
      dispatch({
        type: 'SET_ERROR',
        payload: {
          hasError: true,
          message: "Failed to load alerts. Please try refreshing the page."
        }
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadAlertTypes]);

  // Refresh alerts
  const refreshAlerts = useCallback(async (): Promise<void> => {
    if (!servicesRef.current.options || !servicesRef.current.graphClient) return;

    try {
      const allAlerts: IAlertItem[] = [];

      // Process only 3 sites at a time to avoid performance issues
      const batchSize = 3;
      const siteIds = servicesRef.current.options.siteIds || [];

      // Remove duplicate site IDs
      const uniqueSiteIds = [...new Set(siteIds)];
      logger.info('AlertsContext', 'Processing sites for alert refresh', { 
        totalSiteIds: siteIds.length, 
        uniqueSiteIds: uniqueSiteIds.length,
        sites: uniqueSiteIds
      });

      for (let i = 0; i < uniqueSiteIds.length; i += batchSize) {
        const batch = uniqueSiteIds.slice(i, i + batchSize);
        const batchPromises = batch.map(siteId => fetchAlerts(siteId));
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            logger.debug('AlertsContext', `Site returned alerts successfully`, {
              siteId: batch[index],
              alertCount: result.value.length
            });
            allAlerts.push(...result.value);
          } else {
            logger.warn('AlertsContext', `Site failed to return alerts`, {
              siteId: batch[index],
              error: result.reason
            });
          }
        });
      }

      // If no alerts were fetched, handle gracefully
      if (allAlerts.length === 0) {
        dispatch({ type: 'SET_ALERTS', payload: [] });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Debug logging for duplicates
      logger.debug('AlertsContext', `Total alerts fetched: ${allAlerts.length}`);
      if (allAlerts.length > 0) {
        const alertIds = allAlerts.map(a => `${a.id} (${a.title})`);
        const duplicateIds = alertIds.filter((id, index) => alertIds.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
          logger.warn('AlertsContext', 'Duplicate alerts detected', { duplicateIds });
        }
      }

      // Process alerts
      const uniqueAlerts = removeDuplicateAlerts(allAlerts);
      logger.debug('AlertsContext', `Unique alerts after deduplication: ${uniqueAlerts.length}`);

      // Compare with cached alerts
      const cachedAlerts = storageService.getFromLocalStorage<IAlertItem[]>('AllAlerts');
      const alertsAreDifferent = areAlertsDifferent(uniqueAlerts, cachedAlerts);

      // Update cache if needed
      if (alertsAreDifferent) {
        storageService.saveToLocalStorage('AllAlerts', uniqueAlerts);
      }

      // Get alerts to display
      let alertsToShow = alertsAreDifferent ? uniqueAlerts : cachedAlerts || [];

      // Apply user targeting if enabled
      if (servicesRef.current.options.userTargetingEnabled && servicesRef.current.userTargetingService) {
        alertsToShow = await servicesRef.current.userTargetingService.filterAlertsForCurrentUser(alertsToShow);
      }

      // Apply language-aware filtering to show appropriate language variants
      alertsToShow = await applyLanguageAwareFiltering(alertsToShow);

      // Filter out hidden/dismissed alerts
      alertsToShow = filterAlerts(alertsToShow);

      // Limit the number of alerts to prevent performance issues
      if (alertsToShow.length > 20) {
        logger.warn('AlertsContext', `Limiting alerts to 20 for performance (found ${alertsToShow.length})`);
        alertsToShow = alertsToShow.slice(0, 20);
      }

      // Sort alerts by priority
      alertsToShow = sortAlertsByPriority(alertsToShow);

      // Send notifications for critical/high priority alerts if they're new
      if (servicesRef.current.options.notificationsEnabled && alertsAreDifferent) {
        const highPriorityAlerts = alertsToShow.filter(alert =>
          alert.priority === AlertPriority.Critical ||
          alert.priority === AlertPriority.High
        );

        // Only send notifications for the first 5 high priority alerts to avoid spamming
        if (highPriorityAlerts.length > 0) {
          sendNotifications(highPriorityAlerts.slice(0, 5));
        }
      }

      // Update state
      dispatch({ type: 'SET_ALERTS', payload: alertsToShow });
      dispatch({ type: 'SET_LOADING', payload: false });

    } catch (error) {
      logger.error('AlertsContext', 'Error refreshing alerts', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          hasError: true,
          message: "Failed to refresh alerts. Please try again."
        }
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [
    filterAlerts,
    removeDuplicateAlerts,
    sortAlertsByPriority,
    areAlertsDifferent,
    sendNotifications,
    fetchAlerts
  ]);

  // Handle removing an alert
  const removeAlert = useCallback((id: string): void => {
    dispatch({ type: 'DISMISS_ALERT', payload: id });

    // Add to user's dismissed alerts if targeting is enabled
    if (servicesRef.current.options?.userTargetingEnabled && servicesRef.current.userTargetingService) {
      servicesRef.current.userTargetingService.addUserDismissedAlert(id);
    }
  }, []);

  // Handle hiding an alert forever
  const hideAlertForever = useCallback((id: string): void => {
    dispatch({ type: 'HIDE_ALERT_FOREVER', payload: id });

    // Add to user's hidden alerts if targeting is enabled
    if (servicesRef.current.options?.userTargetingEnabled && servicesRef.current.userTargetingService) {
      servicesRef.current.userTargetingService.addUserHiddenAlert(id);
    }
  }, []);

  // The value we'll provide to consumers
  const value = React.useMemo(() => ({
    state,
    dispatch,
    removeAlert,
    hideAlertForever,
    initializeAlerts,
    refreshAlerts
  }), [state, removeAlert, hideAlertForever, initializeAlerts, refreshAlerts]);

  // Add cleanup function to clear cache and services
  const cleanup = useCallback(() => {
    logger.info('AlertsContext', 'Cleaning up AlertsContext resources');
    
    // Clear alert cache
    alertCacheRef.current.clear();
    
    // Clear services references
    servicesRef.current = {};
    
    // Dispatch final cleanup state
    dispatch({ type: 'SET_ALERTS', payload: [] });
    dispatch({ type: 'SET_LOADING', payload: false });
    dispatch({ type: 'SET_ERROR', payload: { hasError: false } });
  }, []);

  // Memory cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
};

// Custom hook for using the context
export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};