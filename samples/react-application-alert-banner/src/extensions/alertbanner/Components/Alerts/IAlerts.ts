import { MSGraphClientV3 } from "@microsoft/sp-http";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

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

export enum ContentType {
  Alert = "alert",
  Template = "template"
}

export enum TargetLanguage {
  EnglishUS = "en-us",
  FrenchFR = "fr-fr", 
  GermanDE = "de-de",
  SpanishES = "es-es",
  SwedishSE = "sv-se",
  FinnishFI = "fi-fi",
  DanishDK = "da-dk",
  NorwegianNO = "nb-no",
  All = "all" // For items that should show to all languages
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
}

export interface IAlertsProps {
  siteIds?: string[];
  graphClient: MSGraphClientV3;
  context: ApplicationCustomizerContext;
  alertTypesJson: string; // Property to receive the alert types JSON
  userTargetingEnabled?: boolean;
  notificationsEnabled?: boolean;
  onSettingsChange?: (settings: {
    alertTypesJson: string;
    userTargetingEnabled: boolean;
    notificationsEnabled: boolean;
  }) => void;
}

export interface IAlertsState {
  alerts: import("../Services/SharePointAlertService").IAlertItem[];
  alertTypes: { [key: string]: IAlertType };
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  userDismissedAlerts: string[];
  userHiddenAlerts: string[];
  currentIndex: number;
  isInEditMode: boolean;
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
  targetUsers?: IPersonField[]; // People/Groups who can see this alert. If empty, everyone sees it
  notificationType: NotificationType;
  linkUrl?: string;
  linkDescription?: string;
  quickActions?: IQuickAction[];
  createdDate: string;
  createdBy: string;
  // New language and classification properties
  contentType: ContentType; // Alert or Template
  targetLanguage: TargetLanguage; // Specific language or 'all'
  languageGroup?: string; // Groups related language variants (same content, different languages)
  // Additional SharePoint properties
  targetSites?: string[];
  scheduledStart?: string | Date;
  scheduledEnd?: string | Date;
  metadata?: any;
  status?: string;
  availableForAll?: boolean;
}

// IAlertRichMedia removed - using description field for all content

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