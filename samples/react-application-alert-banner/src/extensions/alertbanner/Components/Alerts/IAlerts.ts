import { MSGraphClientV3 } from "@microsoft/sp-http";

export enum AlertPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical"
}

export enum NotificationType {
  None = "none",
  Browser = "browser",
  Email = "email",
  Both = "both"
}

// Interface for SharePoint Person field data
export interface IPersonField {
  id: string;          // User/Group ID
  displayName: string; // Display name
  email?: string;      // Email address (for users)
  loginName?: string;  // Login name
  isGroup: boolean;    // Whether this is a group or individual user
}

// Interface for targeting rules
export interface ITargetingRule {
  // Support for People fields
  targetUsers?: IPersonField[]; // Individual users from People field
  targetGroups?: IPersonField[]; // SharePoint groups from People field
  
  // Legacy targeting with string arrays
  audiences?: string[]; 
  
  // Operation to apply
  operation: "anyOf" | "allOf" | "noneOf";
}

export interface IAlertsBannerApplicationCustomizerProperties {
  alertTypesJson: string; // Property to hold the alert types JSON
  userTargetingEnabled: boolean; // Enable user targeting feature
  notificationsEnabled: boolean; // Enable notifications feature
  richMediaEnabled: boolean; // Enable rich media support
}

export interface IAlertsProps {
  siteIds?: string[];
  graphClient: MSGraphClientV3;
  alertTypesJson: string; // Property to receive the alert types JSON
  userTargetingEnabled?: boolean;
  notificationsEnabled?: boolean;
  richMediaEnabled?: boolean;
}

export interface IAlertsState {
  alerts: IAlertItem[];
  alertTypes: { [key: string]: IAlertType };
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  userDismissedAlerts: number[];
  userHiddenAlerts: number[];
}

export interface IUser {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  userGroups?: string[];
}

export interface IAlertItem {
  Id: number;
  title: string;
  description: string;
  AlertType: string;
  priority: AlertPriority;
  isPinned: boolean;
  targetingRules?: ITargetingRule[];
  notificationType: NotificationType;
  richMedia?: IAlertRichMedia;
  link?: {
    Url: string;
    Description: string;
  };
  quickActions?: IQuickAction[];
  createdDate: string;
  createdBy: string;
}

export interface IAlertRichMedia {
  type: "image" | "video" | "html" | "markdown";
  content: string; // URL for image/video or content for html/markdown
  altText?: string; // For accessibility
}

export interface IQuickAction {
  label: string;
  actionType: "link" | "dismiss" | "acknowledge" | "custom";
  url?: string; // For link type actions
  callback?: string; // Function name to execute for custom actions
  icon?: string; // Icon name for the action button
}

export interface IAlertType {
  name: string;
  iconName: string;
  backgroundColor: string;
  textColor: string;
  additionalStyles?: string;
  priorityStyles?: { [key in AlertPriority]?: string }; // Different styles based on priority
}