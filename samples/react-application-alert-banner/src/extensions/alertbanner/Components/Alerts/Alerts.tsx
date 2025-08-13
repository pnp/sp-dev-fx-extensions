import * as React from "react";
import { Spinner, SpinnerSize,MessageBar, MessageBarType } from "@fluentui/react";
import styles from "./Alerts.module.scss";
import { 
  IAlertsProps, 
  IAlertsState, 
  IAlertItem, 
  IAlertType,
  AlertPriority,
  ITargetingRule,
  IPersonField
} from "./IAlerts";
import AlertItem from "../AlertItem/AlertItem";
import NotificationService from "../Services/NotificationService";
import UserTargetingService from "../Services/UserTargetingService";

class Alerts extends React.Component<IAlertsProps, IAlertsState> {
  public static readonly LIST_TITLE = "Alerts";
  
  private notificationService: NotificationService;
  private userTargetingService: UserTargetingService;

  constructor(props: IAlertsProps) {
    super(props);

    this.state = {
      alerts: [],
      alertTypes: {},
      isLoading: true,
      hasError: false,
      errorMessage: undefined,
      userDismissedAlerts: [],
      userHiddenAlerts: []
    };

    // Initialize services
    this.notificationService = NotificationService.getInstance(this.props.graphClient);
    this.userTargetingService = UserTargetingService.getInstance(this.props.graphClient);
  }

  public async componentDidMount(): Promise<void> {
    try {
      // Initialize user targeting service first
      if (this.props.userTargetingEnabled) {
        await this.userTargetingService.initialize();
      }

      // Load alert types from props
      const alertTypes = this._loadAlertTypesFromProps();
      this.setState({ alertTypes });

      // Get user's dismissed and hidden alerts
      if (this.props.userTargetingEnabled) {
        const userDismissedAlerts = this.userTargetingService.getUserDismissedAlerts();
        const userHiddenAlerts = this.userTargetingService.getUserHiddenAlerts();
        this.setState({ userDismissedAlerts, userHiddenAlerts });
      }

      // Fetch alerts from all sites in parallel
      await this._fetchAndProcessAlerts();
    } catch (error) {
      console.error("Error initializing alerts:", error);
      this.setState({
        isLoading: false,
        hasError: true,
        errorMessage: "Failed to load alerts. Please try refreshing the page."
      });
    }
  }

  private async _fetchAndProcessAlerts(): Promise<void> {
    try {
      const allAlerts: IAlertItem[] = [];

      // Fetch alerts from site IDs if provided (in parallel)
      if (this.props.siteIds && this.props.siteIds.length > 0) {
        const fetchPromises = this.props.siteIds.map(siteId => this._fetchAlerts(siteId));
        const sitesAlerts = await Promise.all(fetchPromises);
        
        // Flatten the results
        sitesAlerts.forEach(siteAlerts => {
          allAlerts.push(...siteAlerts);
        });
      }

      // If no alerts were fetched, handle gracefully
      if (allAlerts.length === 0) {
        this.setState({ isLoading: false });
        return;
      }

      // Process alerts
      await this._processAlerts(allAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      this.setState({
        isLoading: false,
        hasError: true,
        errorMessage: "Failed to load alerts. Please try refreshing the page."
      });
    }
  }

  private async _processAlerts(allAlerts: IAlertItem[]): Promise<void> {
    try {
      // Remove duplicates
      const uniqueAlerts = this._removeDuplicateAlerts(allAlerts);

      // Compare with cached alerts
      const cachedAlerts = this._getFromLocalStorage("AllAlerts");
      const alertsAreDifferent = this._areAlertsDifferent(uniqueAlerts, cachedAlerts);

      // Update cache if needed
      if (alertsAreDifferent) {
        this._saveToLocalStorage("AllAlerts", uniqueAlerts);
      }

      // Get alerts to display
      let alertsToShow = alertsAreDifferent ? uniqueAlerts : cachedAlerts || [];

      // Apply user targeting if enabled
      if (this.props.userTargetingEnabled) {
        alertsToShow = await this.userTargetingService.filterAlertsForCurrentUser(alertsToShow);
      }

      // Filter out hidden/dismissed alerts
      alertsToShow = this._filterAlerts(alertsToShow);

      // Sort alerts by priority
      alertsToShow = this._sortAlertsByPriority(alertsToShow);

      // Send notifications for critical/high priority alerts if they're new
      if (this.props.notificationsEnabled && alertsAreDifferent) {
        this._sendNotifications(
          alertsToShow.filter(alert => 
            alert.priority === AlertPriority.Critical || 
            alert.priority === AlertPriority.High
          )
        );
      }

      // Update state
      this.setState({ 
        alerts: alertsToShow,
        isLoading: false
      });
    } catch (error) {
      console.error("Error processing alerts:", error);
      this.setState({
        isLoading: false,
        hasError: true,
        errorMessage: "Failed to process alerts. Please try refreshing the page."
      });
    }
  }

  private _loadAlertTypesFromProps(): { [key: string]: IAlertType } {
    try {
      const alertTypesData: IAlertType[] = JSON.parse(this.props.alertTypesJson);
      const alertTypes: { [key: string]: IAlertType } = {};
      alertTypesData.forEach((type) => {
        alertTypes[type.name] = type;
      });
      return alertTypes;
    } catch (error) {
      console.error("Error parsing alert types JSON:", error);
      return {};
    }
  }

// Update these methods in your existing Alerts.tsx file

private async _fetchAlerts(siteId: string): Promise<IAlertItem[]> {
  const dateTimeNow = new Date().toISOString();
  const filterQuery = `fields/StartDateTime le '${dateTimeNow}' and fields/EndDateTime ge '${dateTimeNow}'`;

  try {
    // Updated to include TargetUsers and TargetGroups fields
    const response = await this.props.graphClient
      .api(`/sites/${siteId}/lists/${Alerts.LIST_TITLE}/items`)
      .header("Prefer", "HonorNonIndexedQueriesWarningMayFailRandomly")
      .expand("fields($select=Title,AlertType,Description,Link,StartDateTime,EndDateTime,Priority,IsPinned,TargetingRules,TargetUsers,TargetGroups,TargetingOperation,NotificationType,RichMedia,QuickActions,CreatedDateTime,CreatedBy)")
      .filter(filterQuery)
      .orderby("fields/StartDateTime desc")
      .get();

    return response.value.map((item: any) => this._mapSharePointItemToAlert(item));
  } catch (error) {
    console.error(`Error fetching alerts from site ${siteId}:`, error);
    return [];
  }
}

// Map SharePoint list item to our alert model
private _mapSharePointItemToAlert(item: any): IAlertItem {
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
      targetingRules = this._createTargetingRulesFromPeopleFields(
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
}

// Helper method to create targeting rules from SharePoint People fields
private _createTargetingRulesFromPeopleFields(
  targetUsers: any,
  targetGroups: any,
  operation: "anyOf" | "allOf" | "noneOf"
): ITargetingRule[] {
  const rule: ITargetingRule = {
    operation: operation
  };

  // Process target users (individual people)
  if (targetUsers) {
    // Handle array of users
    if (Array.isArray(targetUsers)) {
      rule.targetUsers = targetUsers.map(user => this._mapPersonFieldData(user, false));
    } 
    // Handle single user
    else {
      rule.targetUsers = [this._mapPersonFieldData(targetUsers, false)];
    }
  }

  // Process target groups
  if (targetGroups) {
    // Handle array of groups
    if (Array.isArray(targetGroups)) {
      rule.targetGroups = targetGroups.map(group => this._mapPersonFieldData(group, true));
    } 
    // Handle single group
    else {
      rule.targetGroups = [this._mapPersonFieldData(targetGroups, true)];
    }
  }

  // Return as an array of rules (for now just one rule)
  return [rule];
}

// Helper to map SharePoint Person field data to our IPersonField interface
private _mapPersonFieldData(personField: any, isGroup: boolean): IPersonField {
  // Try to handle both classic Person field format and Graph-like format
  
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
}


  private _sortAlertsByPriority(alerts: IAlertItem[]): IAlertItem[] {
    const priorityOrder: { [key in AlertPriority]: number } = {
      [AlertPriority.Critical]: 0,
      [AlertPriority.High]: 1,
      [AlertPriority.Medium]: 2,
      [AlertPriority.Low]: 3
    };

    return [...alerts].sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then sort by priority
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private async _sendNotifications(alerts: IAlertItem[]): Promise<void> {
    if (!this.props.notificationsEnabled || alerts.length === 0) return;

    for (const alert of alerts) {
      await this.notificationService.sendNotification(alert);
    }
  }

  private _removeDuplicateAlerts(alerts: IAlertItem[]): IAlertItem[] {
    const seenIds = new Set<number>();
    return alerts.filter((alert) => {
      if (seenIds.has(alert.Id)) {
        return false;
      } else {
        seenIds.add(alert.Id);
        return true;
      }
    });
  }

  private _areAlertsDifferent(newAlerts: IAlertItem[], cachedAlerts: IAlertItem[] | null): boolean {
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
  }

  private _filterAlerts(alerts: IAlertItem[]): IAlertItem[] {
    // Filter out alerts that the user has dismissed or hidden
    return alerts.filter(alert => 
      !this.state.userDismissedAlerts.includes(alert.Id) && 
      !this.state.userHiddenAlerts.includes(alert.Id)
    );
  }

  private _removeAlert = (id: number): void => {
    this.setState((prevState) => {
      const updatedAlerts = prevState.alerts.filter((alert) => alert.Id !== id);
      const updatedDismissedAlerts = [...prevState.userDismissedAlerts, id];
      
      // Add to user's dismissed alerts
      if (this.props.userTargetingEnabled) {
        this.userTargetingService.addUserDismissedAlert(id);
      }
      
      return { 
        alerts: updatedAlerts,
        userDismissedAlerts: updatedDismissedAlerts
      };
    });
  };

  private _hideAlertForever = (id: number): void => {
    this.setState((prevState) => {
      const updatedAlerts = prevState.alerts.filter((alert) => alert.Id !== id);
      const updatedHiddenAlerts = [...prevState.userHiddenAlerts, id];
      
      // Add to user's hidden alerts
      if (this.props.userTargetingEnabled) {
        this.userTargetingService.addUserHiddenAlert(id);
      }
      
      return { 
        alerts: updatedAlerts,
        userHiddenAlerts: updatedHiddenAlerts
      };
    });
  };

  private _getFromLocalStorage(key: string): IAlertItem[] | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  }

  private _saveToLocalStorage(key: string, data: IAlertItem[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  public render(): React.ReactElement<IAlertsProps> {
    const { alertTypes, isLoading, hasError, errorMessage } = this.state;
    
    // Render loading spinner
    if (isLoading) {
      return (
        <div className={styles.alerts}>
          <div className={styles.loadingContainer}>
            <Spinner size={SpinnerSize.medium} label="Loading alerts..." />
          </div>
        </div>
      );
    }

    // Render error message
    if (hasError) {
      return (
        <div className={styles.alerts}>
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
          >
            {errorMessage || "An error occurred while loading alerts."}
          </MessageBar>
        </div>
      );
    }

    // Check if we have alerts to show
    const hasAlerts = this.state.alerts.length > 0;

    return (
      <div className={styles.alerts}>
        {hasAlerts ? (
          <div className={styles.container}>
            {this.state.alerts.map((alert) => {
              const alertType = alertTypes[alert.AlertType] || defaultAlertType;
              return (
                <AlertItem
                  key={alert.Id}
                  item={alert}
                  remove={this._removeAlert}
                  hideForever={this._hideAlertForever}
                  alertType={alertType}
                  richMediaEnabled={this.props.richMediaEnabled}
                />
              );
            })}
          </div>
        ) : (
          <div className={styles.noAlerts}>
            <MessageBar messageBarType={MessageBarType.info}>
              No alerts to display.
            </MessageBar>
          </div>
        )}
      </div>
    );
  }
}

// Define a default alert type in case an alert type is missing
const defaultAlertType: IAlertType = {
  name: "Default",
  iconName: "Info",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  additionalStyles: "",
  priorityStyles: {
    [AlertPriority.Critical]: "border: 2px solid #E81123;",
    [AlertPriority.High]: "border: 1px solid #EA4300;",
    [AlertPriority.Medium]: "",
    [AlertPriority.Low]: ""
  }
};

export default Alerts;