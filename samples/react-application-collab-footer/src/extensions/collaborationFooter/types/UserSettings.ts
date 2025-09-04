/**
 * User settings and preferences for the collaboration footer
 */

import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { ITargetUser } from '../services/linkValidationService';

export enum DisplayMode {
  FlatPills = 'flat-pills',
  CategoryDropdowns = 'category-dropdowns', 
  OrgPersonalDropdowns = 'org-personal-dropdowns',
  TypeBasedDropdowns = 'type-based-dropdowns'
}

export enum PillStyle {
  Rounded = 'rounded',
  Square = 'square',
  Minimal = 'minimal'
}

export enum Density {
  Compact = 'compact',
  Normal = 'normal', 
  Spacious = 'spacious'
}

export enum SortOrder {
  Alphabetical = 'alphabetical',
  UsageFrequency = 'usage-frequency',
  DateAdded = 'date-added',
  Manual = 'manual'
}

export enum ClickBehavior {
  NewTab = 'new-tab',
  SameTab = 'same-tab',
  Popup = 'popup'
}

export interface IUserSettings {
  // Display Mode Settings
  displayMode: DisplayMode;
  pillStyle: PillStyle;
  density: Density;
  
  // Icon and Badge Settings
  showIcons: boolean;
  iconSize: 'small' | 'medium' | 'large';
  showBadges: boolean;
  
  // Organization Settings
  sortOrder: SortOrder;
  maxVisibleItems: number;
  hiddenCategories: string[];
  defaultCategory?: string;
  
  // Personal Link Settings
  enableAutoCategories: boolean;
  enableQuickAdd: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  
  // Interaction Settings
  clickBehavior: ClickBehavior;
  enableGlobalSearch: boolean;
  enableHoverEffects: boolean;
  enableKeyboardNavigation: boolean;
  
  // Performance & Privacy
  cacheDuration: number; // minutes
  enableAnalytics: boolean;
  recentItemsCount: number;
  
  // Version for settings migration
  version: string;
}

export const DEFAULT_USER_SETTINGS: IUserSettings = {
  // Display Mode Settings
  displayMode: DisplayMode.OrgPersonalDropdowns,
  pillStyle: PillStyle.Rounded,
  density: Density.Normal,
  
  // Icon and Badge Settings  
  showIcons: true,
  iconSize: 'medium',
  showBadges: true,
  
  // Organization Settings
  sortOrder: SortOrder.Alphabetical,
  maxVisibleItems: 10,
  hiddenCategories: [],
  defaultCategory: undefined,
  
  // Personal Link Settings
  enableAutoCategories: true,
  enableQuickAdd: true,
  syncFrequency: 'hourly',
  
  // Interaction Settings
  clickBehavior: ClickBehavior.NewTab,
  enableGlobalSearch: true,
  enableHoverEffects: true,
  enableKeyboardNavigation: true,
  
  // Performance & Privacy
  cacheDuration: 60, // 1 hour
  enableAnalytics: true,
  recentItemsCount: 5,
  
  version: '1.0.0'
};

export interface IUserSettingsService {
  getSettings(): Promise<IUserSettings>;
  saveSettings(settings: IUserSettings): Promise<boolean>;
  resetToDefaults(): Promise<boolean>;
  migrateSettings(oldSettings: Record<string, unknown>, oldVersion: string): IUserSettings;
}

/**
 * Interface for link data stored in IContextualMenuItem.data
 */
export interface ILinkData {
  category?: string;
  iconUrl?: string;
  isMandatory?: boolean;
  id?: string | number;
  description?: string;
  iconName?: string;
}

/**
 * Interface for form data used in link creation/editing
 */
export interface ILinkFormData {
  title: string;
  url: string;
  description: string;
  iconName: string;
  iconUrl: string;
  category: string;
  targetUsers?: ITargetUser[];
  isMandatory?: boolean;
  validFrom?: string;
  validTo?: string;
  id?: string | number; // For edit mode detection
}

// Form state actions for useReducer
export type FormAction = 
  | { type: 'SET_FIELD'; field: keyof ILinkFormData; value: string | number | boolean | ITargetUser[] }
  | { type: 'RESET_FORM'; initialData?: Partial<ILinkFormData> }
  | { type: 'SET_FORM_DATA'; data: ILinkFormData };

// Main application state for performance optimization
// Import IContextualMenuItem type
export interface IAppState {
  // Links data
  myLinks: IContextualMenuItem[];
  organizationLinks: IContextualMenuItem[];
  allAvailableOrgLinks: IContextualMenuItem[];
  
  // Loading states
  isLoading: boolean;
  myLinksSaved: boolean | null;
  
  // Search and filtering
  searchQuery: string;
  showSearch: boolean;
  selectedCategory: string;
  organizationSearchQuery: string;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  
  // Sorting
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  
  // Dialog states
  isResetConfirmDialogOpen: boolean;
  showLinkManagementDialog: boolean;
  activeTab: string;
  showAddPersonalLinkForm: boolean;
  showAddOrgLinkForm: boolean;
  
  // User access
  isAdmin: boolean;
  isInEditMode: boolean;
  
  // Personal links management
  personalLinksSearchQuery: string;
  personalLinksSortBy: string;
  personalLinksSortDirection: 'asc' | 'desc';
  personalLinksSelectedCategory: string;
  
  // Validation status
  listValidationStatus: {
    globalLinksExists: boolean;
    userSelectionsExists: boolean;
    isValidating: boolean;
    lastChecked: Date | null;
  };
  
  // Admin settings
  adminSettings: {
    globalLinksListTitle: string;
    enableUserSelectionStorage: boolean;
    maxLinksPerCategory: number;
    enableSearch: boolean;
    enableAnimations: boolean;
    bannerSize: string;
  };
  
  // Operation status
  linkOperationStatus: {
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    lastOperation: string | null;
  };
}

export type AppAction = 
  | { type: 'SET_MY_LINKS'; payload: IContextualMenuItem[] }
  | { type: 'SET_ORGANIZATION_LINKS'; payload: IContextualMenuItem[] }
  | { type: 'SET_ALL_AVAILABLE_ORG_LINKS'; payload: IContextualMenuItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MY_LINKS_SAVED'; payload: boolean | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SHOW_SEARCH'; payload: boolean }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'SET_ORGANIZATION_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SET_SORT_DIRECTION'; payload: 'asc' | 'desc' }
  | { type: 'SET_RESET_CONFIRM_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_SHOW_LINK_MANAGEMENT_DIALOG'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SHOW_ADD_PERSONAL_LINK_FORM'; payload: boolean }
  | { type: 'SET_SHOW_ADD_ORG_LINK_FORM'; payload: boolean }
  | { type: 'SET_IS_ADMIN'; payload: boolean }
  | { type: 'SET_IS_IN_EDIT_MODE'; payload: boolean }
  | { type: 'SET_PERSONAL_LINKS_SEARCH_QUERY'; payload: string }
  | { type: 'SET_PERSONAL_LINKS_SORT_BY'; payload: string }
  | { type: 'SET_PERSONAL_LINKS_SORT_DIRECTION'; payload: 'asc' | 'desc' }
  | { type: 'SET_PERSONAL_LINKS_SELECTED_CATEGORY'; payload: string }
  | { type: 'UPDATE_LIST_VALIDATION_STATUS'; payload: Partial<IAppState['listValidationStatus']> }
  | { type: 'UPDATE_ADMIN_SETTINGS'; payload: Partial<IAppState['adminSettings']> }
  | { type: 'UPDATE_LINK_OPERATION_STATUS'; payload: Partial<IAppState['linkOperationStatus']> };