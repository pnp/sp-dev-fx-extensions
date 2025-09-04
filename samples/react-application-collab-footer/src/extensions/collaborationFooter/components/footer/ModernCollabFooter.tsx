import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Log } from '@microsoft/sp-core-library';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import '@pnp/sp/fields';
import '@pnp/sp/views';
import styles from './ModernCollabFooter.module.scss';

import { ICollabFooterProps } from './ICollabFooterProps';

import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { getTheme } from '@fluentui/react/lib/Styling';
import { useToastNotifications } from '../../hooks/useToastNotifications';
import { ToastContainer } from '../shared/ToastNotification';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
// Import hooks
import { useUserAccess } from '../../hooks/useUserAccess';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useCategories } from '../../hooks/useCategories';
import { useSafeTimeout } from '../../hooks/useSafeTimeout';
import { useUserSettings } from '../../hooks/useUserSettings';
// Form components
// Admin components
// Modular shared components
// Dialog components
import { LinkManagementDialog } from '../dialogs/LinkManagementDialog';
// Settings components
// UserSettingsPanel is now integrated into LinkManagementDialog as a tab
// New smaller components
import { FooterActions } from './FooterActions';
import { FooterNotifications } from './FooterNotifications';
import { FooterSearch } from './FooterSearch';
import { FooterContent } from './FooterContent';
import { LinkBadgeRenderer } from './LinkBadgeRenderer';
// Services

const LOG_SOURCE: string = 'ModernCollabFooter';

// ITargetUser interface now imported from OrganizationLinkForm

interface IAdminSettings {
  globalLinksListTitle: string;
  enableUserSelectionStorage: boolean;
  maxLinksPerCategory: number;
  enableSearch: boolean;
  enableAnimations: boolean;
  // Advanced Display Settings
  defaultViewMode?: string;
  bannerSize?: 'small' | 'medium' | 'large';
  // Performance & Caching
  cacheDurationMinutes?: number;
  enableBackgroundRefresh?: boolean;
  batchSize?: number;
  // Analytics & Tracking
  enableClickTracking?: boolean;
  enablePopularDetection?: boolean;
  popularThreshold?: number;
  // Security & Permissions
  restrictAdminFeatures?: boolean;
  linkValidationLevel?: string;
  enableLinkExpiration?: boolean;
  // Advanced Configuration
  customCssClasses?: string;
  customJavaScript?: string;
  debugMode?: boolean;
}


// LinkBadge component moved to LinkBadgeRenderer.tsx


const ModernCollabFooter: React.FC<ICollabFooterProps> = ({ 
  sharedLinks, 
  myLinks: initialMyLinks, 
  editMyLinks, 
  openLinkSelection, 
  storageType,
  context,
  footerService,
  homeSiteUrl,
  legacyMode = false,
  onPersonalLinksUpdated
}) => {
  const [myLinks, setMyLinks] = useState<IContextualMenuItem[]>(initialMyLinks);
  const [myLinksSaved, setMyLinksSaved] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // User settings state is now handled within LinkManagementDialog
  const [organizationSearchQuery, setOrganizationSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(20); // Configurable page size
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isResetConfirmDialogOpen, setIsResetConfirmDialogOpen] = useState<boolean>(false);
  const [showLinkManagementDialog, setShowLinkManagementDialog] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);
  const [showAddPersonalLinkForm, setShowAddPersonalLinkForm] = useState<boolean>(false);
  const [personalLinksSearchQuery, setPersonalLinksSearchQuery] = useState<string>('');
  const [personalLinksSortBy, setPersonalLinksSortBy] = useState<string>('name');
  const [personalLinksSortDirection, setPersonalLinksSortDirection] = useState<'asc' | 'desc'>('asc');
  const [personalLinksSelectedCategory, setPersonalLinksSelectedCategory] = useState<string>('all');
  const [showAddOrgLinkForm, setShowAddOrgLinkForm] = useState<boolean>(false);
  const [newLinkFormData, setNewLinkFormData] = useState<{
    title: string;
    url: string;
    description: string;
    iconName: string;
    iconUrl: string;
    category: string;
    targetUsers: any[];
    isMandatory: boolean;
    validFrom: string;
    validTo: string;
  }>({
    title: '',
    url: '',
    description: '',
    iconName: 'Link',
    iconUrl: '',
    category: 'General',
    targetUsers: [],
    isMandatory: false,
    validFrom: '',
    validTo: ''
  });
  // Custom category state moved to individual form components
  const [listValidationStatus, setListValidationStatus] = useState<{
    globalLinksExists: boolean;
    userSelectionsExists: boolean;
    isValidating: boolean;
    lastChecked: Date | null;
  }>({
    globalLinksExists: false,
    userSelectionsExists: false,
    isValidating: false,
    lastChecked: null
  });
  const [adminSettings, setAdminSettings] = useState<IAdminSettings>({
    globalLinksListTitle: 'Global Footer Links',
    enableUserSelectionStorage: true,
    maxLinksPerCategory: 10,
    enableSearch: true,
    enableAnimations: true,
    bannerSize: 'medium'
  });
  const [organizationLinks, setOrganizationLinks] = useState<IContextualMenuItem[]>(sharedLinks);
  const [allAvailableOrgLinks, setAllAvailableOrgLinks] = useState<IContextualMenuItem[]>([]);
  const [linkOperationStatus, setLinkOperationStatus] = useState<{
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    lastOperation: string | null;
  }>({
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    lastOperation: null
  });

  // Initialize new hooks
  const userAccess = useUserAccess(context as any, organizationLinks, myLinks);
  const analytics = useAnalytics(context as any, false); // Disable auto-refresh to improve performance
  const toast = useToastNotifications();
  const userSettings = useUserSettings(context as any);
  
  // Memoize the combined links array to prevent infinite re-renders
  const allLinks = useMemo(() => [...organizationLinks, ...myLinks], [organizationLinks, myLinks]);
  const categories = useCategories(context as any, allLinks);
  const { setSafeTimeout } = useSafeTimeout();

  
  const theme = getTheme();
  
  // SharePoint theme colors for better integration
  const sharePointTheme = useMemo(() => ({
    primary: theme.palette.themePrimary,
    primaryLight: theme.palette.themeLighter,
    primaryDark: theme.palette.themeDark,
    accent: theme.palette.accent,
    neutral: theme.palette.neutralPrimary,
    neutralLight: theme.palette.neutralLighter,
    neutralDark: theme.palette.neutralDark,
    success: theme.palette.green,
    warning: theme.palette.yellow,
    error: theme.palette.red,
    // Custom colors that inherit from SharePoint site theme
    compactButtonBg: theme.palette.themeLighter,
    compactButtonBorder: theme.palette.themeTertiary,
    compactButtonHover: theme.palette.themePrimary,
    adminButtonBg: theme.palette.orangeLight,
    adminButtonBorder: theme.palette.orange
  }), [theme]);

  // Enhanced link click handler with analytics tracking
  const handleLinkClickWithAnalytics = useCallback(async (link: IContextualMenuItem, event?: React.MouseEvent) => {
    try {
      // Track the click in analytics
      await analytics.trackLinkClick(link);
      
      // Open link in new tab/window (default behavior)
      if (link.href && !event?.defaultPrevented) {
        window.open(link.href, link.target || '_blank');
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      // Still allow link navigation even if analytics fails
      if (link.href && !event?.defaultPrevented) {
        window.open(link.href, link.target || '_blank');
      }
    }
  }, [analytics]);

  // Admin handlers for BulkOperationsSection
  const handleLinksImported = useCallback((links: IContextualMenuItem[]) => {
    setOrganizationLinks(prevLinks => [...prevLinks, ...links]);
  }, []);

  const handleStatusUpdate = useCallback((message: string, isError = false) => {
    Log.info(LOG_SOURCE, `Admin status: ${message}`);
    setLinkOperationStatus(prev => ({ 
      ...prev, 
      lastOperation: message 
    }));
  }, []);




  // Log component initialization
  useEffect(() => {
    Log.info(LOG_SOURCE, `Modern footer initialized with ${sharedLinks.length} shared links and ${myLinks.length} personal links`);
  }, [sharedLinks.length, myLinks.length]);

  // Auto-open link management dialog in legacy mode
  useEffect(() => {
    if (legacyMode && !showLinkManagementDialog) {
      setShowLinkManagementDialog(true);
      setActiveTab('personal'); // Start on personal links tab
    }
  }, [legacyMode, showLinkManagementDialog]);

  // Update state when props change
  useEffect(() => {
    setMyLinks(initialMyLinks);
  }, [initialMyLinks]);

  // Call callback when personal links are updated (for legacy mode)
  useEffect(() => {
    if (legacyMode && onPersonalLinksUpdated) {
      onPersonalLinksUpdated(myLinks);
    }
  }, [myLinks, legacyMode, onPersonalLinksUpdated]);

  // Initialize component with real data and admin status
  useEffect(() => {
    checkAdminStatus();
    checkEditMode();
    loadRealData();
    validateSharePointLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update organization links when sharedLinks prop changes
  useEffect(() => {
    setOrganizationLinks(sharedLinks);
  }, [sharedLinks]);

  // Removed unused checkAdminPermissions function

  // Check if user is site admin
  const checkAdminStatus = useCallback(async () => {
    try {
      if (!context) {
        Log.warn(LOG_SOURCE, 'Context not available for admin check');
        return;
      }

      // Check if user has site admin permissions
      // For now, we'll use a simplified check based on user info
      const isSiteAdmin = context.pageContext.user?.isAnonymousGuestUser === false &&
                         context.pageContext.legacyPageContext?.isSiteAdmin === true;
      
      setIsAdmin(!!isSiteAdmin);
      Log.info(LOG_SOURCE, `Admin status: ${isSiteAdmin}`);
    } catch (error) {
      Log.warn(LOG_SOURCE, `Error checking admin status: ${(error as Error).message}`);
      setIsAdmin(false);
    }
  }, [context]);

  // Load real data from footerService
  const loadRealData = useCallback(async () => {
    try {
      if (!footerService) {
        Log.warn(LOG_SOURCE, 'Footer service not available');
        return;
      }

      setIsLoading(true);

      // Load personal links
      const personalLinks = await footerService.getPersonalLinks();
      const personalMenuItems = personalLinks.map((link, index) => ({
        key: `personal-${link.id || `generated-${Date.now()}-${index}`}`,
        name: link.title,
        href: link.url,
        title: link.description,
        iconProps: { iconName: link.iconName || 'Link' },
        target: '_blank',
        data: {
          iconUrl: (link as any).iconUrl
        }
      }));
      setMyLinks(personalMenuItems);

      // Load organization links (selected and mandatory)
      const sharedLinks = await footerService.getSharedLinks();
      const sharedMenuItems = sharedLinks.map(link => ({
        key: `shared-${link.id}`,
        name: link.title,
        href: link.url,
        title: link.description,
        iconProps: { iconName: link.iconName || 'Link' },
        target: '_blank',
        isActive: link.isActive,
        data: {
          iconUrl: link.iconUrl,
          isMandatory: (link as any).isMandatory || false,
          category: (link as any).category || 'General'
        }
      }));
      setOrganizationLinks(sharedMenuItems);

      // Load all available organization links (for management dialog)
      if ('getAllGlobalLinks' in footerService) {
        const allGlobalLinks = await (footerService as any).getAllGlobalLinks();
        const allOrgMenuItems = allGlobalLinks.map((link: any) => ({
          key: `global-${link.id}`,
          name: link.title,
          href: link.url,
          title: link.description,
          iconProps: { iconName: link.iconName || 'Link' },
          target: '_blank',
          isActive: link.isActive,
          data: {
            iconUrl: link.iconUrl,
            isMandatory: link.isMandatory || false,
            category: link.category || 'General',
            id: link.id
          }
        }));
        setAllAvailableOrgLinks(allOrgMenuItems);
      }

      Log.info(LOG_SOURCE, `Loaded ${personalLinks.length} personal links and ${sharedLinks.length} organization links`);
    } catch (error) {
      Log.warn(LOG_SOURCE, `Error loading data: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [footerService]);

  const checkEditMode = useCallback(() => {
    try {
      // Check if page is in edit mode
      const editMode = window.location.href.includes('Mode=Edit') || 
                      document.querySelector('[data-automation-id="pageHeader"]')?.getAttribute('data-sp-feature-tag')?.includes('Edit');
      setIsInEditMode(!!editMode);
    } catch (error) {
      Log.warn(LOG_SOURCE, 'Failed to check edit mode');
      setIsInEditMode(false);
    }
  }, []);

  // Validate SharePoint lists existence
  const validateSharePointLists = useCallback(async () => {
    try {
      setListValidationStatus(prev => ({ ...prev, isValidating: true }));
      
      // Check if Global Footer Links list exists
      const globalLinksExists = await checkListExists(adminSettings.globalLinksListTitle);
      
      // Check if User Link Selections list exists (for legacy support)
      const userSelectionsExists = await checkListExists('User Link Selections');
      
      setListValidationStatus({
        globalLinksExists,
        userSelectionsExists,
        isValidating: false,
        lastChecked: new Date()
      });
      
      Log.info(LOG_SOURCE, `List validation complete: Global=${globalLinksExists}, UserSelections=${userSelectionsExists}`);
    } catch (error) {
      Log.warn(LOG_SOURCE, `Error in function: ${(error as Error).message}`);
      setListValidationStatus(prev => ({ 
        ...prev, 
        isValidating: false, 
        lastChecked: new Date() 
      }));
    }
  }, [adminSettings.globalLinksListTitle]);

  // Check if a SharePoint list exists
  const checkListExists = useCallback(async (listTitle: string): Promise<boolean> => {
    try {
      if (!context) {
        Log.warn(LOG_SOURCE, 'SharePoint context not available for list checking');
        return false;
      }

      Log.info(LOG_SOURCE, `Checking if list exists: ${listTitle}`);
      
      const webUrl = context.pageContext.web.absoluteUrl;
      const encodedListTitle = encodeURIComponent(listTitle.replace(/'/g, "''"));
      
      const response = await fetch(`${webUrl}/_api/web/lists/getbytitle('${encodedListTitle}')?$select=Title,Id`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });
      
      if (response.status === 404) {
        Log.info(LOG_SOURCE, `List '${listTitle}' does not exist`);
        return false;
      }
      
      if (!response.ok) {
        Log.warn(LOG_SOURCE, `Error checking list '${listTitle}': ${response.status} ${response.statusText}`);
        return false;
      }
      
      const result = await response.json();
      const listExists = result.d && result.d.Title;
      
      Log.info(LOG_SOURCE, `List '${listTitle}' exists: ${listExists ? 'Yes' : 'No'}`);
      return !!listExists;
      
    } catch (error) {
      Log.warn(LOG_SOURCE, `Failed to check if list '${listTitle}' exists: ${(error as Error).message}`);
      return false;
    }
  }, [context]);



  // Update organization link (real-time update)


  // Create SharePoint lists automatically
  const createSharePointLists = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Create Global Footer Links list
      const globalLinksListCreated = await createGlobalLinksListSchema();
      
      if (globalLinksListCreated) {
        Log.info(LOG_SOURCE, 'Successfully created Global Footer Links list');
        setMyLinksSaved(true);
        toast.showSuccess('Global Footer Links list created successfully!', 4000);
        setSafeTimeout(() => setMyLinksSaved(null), 3000);
      }
      
    } catch (error) {
      Log.warn(LOG_SOURCE, `Error in function: ${(error as Error).message}`);
      setMyLinksSaved(false);
      setSafeTimeout(() => setMyLinksSaved(null), 4000);
    } finally {
      setIsLoading(false);
    }
  }, [adminSettings.globalLinksListTitle]);

  const createGlobalLinksListSchema = useCallback(async (): Promise<boolean> => {
    try {
      if (!context) {
        Log.warn(LOG_SOURCE, 'SharePoint context not available for list creation');
        return false;
      }

      setLinkOperationStatus(prev => ({ ...prev, isCreating: true, lastOperation: 'Creating SharePoint list on home site...' }));
      
      const listTitle = adminSettings.globalLinksListTitle;
      
      // Determine target site URL - use home site URL if provided, otherwise current site
      let targetSiteUrl: string;
      if (homeSiteUrl) {
        targetSiteUrl = homeSiteUrl;
      } else {
        // Fallback to tenant root URL
        const currentUrl = context.pageContext.web.absoluteUrl;
        const tenantUrl = new URL(currentUrl);
        targetSiteUrl = `${tenantUrl.protocol}//${tenantUrl.hostname}`;
      }
      
      // Create SP instance for the target site (home site)
      const sp = spfi(targetSiteUrl).using(SPFx(context));
      
      Log.info(LOG_SOURCE, `Creating SharePoint list '${listTitle}' on home site: ${targetSiteUrl}`);
      
      // Create the list using PnP JS
      await sp.web.lists.add(listTitle, 'Global footer links managed by administrators', 100, true);
      Log.info(LOG_SOURCE, `List created successfully: ${listTitle} on ${targetSiteUrl}`);
      
      const list = sp.web.lists.getByTitle(listTitle);
      
      // Add the required fields using PnP JS sequentially
      Log.info(LOG_SOURCE, 'Adding fields to SharePoint list...');
      
      try {
        // Footer URL - Hyperlink field
        await list.fields.addUrl('Footer_x0020_URL', {
          Title: 'Footer URL',
          Description: 'The URL destination for the footer link',
          Required: true
        });
        Log.info(LOG_SOURCE, 'Successfully added Footer URL field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Footer URL field: ${(error as Error).message}`);
      }
      
      try {
        // Description - Multiple lines of text
        await list.fields.addMultilineText('Description', {
          Title: 'Description',
          Description: 'Description of the footer link',
          Required: false,
          RichText: false,
          AppendOnly: false
        });
        Log.info(LOG_SOURCE, 'Successfully added Description field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Description field: ${(error as Error).message}`);
      }
      
      try {
        // Icon Name - Single line of text
        await list.fields.addText('Icon_x0020_Name', {
          Title: 'Icon Name',
          Description: 'Fluent UI icon name for the link',
          Required: false,
          MaxLength: 50
        });
        Log.info(LOG_SOURCE, 'Successfully added Icon Name field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Icon Name field: ${(error as Error).message}`);
      }
      
      try {
        // Icon URL - Hyperlink field for custom icons (PNG/colored)
        await list.fields.addUrl('Icon_x0020_URL', {
          Title: 'Icon URL',
          Description: 'URL to custom icon image (PNG, SVG, etc.) - overrides Fluent UI icon',
          Required: false
        });
        Log.info(LOG_SOURCE, 'Successfully added Icon URL field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Icon URL field: ${(error as Error).message}`);
      }
      
      try {
        // Sort Order - Number
        await list.fields.addNumber('Sort_x0020_Order', {
          Title: 'Sort Order',
          Description: 'Display order for the link',
          Required: false,
          MinimumValue: 0,
          MaximumValue: 999
        });
        Log.info(LOG_SOURCE, 'Successfully added Sort Order field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Sort Order field: ${(error as Error).message}`);
      }
      
      try {
        // Category - Single line of text
        await list.fields.addText('Category', {
          Title: 'Category',
          Description: 'Category grouping for the link',
          Required: false,
          MaxLength: 50
        });
        Log.info(LOG_SOURCE, 'Successfully added Category field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Category field: ${(error as Error).message}`);
      }
      
      try {
        // Is Mandatory - Boolean
        await list.fields.addBoolean('Is_x0020_Mandatory', {
          Title: 'Is Mandatory',
          Description: 'Whether this link is mandatory for all users',
          Required: false
        });
        Log.info(LOG_SOURCE, 'Successfully added Is Mandatory field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Is Mandatory field: ${(error as Error).message}`);
      }
      
      try {
        // Is Active - Boolean
        await list.fields.addBoolean('Is_x0020_Active', {
          Title: 'Is Active',
          Description: 'Whether this link is currently active',
          Required: false
        });
        Log.info(LOG_SOURCE, 'Successfully added Is Active field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Is Active field: ${(error as Error).message}`);
      }
      
      try {
        // Target Users - User Multi field
        await list.fields.addUser('Target_x0020_Users', {
          Title: 'Target Users',
          Description: 'Users and groups who can see this link (leave empty for everyone)',
          Required: false
        });
        Log.info(LOG_SOURCE, 'Successfully added Target Users field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Target Users field: ${(error as Error).message}`);
      }
      
      try {
        // Valid From - DateTime
        await list.fields.addDateTime('Valid_x0020_From', {
          Title: 'Valid From',
          Description: 'Date when the link becomes valid',
          Required: false,
          DisplayFormat: 1
        });
        Log.info(LOG_SOURCE, 'Successfully added Valid From field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Valid From field: ${(error as Error).message}`);
      }
      
      try {
        // Valid To - DateTime
        await list.fields.addDateTime('Valid_x0020_To', {
          Title: 'Valid To',
          Description: 'Date when the link expires',
          Required: false,
          DisplayFormat: 1
        });
        Log.info(LOG_SOURCE, 'Successfully added Valid To field');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Failed to add Valid To field: ${(error as Error).message}`);
      }
      
      Log.info(LOG_SOURCE, 'Completed field creation for SharePoint list');
      
      // Add fields to the default view
      try {
        Log.info(LOG_SOURCE, 'Adding fields to default view...');
        const views = await list.views();
        const defaultView = views.find(v => v.DefaultView) || views[0];
        
        if (!defaultView) {
          Log.warn(LOG_SOURCE, 'No default view found');
          throw new Error('No default view found');
        }
        
        const view = list.views.getById(defaultView.Id);
        
        const fieldsToAdd = [
          'Footer_x0020_URL',
          'Description', 
          'Icon_x0020_Name',
          'Icon_x0020_URL',
          'Sort_x0020_Order',
          'Category',
          'Is_x0020_Mandatory',
          'Is_x0020_Active',
          'Target_x0020_Audience',
          'Valid_x0020_From',
          'Valid_x0020_To'
        ];
        
        for (const fieldName of fieldsToAdd) {
          try {
            await view.fields.add(fieldName);
            Log.info(LOG_SOURCE, `Added field '${fieldName}' to default view`);
          } catch (viewError) {
            Log.warn(LOG_SOURCE, `Could not add field '${fieldName}' to view: ${(viewError as Error).message}`);
          }
        }
        
        Log.info(LOG_SOURCE, 'Completed adding fields to default view');
      } catch (error) {
        Log.warn(LOG_SOURCE, `Error updating default view: ${(error as Error).message}`);
      }
      
      // Update list validation status
      setListValidationStatus(prev => ({
        ...prev,
        globalLinksExists: true,
        lastChecked: new Date()
      }));
      
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        isCreating: false, 
        lastOperation: `Successfully created list: ${listTitle}` 
      }));
      
      Log.info(LOG_SOURCE, `SharePoint list created successfully: ${listTitle}`);
      return true;
      
    } catch (error) {
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        isCreating: false, 
        lastOperation: `Failed to create list: ${(error as Error).message}` 
      }));
      Log.warn(LOG_SOURCE, `Error in function: ${(error as Error).message}`);
      return false;
    }
  }, [adminSettings.globalLinksListTitle, context]);

  // Create User Link Selections list
  const createUserSelectionsListSchema = useCallback(async (): Promise<boolean> => {
    try {
      Log.info(LOG_SOURCE, 'Creating User Link Selections list...');
      
      if (footerService && typeof (footerService as any).createUserSelectionsListOnly === 'function') {
        const result = await (footerService as any).createUserSelectionsListOnly();
        if (result) {
          Log.info(LOG_SOURCE, 'User Link Selections list created successfully');
          
          // Update list validation status
          setListValidationStatus(prev => ({
            ...prev,
            userSelectionsExists: true,
            lastChecked: new Date()
          }));
          
          setLinkOperationStatus(prev => ({ 
            ...prev, 
            isCreating: false, 
            lastOperation: 'Successfully created User Link Selections list' 
          }));
          
          return true;
        }
      }
      
      Log.warn(LOG_SOURCE, 'Service does not support User Link Selections list creation');
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        isCreating: false, 
        lastOperation: 'Failed to create User Link Selections list - service not available' 
      }));
      return false;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        isCreating: false, 
        lastOperation: `Failed to create User Link Selections list: ${(error as Error).message}` 
      }));
      return false;
    }
  }, [footerService]);

  // OneDrive JSON storage for user link selections



  // Handle adding new personal link

  // Validate URL format
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Handle saving new personal link
  const handleSavePersonalLink = useCallback(() => {
    if (!newLinkFormData.title.trim()) {
      Log.warn(LOG_SOURCE, 'Title is required');
      return;
    }
    
    if (!newLinkFormData.url.trim()) {
      Log.warn(LOG_SOURCE, 'URL is required');
      return;
    }
    
    if (!isValidUrl(newLinkFormData.url)) {
      Log.warn(LOG_SOURCE, 'Invalid URL format');
      return;
    }

    if (newLinkFormData.title && newLinkFormData.url) {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newLink: IContextualMenuItem = {
        key: `personal-${uniqueId}`,
        name: newLinkFormData.title,
        href: newLinkFormData.url,
        iconProps: { iconName: newLinkFormData.iconName },
        title: newLinkFormData.description,
        target: '_blank',
        data: {
          category: newLinkFormData.category,
          iconUrl: newLinkFormData.iconUrl || undefined
        }
      };
      
      setMyLinks(prev => [...prev, newLink]);
      setShowAddPersonalLinkForm(false);
      setNewLinkFormData({
        title: '',
        url: '',
        description: '',
        iconName: 'Link',
        iconUrl: '',
        category: 'General',
        targetUsers: [],
        isMandatory: false,
        validFrom: '',
        validTo: ''
      });
      // Custom category handling moved to form components
      
      Log.info(LOG_SOURCE, `Added new personal link: ${newLinkFormData.title}`);
    }
  }, [newLinkFormData]);

  // Comprehensive Fluent UI icon list
  // Icon data now handled by IconService  ];

  

  // Handle custom icon upload to SharePoint document library
  

  

  // Handle adding new organization link

  // Handle saving new organization link
  const handleSaveOrganizationLink = useCallback(async () => {
    if (!newLinkFormData.title.trim()) {
      Log.warn(LOG_SOURCE, 'Title is required');
      return;
    }
    
    if (!newLinkFormData.url.trim()) {
      Log.warn(LOG_SOURCE, 'URL is required');
      return;
    }
    
    if (!isValidUrl(newLinkFormData.url)) {
      Log.warn(LOG_SOURCE, 'Invalid URL format');
      return;
    }

    try {
      setLinkOperationStatus(prev => ({ ...prev, isCreating: true, lastOperation: 'Saving organization link...' }));
      
      // Save to SharePoint if service is available
      if (footerService && 'addGlobalLink' in footerService) {
        const globalLink = {
          title: newLinkFormData.title,
          url: newLinkFormData.url,
          description: newLinkFormData.description,
          iconName: newLinkFormData.iconName,
          iconUrl: newLinkFormData.iconUrl || undefined,
          category: newLinkFormData.category,
          isMandatory: newLinkFormData.isMandatory,
          isActive: true,
          order: organizationLinks.length + 1,
          targetUsers: newLinkFormData.targetUsers,
          validFrom: newLinkFormData.validFrom || null,
          validTo: newLinkFormData.validTo || null
        };
        
        const saved = await (footerService as any).addGlobalLink(globalLink);
        if (!saved) {
          Log.warn(LOG_SOURCE, 'Failed to save to SharePoint, adding to local state only');
        } else {
          Log.info(LOG_SOURCE, 'Successfully saved organization link to SharePoint');
        }
      }
      
      // Add to local state for immediate UI update
      const tempId = Date.now();
      const newLink: IContextualMenuItem = {
        key: `org-${tempId}`,
        name: newLinkFormData.title,
        href: newLinkFormData.url,
        iconProps: { iconName: newLinkFormData.iconName },
        title: newLinkFormData.description,
        target: '_blank',
        data: {
          category: newLinkFormData.category,
          iconUrl: newLinkFormData.iconUrl || undefined,
          isMandatory: false,
          id: tempId // Temporary ID until we get the real ID from SharePoint
        }
      };
      
      // Add to both selected links and available links
      setOrganizationLinks(prev => [...prev, newLink]);
      setAllAvailableOrgLinks(prev => [...prev, {
        ...newLink,
        key: `global-${tempId}`
      }]);
      setShowAddOrgLinkForm(false);
      setNewLinkFormData({
        title: '',
        url: '',
        description: '',
        iconName: 'Link',
        iconUrl: '',
        category: 'General',
        targetUsers: [],
        isMandatory: false,
        validFrom: '',
        validTo: ''
      });
      // Custom category handling moved to form components
      
      setLinkOperationStatus(prev => ({ ...prev, isCreating: false, lastOperation: 'Organization link saved successfully' }));
      Log.info(LOG_SOURCE, `Added new organization link: ${newLinkFormData.title}`);
    } catch (error) {
      setLinkOperationStatus(prev => ({ ...prev, isCreating: false, lastOperation: 'Failed to save organization link' }));
      Log.error(LOG_SOURCE, error as Error);
    }
  }, [newLinkFormData, footerService, organizationLinks]);

  // Handle editing personal link


  // Unified link management (opens comprehensive dialog)
  const handleUnifiedLinkManagement = useCallback(() => {
    setShowLinkManagementDialog(true);
  }, []);

  // User settings are now handled within the LinkManagementDialog
  const handleUserSettings = useCallback(() => {
    setShowLinkManagementDialog(true);
    setActiveTab('settings'); // Open directly to settings tab
  }, []);

  // Close link management dialog
  const closeLinkManagementDialog = useCallback(async () => {
    setShowLinkManagementDialog(false);
    
    // In legacy mode, call the editMyLinks callback with the updated links
    if (legacyMode && editMyLinks) {
      try {
        // Convert current myLinks to the expected format and call the callback
        // This simulates the behavior of the old MyLinksDialog
        await editMyLinks();
        // The callback handles the actual saving, we just need to close
        Log.info(LOG_SOURCE, 'Legacy editMyLinks callback completed');
      } catch (error) {
        Log.error(LOG_SOURCE, error as Error);
      }
    }
  }, [legacyMode, editMyLinks, myLinks]);


  // Removed toggle functionality for compact layout



  // Filtered links based on search
  const filteredAllLinks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    
    return allLinks.filter(link => 
      link.name?.toLowerCase().includes(query) || 
      (link as any).description?.toLowerCase().includes(query) ||
      (link as any).category?.toLowerCase().includes(query)
    );
  }, [allLinks, searchQuery]);

  // Filtered and sorted personal links

  // Get available categories using the categories hook
  const availableCategories = useMemo(() => {
    // Use categories from the categories hook, with fallback to legacy logic
    if (categories.categoryOptions.length > 0) {
      return [
        { key: 'all', text: 'All Categories' },
        ...categories.categoryOptions
      ];
    }
    
    // Fallback to legacy category extraction from links
    const categorySet = new Set<string>();
    
    // Add categories from all available organization links
    allAvailableOrgLinks.forEach(link => {
      const category = (link.data as any)?.category || 'General';
      categorySet.add(category);
    });
    
    // If no categories found, add defaults
    if (categorySet.size === 0) {
      categorySet.add('General');
      categorySet.add('HR');
      categorySet.add('IT');
      categorySet.add('Finance');
      categorySet.add('Business Tools');
      categorySet.add('Professional Development');
    }
    
    return [
      { key: 'all', text: 'All Categories' },
      ...Array.from(categorySet).sort().map(cat => ({ key: cat.toLowerCase(), text: cat }))
    ];
  }, [categories.categoryOptions, allAvailableOrgLinks]);

  // Get available categories from personal links


  // Handle search functionality
  const handleSearchChange = useCallback((_, newValue?: string) => {
    setSearchQuery(newValue || '');
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  }, [showSearch]);

  // Admin panel handlers for modular admin components
  const handleAdminSettingChange = useCallback((key: string, value: any) => {
    setAdminSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);


  // Advanced Admin Functions - moved to BulkOperationsSection component


  // Reset all settings to defaults - moved to admin components

  const resetAllSettings = useCallback(async () => {
    setIsResetConfirmDialogOpen(false);
    try {
        setIsLoading(true);
        setLinkOperationStatus(prev => ({ ...prev, isCreating: true, lastOperation: 'Resetting all settings...' }));
        
        // Reset admin settings to defaults
        const defaultSettings: IAdminSettings = {
          globalLinksListTitle: 'Global Footer Links',
          enableUserSelectionStorage: true,
          maxLinksPerCategory: 10,
          enableSearch: true,
          enableAnimations: true,
          defaultViewMode: 'compact',
          bannerSize: 'medium',
          cacheDurationMinutes: 5,
          enableBackgroundRefresh: false,
          batchSize: 20,
          enableClickTracking: false,
          enablePopularDetection: false,
          popularThreshold: 50,
          restrictAdminFeatures: false,
          linkValidationLevel: 'basic',
          enableLinkExpiration: false,
          customCssClasses: '',
          customJavaScript: '',
          debugMode: false
        };
        
        setAdminSettings(defaultSettings);
        
        setLinkOperationStatus(prev => ({ ...prev, isCreating: false, lastOperation: 'Settings reset to defaults' }));
        Log.info(LOG_SOURCE, 'All settings reset to defaults');
        
      } catch (error) {
        Log.warn(LOG_SOURCE, `Error in function: ${(error as Error).message}`);
        setLinkOperationStatus(prev => ({ ...prev, isCreating: false, lastOperation: 'Failed to reset settings' }));
      } finally {
        setIsLoading(false);
      }
  }, []);

  // Validate all links for accessibility and security - moved to admin components

  // Export analytics moved to BulkOperationsSection

  // Helper function for CSV operations using CSVService - moved to BulkOperationsSection

  // CSV conversion functions moved to services




  // Link validation moved to LinkValidationService

  // Removed gatherAnalyticsData - using analytics.linkStats directly

  // Enhanced bulk export with audience targeting - moved to admin panel

  // Check if current user has access to a link based on target users

  // Filter links based on user access and validity dates





  const getBannerSizeClass = () => {
    switch (adminSettings.bannerSize) {
      case 'small': return styles.bannerSmall;
      case 'large': return styles.bannerLarge;
      default: return '';
    }
  };

  // Helper function for rendering badges
  const renderLinkBadge = (link: IContextualMenuItem): React.ReactNode => {
    return <LinkBadgeRenderer link={link} />;
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Filter links by selected category
  const filteredLinksByCategory = useMemo(() => {
    const allLinks = [...userAccess.filteredOrganizationLinks, ...myLinks];
    
    if (selectedCategory === 'all') {
      return allLinks;
    }
    
    return allLinks.filter(link => {
      const linkCategory = (link.data as any)?.category || 'General';
      return linkCategory.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [userAccess.filteredOrganizationLinks, myLinks, selectedCategory]);

  // Create category options for dropdown
  const categoryDropdownOptions = useMemo(() => {
    const allLinks = [...userAccess.filteredOrganizationLinks, ...myLinks];
    const categorySet = new Set<string>();
    
    // Add 'All' option
    const options = [{ key: 'all', text: 'All Categories' }];
    
    // Extract categories from links
    allLinks.forEach(link => {
      const category = (link.data as any)?.category || 'General';
      categorySet.add(category);
    });
    
    // Add category options
    Array.from(categorySet).sort().forEach(category => {
      options.push({ key: category.toLowerCase(), text: category });
    });
    
    return options;
  }, [userAccess.filteredOrganizationLinks, myLinks]);

  return (
    <footer className={`${styles.modernFooter} ${getBannerSizeClass()}`} role="contentinfo" aria-label="Collaboration footer">
      <div className={styles.footerContainer}>
        <FooterNotifications
          myLinksSaved={myLinksSaved}
          setMyLinksSaved={setMyLinksSaved}
        />

        <div className={styles.footerLayout}>
          {/* Left side: Links content */}
          <div className={styles.linksSection}>
            <FooterSearch
              showSearch={showSearch}
              searchQuery={searchQuery}
              handleSearchChange={handleSearchChange}
              handleSearchClear={handleSearchClear}
              filteredLinks={filteredAllLinks}
              handleLinkClick={handleLinkClickWithAnalytics}
              renderLinkBadge={renderLinkBadge}
            />

            {!showSearch && (
              <FooterContent
                allLinksToDisplay={filteredLinksByCategory}
                handleLinkClick={handleLinkClickWithAnalytics}
                renderLinkBadge={renderLinkBadge}
                isLoading={isLoading}
                userSettings={userSettings.settings}
              />
            )}
          </div>

          {/* Right side: Actions/Settings */}
          <div className={styles.actionsSection}>
            <FooterActions
              showSearch={showSearch}
              toggleSearch={toggleSearch}
              handleUnifiedLinkManagement={handleUnifiedLinkManagement}
              handleUserSettings={handleUserSettings}
              isLoading={isLoading}
              isAdmin={isAdmin}
              isInEditMode={isInEditMode}
              sharePointTheme={sharePointTheme}
              selectedCategory={selectedCategory}
              categoryOptions={categoryDropdownOptions}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* Admin Panel functionality now integrated into the Manage Links dialog Admin tab */}

        {/* Comprehensive Link Management Dialog */}
        {/* Modular Link Management Dialog replaces entire Panel */}
        <LinkManagementDialog
          isOpen={showLinkManagementDialog}
          onClose={closeLinkManagementDialog}
          context={context as any}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          
          // Personal Links
          personalLinks={myLinks}
          onPersonalLinksChange={setMyLinks}
          personalLinksState={{
            searchQuery: personalLinksSearchQuery,
            selectedCategory: personalLinksSelectedCategory,
            sortBy: personalLinksSortBy,
            sortDirection: personalLinksSortDirection
          }}
          onPersonalLinksStateChange={(state) => {
            setPersonalLinksSearchQuery(state.searchQuery);
            setPersonalLinksSelectedCategory(state.selectedCategory);
            setPersonalLinksSortBy(state.sortBy);
            setPersonalLinksSortDirection(state.sortDirection);
          }}
          
          // Organization Links
          organizationLinks={organizationLinks}
          allAvailableOrgLinks={allAvailableOrgLinks}
          onOrganizationLinksChange={setOrganizationLinks}
          organizationLinksState={{
            searchQuery: organizationSearchQuery,
            selectedCategory: selectedCategory,
            sortBy: sortBy,
            sortDirection: sortDirection,
            currentPage: currentPage,
            itemsPerPage: itemsPerPage
          }}
          onOrganizationLinksStateChange={(state) => {
            setOrganizationSearchQuery(state.searchQuery);
            setSelectedCategory(state.selectedCategory);
            setSortBy(state.sortBy);
            setSortDirection(state.sortDirection);
            setCurrentPage(state.currentPage);
          }}
          
          // Forms
          showAddPersonalLinkForm={showAddPersonalLinkForm}
          showAddOrgLinkForm={showAddOrgLinkForm}
          newLinkFormData={newLinkFormData}
          onShowAddPersonalLinkForm={setShowAddPersonalLinkForm}
          onShowAddOrgLinkForm={setShowAddOrgLinkForm}
          onNewLinkFormDataChange={setNewLinkFormData}
          onSavePersonalLink={handleSavePersonalLink}
          onSaveOrganizationLink={handleSaveOrganizationLink}
          
          // Admin
          isAdmin={isAdmin}
          adminSettings={adminSettings}
          onAdminSettingChange={handleAdminSettingChange}
          listValidationStatus={listValidationStatus}
          linkOperationStatus={linkOperationStatus}
          
          // Misc
          legacyMode={legacyMode}
          isLoading={isLoading}
          availableCategories={availableCategories}
          
          onLinksImported={handleLinksImported}
          onStatusUpdate={handleStatusUpdate}
          onCategoriesChanged={() => {
            categories.refreshCategories();
            setSelectedCategory('all');
            setPersonalLinksSelectedCategory('all');
          }}
          
          // SharePoint operations
          onCreateGlobalLinksList={createSharePointLists}
          onCreateUserSelectionsList={async () => { await createUserSelectionsListSchema(); }}
          onValidateLists={validateSharePointLists}
          
          // User Settings
          onUserSettingsChanged={(newSettings) => {
            userSettings.updateSettings(newSettings);
            toast.showSuccess('Settings saved successfully!');
          }}
          currentUserSettings={userSettings.settings}
        />
        
        {/* User Settings Panel is now integrated into LinkManagementDialog as a tab */}
        
        {/* Old Panel content removed - using modular LinkManagementDialog instead */}
        

        {/* Reset Confirmation Dialog */}
        <Dialog
          hidden={!isResetConfirmDialogOpen}
          onDismiss={() => setIsResetConfirmDialogOpen(false)}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Reset All Settings',
            subText: 'Are you sure you want to reset all settings to defaults? This action cannot be undone.'
          }}
          modalProps={{
            isBlocking: true,
            styles: { main: { maxWidth: 450 } }
          }}
        >
          <DialogFooter>
            <PrimaryButton 
              onClick={resetAllSettings} 
              text="Reset" 
              iconProps={{ iconName: 'Refresh' }}
            />
            <DefaultButton 
              onClick={() => setIsResetConfirmDialogOpen(false)} 
              text="Cancel" 
            />
          </DialogFooter>
        </Dialog>

        {/* Toast Notifications */}
        <ToastContainer 
          messages={toast.messages}
          onDismiss={toast.dismissToast}
        />
      </div>
    </footer>
  );
};

export default ModernCollabFooter;