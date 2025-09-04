import { useState, useMemo } from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

export interface IAdminSettings {
  globalLinksListTitle: string;
  enableUserSelectionStorage: boolean;
  maxLinksPerCategory: number;
  enableSearch: boolean;
  enableAnimations: boolean;
  defaultViewMode?: string;
  bannerSize?: 'small' | 'medium' | 'large';
  cacheDurationMinutes?: number;
  enableBackgroundRefresh?: boolean;
  batchSize?: number;
  enableClickTracking?: boolean;
  enablePopularDetection?: boolean;
  popularThreshold?: number;
  restrictAdminFeatures?: boolean;
  linkValidationLevel?: string;
  enableLinkExpiration?: boolean;
  customCssClasses?: string;
  customJavaScript?: string;
  debugMode?: boolean;
}

export interface ILinkOperationStatus {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  lastOperation: string;
}

export interface IListValidationStatus {
  globalLinksExists: boolean;
  userSelectionsExists: boolean;
  isValidating: boolean;
  lastChecked: Date | null;
}

export interface INewLinkFormData {
  title: string;
  url: string;
  iconName: string;
  category: string;
  description: string;
  targetUsers: any[];
  isNewCategory: boolean;
  newCategoryName: string;
}

export interface ICollabFooterState {
  // Core links state
  myLinks: IContextualMenuItem[];
  setMyLinks: React.Dispatch<React.SetStateAction<IContextualMenuItem[]>>;
  organizationLinks: IContextualMenuItem[];
  setOrganizationLinks: React.Dispatch<React.SetStateAction<IContextualMenuItem[]>>;
  allAvailableOrgLinks: IContextualMenuItem[];
  setAllAvailableOrgLinks: React.Dispatch<React.SetStateAction<IContextualMenuItem[]>>;
  
  // Loading and status
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  myLinksSaved: boolean | null;
  setMyLinksSaved: React.Dispatch<React.SetStateAction<boolean | null>>;
  
  // UI state
  activeDropdown: string | null;
  setActiveDropdown: React.Dispatch<React.SetStateAction<string | null>>;
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  
  // Search and filter state
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  organizationSearchQuery: string;
  setOrganizationSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  personalLinksSearchQuery: string;
  setPersonalLinksSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  
  // Category and sorting
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  personalLinksSelectedCategory: string;
  setPersonalLinksSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  sortDirection: 'asc' | 'desc';
  setSortDirection: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  personalLinksSortBy: string;
  setPersonalLinksSortBy: React.Dispatch<React.SetStateAction<string>>;
  personalLinksSortDirection: 'asc' | 'desc';
  setPersonalLinksSortDirection: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  
  // Pagination
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  
  // Dialog states
  showLinkManagementDialog: boolean;
  setShowLinkManagementDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showAddPersonalLinkForm: boolean;
  setShowAddPersonalLinkForm: React.Dispatch<React.SetStateAction<boolean>>;
  showAddOrgLinkForm: boolean;
  setShowAddOrgLinkForm: React.Dispatch<React.SetStateAction<boolean>>;
  showIconGallery: boolean;
  setShowIconGallery: React.Dispatch<React.SetStateAction<boolean>>;
  isResetConfirmDialogOpen: boolean;
  setIsResetConfirmDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Admin state
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  isInEditMode: boolean;
  setIsInEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  adminSettings: IAdminSettings;
  setAdminSettings: React.Dispatch<React.SetStateAction<IAdminSettings>>;
  listValidationStatus: IListValidationStatus;
  setListValidationStatus: React.Dispatch<React.SetStateAction<IListValidationStatus>>;
  linkOperationStatus: ILinkOperationStatus;
  setLinkOperationStatus: React.Dispatch<React.SetStateAction<ILinkOperationStatus>>;
  
  // Form data
  newLinkFormData: INewLinkFormData;
  setNewLinkFormData: React.Dispatch<React.SetStateAction<INewLinkFormData>>;
  
  // Computed values
  allLinks: IContextualMenuItem[];
}

export const useCollabFooterState = (
  initialMyLinks: IContextualMenuItem[] = [],
  sharedLinks: IContextualMenuItem[] = []
): ICollabFooterState => {
  // Core links state
  const [myLinks, setMyLinks] = useState<IContextualMenuItem[]>(initialMyLinks);
  const [organizationLinks, setOrganizationLinks] = useState<IContextualMenuItem[]>(sharedLinks);
  const [allAvailableOrgLinks, setAllAvailableOrgLinks] = useState<IContextualMenuItem[]>([]);
  
  // Loading and status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [myLinksSaved, setMyLinksSaved] = useState<boolean | null>(null);
  
  // UI state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('personal');
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [organizationSearchQuery, setOrganizationSearchQuery] = useState<string>('');
  const [personalLinksSearchQuery, setPersonalLinksSearchQuery] = useState<string>('');
  
  // Category and sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [personalLinksSelectedCategory, setPersonalLinksSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [personalLinksSortBy, setPersonalLinksSortBy] = useState<string>('name');
  const [personalLinksSortDirection, setPersonalLinksSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;
  
  // Dialog states
  const [showLinkManagementDialog, setShowLinkManagementDialog] = useState<boolean>(false);
  const [showAddPersonalLinkForm, setShowAddPersonalLinkForm] = useState<boolean>(false);
  const [showAddOrgLinkForm, setShowAddOrgLinkForm] = useState<boolean>(false);
  const [showIconGallery, setShowIconGallery] = useState<boolean>(false);
  const [isResetConfirmDialogOpen, setIsResetConfirmDialogOpen] = useState<boolean>(false);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [adminSettings, setAdminSettings] = useState<IAdminSettings>({
    globalLinksListTitle: 'Global Footer Links',
    enableUserSelectionStorage: true,
    maxLinksPerCategory: 50,
    enableSearch: true,
    enableAnimations: true,
    defaultViewMode: 'icons',
    cacheDurationMinutes: 30,
    enableBackgroundRefresh: true,
    batchSize: 20,
    enableClickTracking: true,
    enablePopularDetection: true,
    popularThreshold: 10,
    restrictAdminFeatures: false,
    linkValidationLevel: 'basic',
    enableLinkExpiration: false,
    customCssClasses: '',
    customJavaScript: '',
    debugMode: false,
    bannerSize: 'medium'
  });
  
  const [listValidationStatus, setListValidationStatus] = useState<IListValidationStatus>({
    globalLinksExists: false,
    userSelectionsExists: false,
    isValidating: false,
    lastChecked: null
  });
  
  const [linkOperationStatus, setLinkOperationStatus] = useState<ILinkOperationStatus>({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    lastOperation: ''
  });
  
  // Form data
  const [newLinkFormData, setNewLinkFormData] = useState<INewLinkFormData>({
    title: '',
    url: '',
    iconName: 'Link',
    category: 'personal',
    description: '',
    targetUsers: [],
    isNewCategory: false,
    newCategoryName: ''
  });
  
  
  // Computed values
  const allLinks = useMemo(() => [...organizationLinks, ...myLinks], [organizationLinks, myLinks]);
  
  return {
    // Core links state
    myLinks,
    setMyLinks,
    organizationLinks,
    setOrganizationLinks,
    allAvailableOrgLinks,
    setAllAvailableOrgLinks,
    
    // Loading and status
    isLoading,
    setIsLoading,
    myLinksSaved,
    setMyLinksSaved,
    
    // UI state
    activeDropdown,
    setActiveDropdown,
    showSearch,
    setShowSearch,
    activeTab,
    setActiveTab,
    
    // Search and filter state
    searchQuery,
    setSearchQuery,
    organizationSearchQuery,
    setOrganizationSearchQuery,
    personalLinksSearchQuery,
    setPersonalLinksSearchQuery,
    
    // Category and sorting
    selectedCategory,
    setSelectedCategory,
    personalLinksSelectedCategory,
    setPersonalLinksSelectedCategory,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    personalLinksSortBy,
    setPersonalLinksSortBy,
    personalLinksSortDirection,
    setPersonalLinksSortDirection,
    
    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    
    // Dialog states
    showLinkManagementDialog,
    setShowLinkManagementDialog,
    showAddPersonalLinkForm,
    setShowAddPersonalLinkForm,
    showAddOrgLinkForm,
    setShowAddOrgLinkForm,
    showIconGallery,
    setShowIconGallery,
    isResetConfirmDialogOpen,
    setIsResetConfirmDialogOpen,
    
    // Admin state
    isAdmin,
    setIsAdmin,
    isInEditMode,
    setIsInEditMode,
    adminSettings,
    setAdminSettings,
    listValidationStatus,
    setListValidationStatus,
    linkOperationStatus,
    setLinkOperationStatus,
    
    // Form data
    newLinkFormData,
    setNewLinkFormData,
    
    // Computed values
    allLinks
  };
};