/**
 * Common types and interfaces for the Collaboration Footer
 */

/**
 * Shared/Global link interface
 */
export interface ISharedLink {
  id: number;
  title: string;
  url: string;
  description?: string;
  iconName?: string;
  iconUrl?: string; // URL to custom icon image (PNG, SVG, etc.)
  order?: number;
  parentId?: number;
  category?: string; // Category for grouping links in pills
  isActive: boolean;
}

/**
 * Global link with mandatory/optional flag (used in hybrid architecture)
 */
export interface IGlobalLink {
  id: number;
  title: string;
  url: string;
  description?: string;
  iconName?: string;
  iconUrl?: string; // URL to custom icon image (PNG, SVG, etc.)
  order?: number;
  category?: string;
  isMandatory: boolean;
  isActive: boolean;
  targetAudience?: string[];
  validFrom?: string;
  validTo?: string;
}

/**
 * Personal link interface
 */
export interface IPersonalLink {
  id?: number;
  userId: string;
  title: string;
  url: string;
  description?: string;
  iconName?: string;
  order?: number;
  isActive: boolean;
  category?: string;
}

/**
 * User link selection for global links
 */
export interface IUserLinkSelection {
  id?: number;
  userId: string;
  globalLinkId: number;
  isSelected: boolean;
  dateSelected?: string;
}

/**
 * OneDrive personal links data structure
 */
export interface IOneDrivePersonalLinksData {
  version: string;
  lastModified: string;
  userId: string;
  personalLinks: IPersonalLink[];
  selectedGlobalLinkIds?: number[]; // User's selected organization links (legacy)
  deselectedGlobalLinkIds?: number[]; // User's deselected organization links (they chose to hide)
  userSettings?: any; // User's personal settings and preferences
}

/**
 * Link selection dialog result
 */
export interface ILinkSelectionResult {
  selectedLinkIds: number[];
  cancelled: boolean;
}

/**
 * My links dialog edit result
 */
export interface IMyLinksEditResult {
  myLinks: IPersonalLink[];
  cancelled: boolean;
}