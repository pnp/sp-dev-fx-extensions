import { IAlertItem, IUser, ITargetingRule } from "../Alerts/IAlerts";
import { MSGraphClientV3 } from "@microsoft/sp-http";

export class UserTargetingService {
  private static instance: UserTargetingService;
  private graphClient: MSGraphClientV3;
  private currentUser: IUser | null = null;
  private userGroups: string[] = [];
  private isInitialized: boolean = false;

  private constructor(graphClient: MSGraphClientV3) {
    this.graphClient = graphClient;
  }

  public static getInstance(graphClient: MSGraphClientV3): UserTargetingService {
    if (!UserTargetingService.instance) {
      UserTargetingService.instance = new UserTargetingService(graphClient);
    }
    return UserTargetingService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Get current user information
      const userResponse = await this.graphClient.api('/me').select('id,displayName,mail,jobTitle,department').get();
      
      this.currentUser = {
        id: userResponse.id,
        displayName: userResponse.displayName,
        email: userResponse.mail,
        jobTitle: userResponse.jobTitle,
        department: userResponse.department,
        userGroups: []
      };

      // Get user group memberships
      const groupsResponse = await this.graphClient.api('/me/memberOf').select('displayName').get();
      
      if (groupsResponse && groupsResponse.value) {
        this.userGroups = groupsResponse.value.map((group: any) => group.displayName);
        this.currentUser.userGroups = this.userGroups;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing user targeting service:", error);
      // Initialize with minimal information to avoid blocking the application
      this.isInitialized = true;
    }
  }

  public async filterAlertsForCurrentUser(alerts: IAlertItem[]): Promise<IAlertItem[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If no user information is available or initialization failed, show all alerts
    if (!this.currentUser) {
      return alerts;
    }

    return alerts.filter(alert => {
      // If no targeting rules defined, show to everyone
      if (!alert.targetingRules || alert.targetingRules.length === 0) {
        return true;
      }

      // Check each targeting rule
      return alert.targetingRules.some(rule => this.evaluateTargetingRule(rule));
    });
  }

  private evaluateTargetingRule(rule: ITargetingRule): boolean {
    if (!this.currentUser) return false;

    const userProperties = [
      ...(this.userGroups || []),
      this.currentUser.department,
      this.currentUser.jobTitle
    ].filter(Boolean).map(prop => prop?.toLowerCase());

    const targetAudiences = rule.audiences.map(audience => audience.toLowerCase());

    switch (rule.operation) {
      case "anyOf":
        return targetAudiences.some(audience => userProperties.includes(audience));
      
      case "allOf":
        return targetAudiences.every(audience => userProperties.includes(audience));
      
      case "noneOf":
        return !targetAudiences.some(audience => userProperties.includes(audience));
      
      default:
        return false;
    }
  }

  public getCurrentUser(): IUser | null {
    return this.currentUser;
  }

  public getUserDismissedAlerts(): number[] {
    try {
      if (!this.currentUser) return [];

      const key = `DismissedAlerts_${this.currentUser.id}`;
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting dismissed alerts:", error);
      return [];
    }
  }

  public addUserDismissedAlert(alertId: number): void {
    try {
      if (!this.currentUser) return;

      const key = `DismissedAlerts_${this.currentUser.id}`;
      const dismissedAlerts = this.getUserDismissedAlerts();
      
      if (!dismissedAlerts.includes(alertId)) {
        dismissedAlerts.push(alertId);
        sessionStorage.setItem(key, JSON.stringify(dismissedAlerts));
      }
    } catch (error) {
      console.error("Error saving dismissed alert:", error);
    }
  }

  public getUserHiddenAlerts(): number[] {
    try {
      if (!this.currentUser) return [];

      const key = `HiddenAlerts_${this.currentUser.id}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting hidden alerts:", error);
      return [];
    }
  }

  public addUserHiddenAlert(alertId: number): void {
    try {
      if (!this.currentUser) return;

      const key = `HiddenAlerts_${this.currentUser.id}`;
      const hiddenAlerts = this.getUserHiddenAlerts();
      
      if (!hiddenAlerts.includes(alertId)) {
        hiddenAlerts.push(alertId);
        localStorage.setItem(key, JSON.stringify(hiddenAlerts));
      }
    } catch (error) {
      console.error("Error saving hidden alert:", error);
    }
  }
}

export default UserTargetingService;