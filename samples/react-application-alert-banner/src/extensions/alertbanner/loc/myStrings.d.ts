declare interface IAlertBannerApplicationCustomizerStrings {
  Title: string;

  // General UI
  Save: string;
  Cancel: string;
  Close: string;
  Edit: string;
  Delete: string;
  Add: string;
  Update: string;
  Create: string;
  Remove: string;
  Yes: string;
  No: string;
  OK: string;
  Loading: string;
  Error: string;
  Success: string;
  Warning: string;
  Info: string;

  // Language
  Language: string;
  SelectLanguage: string;
  ChangeLanguage: string;

  // Time-related
  JustNow: string;
  MinutesAgo: string;
  HoursAgo: string;
  DaysAgo: string;

  // Alert Settings
  AlertSettings: string;
  AlertSettingsTitle: string;
  AlertSettingsDescription: string;
  ConfigureAlertBannerSettings: string;
  Features: string;
  EnableUserTargeting: string;
  EnableUserTargetingDescription: string;
  EnableNotifications: string;
  EnableNotificationsDescription: string;
  EnableRichMedia: string;
  EnableRichMediaDescription: string;
  AlertTypesConfiguration: string;
  AlertTypesConfigurationDescription: string;
  AlertTypesPlaceholder: string;
  AlertTypesHelpText: string;
  SaveSettings: string;
  InvalidJSONError: string;

  // Alert Management
  CreateAlert: string;
  EditAlert: string;
  DeleteAlert: string;
  AlertTitle: string;
  AlertDescription: string;
  AlertType: string;
  Priority: string;
  Status: string;
  TargetSites: string;
  LinkUrl: string;
  LinkDescription: string;
  ScheduledStart: string;
  ScheduledEnd: string;
  IsPinned: string;
  NotificationType: string;

  // Priority Levels
  PriorityLow: string;
  PriorityMedium: string;
  PriorityHigh: string;
  PriorityCritical: string;

  // Status Types
  StatusActive: string;
  StatusExpired: string;
  StatusScheduled: string;
  StatusInactive: string;

  // Notification Types
  NotificationNone: string;
  NotificationBrowser: string;
  NotificationEmail: string;
  NotificationBoth: string;

  // Alert Types
  AlertTypeInfo: string;
  AlertTypeWarning: string;
  AlertTypeMaintenance: string;
  AlertTypeInterruption: string;

  // User Interface
  ShowMore: string;
  ShowLess: string;
  ViewDetails: string;
  Expand: string;
  Collapse: string;
  Preview: string;
  Templates: string;
  CustomizeColors: string;

  // Site Selection
  SelectSites: string;
  CurrentSite: string;
  AllSites: string;
  HubSites: string;
  RecentSites: string;
  FollowedSites: string;

  // Permissions and Errors
  InsufficientPermissions: string;
  PermissionDeniedCreateLists: string;
  PermissionDeniedAccessLists: string;
  ListsNotFound: string;
  InitializationFailed: string;
  ConnectionError: string;
  SaveError: string;
  LoadError: string;

  // User Friendly Messages
  NoAlertsMessage: string;
  AlertsLoadingMessage: string;
  AlertCreatedSuccess: string;
  AlertUpdatedSuccess: string;
  AlertDeletedSuccess: string;
  SettingsSavedSuccess: string;

  // Date and Time
  CreatedBy: string;
  CreatedOn: string;
  LastModified: string;
  Never: string;
  Today: string;
  Yesterday: string;
  Tomorrow: string;

  // Validation Messages
  FieldRequired: string;
  InvalidUrl: string;
  InvalidDate: string;
  InvalidEmail: string;
  TitleTooLong: string;
  DescriptionTooLong: string;

  // Rich Media
  UploadImage: string;
  RemoveImage: string;
  ImageAltText: string;
  VideoUrl: string;
  EmbedCode: string;

  // Accessibility
  CloseDialog: string;
  OpenSettings: string;
  ExpandAlert: string;
  CollapseAlert: string;
  AlertActions: string;
  PinAlert: string;
  UnpinAlert: string;
}

declare module 'AlertBannerApplicationCustomizerStrings' {
  const strings: IAlertBannerApplicationCustomizerStrings;
  export = strings;
}
