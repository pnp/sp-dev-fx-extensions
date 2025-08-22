import { useState, useEffect, useCallback, useMemo } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { UserAccessService, ICurrentUserInfo, IAccessFilterOptions } from '../services/userAccessService';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'useUserAccess';

export interface IUserAccessHook {
  // User info
  currentUser: ICurrentUserInfo | null;
  isLoadingUser: boolean;
  canManageLinks: boolean;
  
  // Link filtering
  filteredOrganizationLinks: IContextualMenuItem[];
  filteredPersonalLinks: IContextualMenuItem[];
  isFilteringLinks: boolean;
  
  // Methods
  refreshUserInfo: () => Promise<void>;
  filterLinks: (links: IContextualMenuItem[], options?: IAccessFilterOptions) => Promise<IContextualMenuItem[]>;
  shouldShowLink: (link: IContextualMenuItem) => Promise<boolean>;
  getAvailableGroups: () => Promise<Array<{key: string, text: string}>>;
}

export const useUserAccess = (
  context: WebPartContext,
  organizationLinks: IContextualMenuItem[] = [],
  personalLinks: IContextualMenuItem[] = []
): IUserAccessHook => {
  const [currentUser, setCurrentUser] = useState<ICurrentUserInfo | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [canManageLinks, setCanManageLinks] = useState<boolean>(false);
  const [filteredOrganizationLinks, setFilteredOrganizationLinks] = useState<IContextualMenuItem[]>([]);
  const [filteredPersonalLinks, setFilteredPersonalLinks] = useState<IContextualMenuItem[]>([]);
  const [isFilteringLinks, setIsFilteringLinks] = useState<boolean>(false);

  // Load current user info
  const refreshUserInfo = useCallback(async () => {
    if (!context) return;
    
    try {
      setIsLoadingUser(true);
      
      const userInfo = await UserAccessService.getCurrentUserInfo(context);
      setCurrentUser(userInfo);
      
      const managementAccess = await UserAccessService.canManageLinks(context);
      setCanManageLinks(managementAccess);
      
      Log.info(LOG_SOURCE, `Loaded user info: ${userInfo.displayName}, canManage: ${managementAccess}`);
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      setCurrentUser(null);
      setCanManageLinks(false);
    } finally {
      setIsLoadingUser(false);
    }
  }, [context]);

  // Filter links for current user
  const filterLinks = useCallback(async (
    links: IContextualMenuItem[], 
    options?: IAccessFilterOptions
  ): Promise<IContextualMenuItem[]> => {
    if (!context || !links.length) return links;
    
    try {
      return await UserAccessService.filterLinksForCurrentUser(links, context, options);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return links; // Return original links if filtering fails
    }
  }, [context]);

  // Check if individual link should be shown
  const shouldShowLink = useCallback(async (link: IContextualMenuItem): Promise<boolean> => {
    if (!context) return true;
    
    try {
      return await UserAccessService.shouldShowLink(link, context);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return true; // Show link if check fails
    }
  }, [context]);

  // Get available SharePoint groups
  const getAvailableGroups = useCallback(async (): Promise<Array<{key: string, text: string}>> => {
    if (!context) return [];
    
    try {
      return await UserAccessService.getAvailableGroups(context);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }, [context]);

  // Load user info on mount
  useEffect(() => {
    refreshUserInfo();
  }, [refreshUserInfo]);

  // Filter organization links when they change or user info changes
  useEffect(() => {
    if (!context || !organizationLinks.length || !currentUser) {
      setFilteredOrganizationLinks(organizationLinks);
      return;
    }

    const filterOrganizationLinks = async () => {
      setIsFilteringLinks(true);
      try {
        const filtered = await UserAccessService.getFilteredOrganizationLinks(organizationLinks, context);
        setFilteredOrganizationLinks(filtered);
      } catch (error) {
        Log.error(LOG_SOURCE, error as Error);
        setFilteredOrganizationLinks(organizationLinks);
      } finally {
        setIsFilteringLinks(false);
      }
    };

    filterOrganizationLinks();
  }, [context, organizationLinks, currentUser]);

  // Personal links don't need filtering (user manages their own)
  useEffect(() => {
    setFilteredPersonalLinks(personalLinks);
  }, [personalLinks]);

  // Memoized return value
  const hookValue = useMemo((): IUserAccessHook => ({
    // User info
    currentUser,
    isLoadingUser,
    canManageLinks,
    
    // Link filtering
    filteredOrganizationLinks,
    filteredPersonalLinks,
    isFilteringLinks,
    
    // Methods
    refreshUserInfo,
    filterLinks,
    shouldShowLink,
    getAvailableGroups
  }), [
    currentUser,
    isLoadingUser,
    canManageLinks,
    filteredOrganizationLinks,
    filteredPersonalLinks,
    isFilteringLinks,
    refreshUserInfo,
    filterLinks,
    shouldShowLink,
    getAvailableGroups
  ]);

  return hookValue;
};