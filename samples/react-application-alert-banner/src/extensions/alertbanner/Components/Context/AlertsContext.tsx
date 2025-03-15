import * as React from "react";
import { createContext, useReducer, useContext, useCallback } from "react";
import { IAlertItem, IAlertType, AlertPriority, IPersonField, ITargetingRule } from "../Alerts/IAlerts";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import UserTargetingService from "../Services/UserTargetingService";
import NotificationService from "../Services/NotificationService";

// Define the shape of our state
interface AlertsState {
  alerts: IAlertItem[];
  alertTypes: { [key: string]: IAlertType };
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  userDismissedAlerts: number[];
  userHiddenAlerts: number[];
}

// Define the actions we can perform
type AlertsAction =
  | { type: 'SET_ALERTS'; payload: IAlertItem[] }
  | { type: 'SET_ALERT_TYPES'; payload: { [key: string]: IAlertType } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { hasError: boolean; message?: string } }
  | { type: 'DISMISS_ALERT'; payload: number }
  | { type: 'HIDE_ALERT_FOREVER'; payload: number }
  | { type: 'SET_DISMISSED_ALERTS'; payload: number[] }
  | { type: 'SET_HIDDEN_ALERTS'; payload: number[] };

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
        alerts: state.alerts.filter(alert => alert.Id !== action.payload),
        userDismissedAlerts: [...state.userDismissedAlerts, action.payload]
      };
    
    case 'HIDE_ALERT_FOREVER':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.Id !== action.payload),
        userHiddenAlerts: [...state.userHiddenAlerts, action.payload]
      };
    
    case 'SET_DISMISSED_ALERTS':
      return { ...state, userDismissedAlerts: action.payload };
    
    case 'SET_HIDDEN_ALERTS':
      return { ...state, userHiddenAlerts: action.payload };
    
    default:
      return state;
  }
};

// Create the context
interface AlertsContextProps {
  state: AlertsState;
  dispatch: React.Dispatch<AlertsAction>;
  removeAlert: (id: number) => void;
  hideAlertForever: (id: number) => void;
  initializeAlerts: (options: AlertsContextOptions) => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextProps | undefined>(undefined);

// Options for initializing the context
export interface AlertsContextOptions {
  graphClient: MSGraphClientV3;
  siteIds: string[];
  alertTypesJson: string;
  userTargetingEnabled?: boolean;
  notificationsEnabled?: boolean;
  richMediaEnabled?: boolean;
}

// Simple helper for localStorage
const getFromLocalStorage = <T,>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
};

const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

// Provider component
export const AlertsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(alertsReducer, initialState);
  
  // Services
  let graphClient: MSGraphClientV3;
  let userTargetingService: UserTargetingService;
  let notificationService: NotificationService;
  
  // Options
  let options: AlertsContextOptions;
  
  // Load alert types from JSON
  const loadAlertTypes = useCallback((alertTypesJson: string) => {
    try {
      const alertTypesData: IAlertType[] = JSON.parse(alertTypesJson);
      const alertTypesMap: { [key: string]: IAlertType } = {};
      alertTypesData.forEach((type) => {
        alertTypesMap[type.name] = type;
      });
      
      dispatch({ type: 'SET_ALERT_TYPES', payload: alertTypesMap });
    } catch (error) {
      console.error("Error parsing alert types JSON:", error);
      dispatch({ type: 'SET_ALERT_TYPES', payload: {} });
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

    // Parse JSON fields
    let targetingRules = undefined;
    let richMedia = undefined;
    let quickActions = undefined;

    try {
      // First try to parse the JSON TargetingRules field (legacy format)
      if (item.fields.TargetingRules) {
        targetingRules = JSON.parse(item.fields.TargetingRules);
      }
      // If either People field is present, create targeting rules using them
      else if (item.fields.TargetUsers || item.fields.TargetGroups) {
        targetingRules = createTargetingRulesFromPeopleFields(
          item.fields.TargetUsers,
          item.fields.TargetGroups,
          item.fields.TargetingOperation || "anyOf" // Default to anyOf if not specified
        );
      }

      if (item.fields.RichMedia) {
        richMedia = JSON.parse(item.fields.RichMedia);
      }
      if (item.fields.QuickActions) {
        quickActions = JSON.parse(item.fields.QuickActions);
      }
    } catch (error) {
      console.warn("Error parsing JSON fields for alert:", item.id, error);
    }

    return {
      Id: parseInt(item.id, 10),
      title: item.fields.Title || "",
      description: item.fields.Description || "",
      AlertType: item.fields.AlertType || "Default",
      priority: priority,
      isPinned: item.fields.IsPinned || false,
      targetingRules: targetingRules,
      notificationType: item.fields.NotificationType || "none",
      richMedia: richMedia,
      link: item.fields.Link ? {
        Url: item.fields.Link.Url || "",
        Description: item.fields.Link.Description || "Learn More"
      } : undefined,
      quickActions: quickActions,
      createdDate: item.fields.CreatedDateTime || "",
      createdBy: createdBy
    };
  }, []);

  // Helper to create targeting rules from People fields
  const createTargetingRulesFromPeopleFields = (
    targetUsers: any,
    targetGroups: any,
    operation: "anyOf" | "allOf" | "noneOf"
  ): ITargetingRule[] => {
    const rule: ITargetingRule = {
      operation: operation
    };

    // Process target users (individual people)
    if (targetUsers) {
      // Handle array of users
      if (Array.isArray(targetUsers)) {
        rule.targetUsers = targetUsers.map(user => mapPersonFieldData(user, false));
      } 
      // Handle single user
      else {
        rule.targetUsers = [mapPersonFieldData(targetUsers, false)];
      }
    }

    // Process target groups
    if (targetGroups) {
      // Handle array of groups
      if (Array.isArray(targetGroups)) {
        rule.targetGroups = targetGroups.map(group => mapPersonFieldData(group, true));
      } 
      // Handle single group
      else {
        rule.targetGroups = [mapPersonFieldData(targetGroups, true)];
      }
    }

    // Return as an array of rules (for now just one rule)
    return [rule];
  };

  // Helper to map Person field data
  const mapPersonFieldData = (personField: any, isGroup: boolean): IPersonField => {
    // Try to handle both classic Person field format and Graph-like format
    
    // Format 1: SharePoint's classic Person field format
    if (personField.LookupId && personField.LookupValue) {
      return {
        id: personField.LookupId,
        displayName: personField.LookupValue,
        isGroup: isGroup
      };
    }
    
    // Format 2: New format from Graph or REST API
    if (personField.ID || personField.id) {
      return {
        id: personField.ID || personField.id,
        displayName: personField.Title || personField.displayName,
        email: personField.EMail || personField.email,
        loginName: personField.Name || personField.loginName,
        isGroup: isGroup
      };
    }
    
    // Format 3: Simple JSON object
    return {
      id: personField.id || "",
      displayName: personField.displayName || personField.title || "",
      email: personField.email || personField.mail || "",
      loginName: personField.loginName || personField.userPrincipalName || "",
      isGroup: isGroup
    };
  };
  
  // Fetch alerts from a site
  const fetchAlerts = useCallback(async (siteId: string): Promise<IAlertItem[]> => {
    const dateTimeNow = new Date().toISOString();
    const filterQuery = `fields/StartDateTime le '${dateTimeNow}' and fields/EndDateTime ge '${dateTimeNow}'`;

    try {
      // Include TargetUsers and TargetGroups fields in the query
      const response = await graphClient
        .api(`/sites/${siteId}/lists/Alerts/items`)
        .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
        .expand("fields($select=Title,AlertType,Description,Link,StartDateTime,EndDateTime,Priority,IsPinned,TargetingRules,TargetUsers,TargetGroups,TargetingOperation,NotificationType,RichMedia,QuickActions,CreatedDateTime,CreatedBy)")
        .filter(filterQuery)
        .orderby("fields/StartDateTime desc")
        .get();

      return response.value.map(mapSharePointItemToAlert);
    } catch (error) {
      console.error(`Error fetching alerts from site ${siteId}:`, error);
      return [];
    }
  }, []);
  
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
    const seenIds = new Set<number>();
    return alertsToFilter.filter((alert) => {
      if (seenIds.has(alert.Id)) {
        return false;
      } else {
        seenIds.add(alert.Id);
        return true;
      }
    });
  }, []);
  
  // Check if alerts have changed
  const areAlertsDifferent = useCallback((newAlerts: IAlertItem[], cachedAlerts: IAlertItem[] | null): boolean => {
    if (!cachedAlerts) return true;
    if (newAlerts.length !== cachedAlerts.length) return true;

    // Create maps for faster comparison
    const newAlertsMap = new Map(newAlerts.map(alert => [alert.Id, alert]));
    const cachedAlertsMap = new Map(cachedAlerts.map(alert => [alert.Id, alert]));

    // Check if all IDs match
    if (newAlerts.some(alert => !cachedAlertsMap.has(alert.Id))) return true;
    
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
        JSON.stringify(newAlert.link) !== JSON.stringify(cachedAlert.link)
      ) {
        return true;
      }
    }

    return false;
  }, []);

  // Filter alerts based on user preferences
  const filterAlerts = useCallback((alertsToFilter: IAlertItem[]): IAlertItem[] => {
    return alertsToFilter.filter(alert => 
      !state.userDismissedAlerts.includes(alert.Id) && 
      !state.userHiddenAlerts.includes(alert.Id)
    );
  }, [state.userDismissedAlerts, state.userHiddenAlerts]);
  
  // Send notifications
  const sendNotifications = useCallback(async (alertsToNotify: IAlertItem[]): Promise<void> => {
    if (!options?.notificationsEnabled || alertsToNotify.length === 0 || !notificationService) return;

    for (const alert of alertsToNotify) {
      await notificationService.sendNotification(alert);
    }
  }, []);
  
  // Initialize alerts
  const initializeAlerts = useCallback(async (initOptions: AlertsContextOptions): Promise<void> => {
    try {
      options = initOptions;
      graphClient = options.graphClient;
      
      // Initialize services
      userTargetingService = UserTargetingService.getInstance(graphClient);
      notificationService = NotificationService.getInstance(graphClient);
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Initialize user targeting service first
      if (options.userTargetingEnabled) {
        await userTargetingService.initialize();
      }
      
      // Load alert types from JSON
      loadAlertTypes(options.alertTypesJson);
      
      // Get user's dismissed and hidden alerts
      if (options.userTargetingEnabled) {
        const dismissedAlerts = userTargetingService.getUserDismissedAlerts();
        const hiddenAlerts = userTargetingService.getUserHiddenAlerts();
        
        dispatch({ type: 'SET_DISMISSED_ALERTS', payload: dismissedAlerts });
        dispatch({ type: 'SET_HIDDEN_ALERTS', payload: hiddenAlerts });
      }
      
      // Fetch and process alerts
      await refreshAlerts();
      
    } catch (error) {
      console.error("Error initializing alerts:", error);
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
    if (!options || !graphClient) return;
    
    try {
      const allAlerts: IAlertItem[] = [];
      
      // Process only 3 sites at a time to avoid performance issues
      const batchSize = 3;
      const siteIds = options.siteIds || [];
      
      for (let i = 0; i < siteIds.length; i += batchSize) {
        const batch = siteIds.slice(i, i + batchSize);
        const batchPromises = batch.map(siteId => fetchAlerts(siteId));
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(siteAlerts => {
          allAlerts.push(...siteAlerts);
        });
      }
      
      // If no alerts were fetched, handle gracefully
      if (allAlerts.length === 0) {
        dispatch({ type: 'SET_ALERTS', payload: [] });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      // Process alerts
      const uniqueAlerts = removeDuplicateAlerts(allAlerts);
      
      // Compare with cached alerts
      const cachedAlerts = getFromLocalStorage<IAlertItem[]>("AllAlerts");
      const alertsAreDifferent = areAlertsDifferent(uniqueAlerts, cachedAlerts);
      
      // Update cache if needed
      if (alertsAreDifferent) {
        saveToLocalStorage("AllAlerts", uniqueAlerts);
      }
      
      // Get alerts to display
      let alertsToShow = alertsAreDifferent ? uniqueAlerts : cachedAlerts || [];
      
      // Apply user targeting if enabled
      if (options.userTargetingEnabled && userTargetingService) {
        alertsToShow = await userTargetingService.filterAlertsForCurrentUser(alertsToShow);
      }
      
      // Filter out hidden/dismissed alerts
      alertsToShow = filterAlerts(alertsToShow);
      
      // Limit the number of alerts to prevent performance issues
      if (alertsToShow.length > 20) {
        console.warn(`Limiting alerts to 20 for performance (found ${alertsToShow.length})`);
        alertsToShow = alertsToShow.slice(0, 20);
      }
      
      // Sort alerts by priority
      alertsToShow = sortAlertsByPriority(alertsToShow);
      
      // Send notifications for critical/high priority alerts if they're new
      if (options.notificationsEnabled && alertsAreDifferent) {
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
      console.error("Error refreshing alerts:", error);
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
  const removeAlert = useCallback((id: number): void => {
    dispatch({ type: 'DISMISS_ALERT', payload: id });
    
    // Add to user's dismissed alerts if targeting is enabled
    if (options?.userTargetingEnabled && userTargetingService) {
      userTargetingService.addUserDismissedAlert(id);
    }
  }, []);
  
  // Handle hiding an alert forever
  const hideAlertForever = useCallback((id: number): void => {
    dispatch({ type: 'HIDE_ALERT_FOREVER', payload: id });
    
    // Add to user's hidden alerts if targeting is enabled
    if (options?.userTargetingEnabled && userTargetingService) {
      userTargetingService.addUserHiddenAlert(id);
    }
  }, []);
  
  // The value we'll provide to consumers
  const value = { 
    state, 
    dispatch, 
    removeAlert, 
    hideAlertForever,
    initializeAlerts,
    refreshAlerts
  };
  
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