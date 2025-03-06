// IAlerts.types.ts with new features

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

export interface IAlertsBannerApplicationCustomizerProperties {
  alertTypesJson: string; // Property to hold the alert types JSON
  userTargetingEnabled: boolean; // Enable user targeting feature
  notificationsEnabled: boolean; // Enable notifications feature
  richMediaEnabled: boolean; // Enable rich media support
  multiLanguageEnabled: boolean; // Enable multi-language support
}

export interface IAlertsProps {
  siteIds?: string[];
  graphClient: MSGraphClientV3;
  alertTypesJson: string; // Property to receive the alert types JSON
  currentUser?: IUser; // Current user for targeting
  supportedLanguages?: string[]; // Available languages
  userLanguage?: string; // User's preferred language
  userTargetingEnabled?: boolean;
  notificationsEnabled?: boolean;
  richMediaEnabled?: boolean;
  multiLanguageEnabled?: boolean;
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

export interface ITargetingRule {
  audiences: string[]; // Departments, job titles, or group names
  operation: "anyOf" | "allOf" | "noneOf"; // Logical operation to apply
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

export interface IAlertTranslation {
  title: string;
  description: string;
  linkDescription?: string;
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

export interface IAlertPreferences {
  expandedByDefault: boolean;
  autoDismissAfter?: number; // In milliseconds, undefined means never auto-dismiss
  showOnlyHighPriority: boolean;
  preferredLanguage: string;
}