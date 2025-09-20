import { IUser, ITargetingRule, IPersonField } from "../Alerts/IAlerts";
import { IAlertItem } from "./SharePointAlertService";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import StorageService from "./StorageService";
import { logger } from './LoggerService';

export class UserTargetingService {
  private static instance: UserTargetingService;
  private graphClient: MSGraphClientV3;
  private currentUser: IUser | null = null;
  private userGroups: string[] = [];
  private userGroupIds: string[] = [];
  private isInitialized: boolean = false;
  private storageService: StorageService;

  private constructor(graphClient: MSGraphClientV3) {
    this.graphClient = graphClient;
    this.storageService = StorageService.getInstance();
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
      const userResponse = await this.graphClient.api('/me').select('id,displayName,mail,jobTitle,department,userPrincipalName').get();

      this.currentUser = {
        id: userResponse.id,
        displayName: userResponse.displayName,
        email: userResponse.mail,
        jobTitle: userResponse.jobTitle,
        department: userResponse.department,
        userGroups: []
      };

      // Set user ID in storage service for user-specific storage
      this.storageService.setUserId(this.currentUser.id);

      // Get user group memberships
      const groupsResponse = await this.graphClient.api('/me/memberOf').select('id,displayName').get();

      if (groupsResponse && groupsResponse.value) {
        this.userGroups = groupsResponse.value.map((group: any) => group.displayName);
        this.userGroupIds = groupsResponse.value.map((group: any) => group.id);
        this.currentUser.userGroups = this.userGroups;
      }

      this.isInitialized = true;
    } catch (error) {
      logger.error('UserTargetingService', 'Error initializing user targeting service', error);
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
      // If no target users defined, show to everyone
      if (!alert.targetUsers || alert.targetUsers.length === 0) {
        return true;
      }

      // Check if current user is in target users list
      return this.isUserTargeted(alert.targetUsers);
    });
  }

  private isUserTargeted(targetUsers: IPersonField[]): boolean {
    if (!this.currentUser || !targetUsers || targetUsers.length === 0) {
      return false;
    }

    return targetUsers.some(person => {
      if (person.isGroup) {
        // If it's a group, check if user is member of that group
        return this.isUserInGroup(person);
      } else {
        // If it's a user, check if it's the current user
        return this.isCurrentUser(person);
      }
    });
  }

  private evaluateTargetingRule(rule: ITargetingRule): boolean {
    if (!this.currentUser) return false;

    // Check if we have the new targeting structure with People fields
    if (rule.targetUsers || rule.targetGroups) {
      return this.evaluatePeopleFieldTargeting(rule);
    }
    // Fallback to legacy targeting for backward compatibility
    else if (rule.audiences) {
      return this.evaluateLegacyTargeting(rule);
    }

    // If no targeting criteria provided at all, return false
    return false;
  }

  // New method to handle SharePoint People field targeting
  private evaluatePeopleFieldTargeting(rule: ITargetingRule): boolean {
    if (!this.currentUser) return false;

    // User targeting: Check if current user is in target users
    const userMatch = rule.targetUsers?.some(person =>
      this.isCurrentUser(person)
    ) || false;

    // Group targeting: Check if current user belongs to any of the target groups
    const groupMatch = rule.targetGroups?.some(group =>
      this.isUserInGroup(group)
    ) || false;

    // Apply the operation logic
    switch (rule.operation) {
      case "anyOf":
        // Show if user matches or is in any target group
        return userMatch || groupMatch;

      case "allOf":
        // For allOf with both user and group targeting, require both to match
        if (rule.targetUsers && rule.targetGroups) {
          return userMatch && groupMatch;
        }
        // If only one type of targeting is specified, return its result
        return rule.targetUsers ? userMatch : groupMatch;

      case "noneOf":
        // Show if user doesn't match and is not in any target group
        return !userMatch && !groupMatch;

      default:
        return false;
    }
  }

  // Legacy method for backward compatibility
  private evaluateLegacyTargeting(rule: ITargetingRule): boolean {
    if (!this.currentUser || !rule.audiences) return false;

    // Filter out null/undefined values and ensure they're strings before calling toLowerCase
    const userProperties = [
      ...(this.userGroups || []),
      this.currentUser.department,
      this.currentUser.jobTitle
    ]
      .filter((prop): prop is string => typeof prop === 'string' && prop !== '')
      .map(prop => prop.toLowerCase());

    // Ensure rule.audiences is an array before mapping
    const targetAudiences = Array.isArray(rule.audiences)
      ? rule.audiences.map(audience => typeof audience === 'string' ? audience.toLowerCase() : '')
      : [];

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

  // Helper method to check if a Person field matches current user
  private isCurrentUser(person: IPersonField): boolean {
    if (!this.currentUser) return false;

    // Match by different identifiers to be thorough
    return (
      // Match by ID
      person.id === this.currentUser.id ||
      // Match by email (ensure both exist before comparing)
      (person.email && this.currentUser.email &&
        person.email.toLowerCase() === this.currentUser.email.toLowerCase()) ||
      // Match by login name (ensure it exists before using includes)
      (typeof person.loginName === 'string' && person.loginName.includes(this.currentUser.id))
    );
  }

  // Helper method to check if current user is in a group
  private isUserInGroup(group: IPersonField): boolean {
    // Fixed: Explicitly check isGroup is true
    if (group.isGroup !== true) {
      return false;
    }

    if (!this.userGroupIds.length) {
      return false;
    }

    // Try to match by ID (most reliable)
    if (this.userGroupIds.includes(group.id)) {
      return true;
    }

    // Fallback to match by display name (less reliable but added for robustness)
    return this.userGroups.some(userGroup =>
      typeof userGroup === 'string' &&
      typeof group.displayName === 'string' &&
      userGroup.toLowerCase() === group.displayName.toLowerCase()
    );
  }

  public getCurrentUser(): IUser | null {
    return this.currentUser;
  }

  public getUserDismissedAlerts(): string[] {
    try {
      if (!this.currentUser) return [];
      return this.storageService.getFromSessionStorage<string[]>('DismissedAlerts', { userSpecific: true }) || [];
    } catch (error) {
      logger.error('UserTargetingService', 'Error getting dismissed alerts', error);
      return [];
    }
  }

  public addUserDismissedAlert(alertId: string): void {
    try {
      if (!this.currentUser) return;

      const dismissedAlerts = this.getUserDismissedAlerts();

      if (!dismissedAlerts.includes(alertId)) {
        dismissedAlerts.push(alertId);
        this.storageService.saveToSessionStorage('DismissedAlerts', dismissedAlerts, { userSpecific: true });
      }
    } catch (error) {
      logger.error('UserTargetingService', 'Error saving dismissed alert', error);
    }
  }

  public getUserHiddenAlerts(): string[] {
    try {
      if (!this.currentUser) return [];
      return this.storageService.getFromLocalStorage<string[]>('HiddenAlerts', { userSpecific: true }) || [];
    } catch (error) {
      logger.error('UserTargetingService', 'Error getting hidden alerts', error);
      return [];
    }
  }

  public addUserHiddenAlert(alertId: string): void {
    try {
      if (!this.currentUser) return;

      const hiddenAlerts = this.getUserHiddenAlerts();

      if (!hiddenAlerts.includes(alertId)) {
        hiddenAlerts.push(alertId);
        this.storageService.saveToLocalStorage('HiddenAlerts', hiddenAlerts, { userSpecific: true });
      }
    } catch (error) {
      logger.error('UserTargetingService', 'Error saving hidden alert', error);
    }
  }
}

export default UserTargetingService;