import { useState, useCallback } from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Log } from '@microsoft/sp-core-library';
import { CSVService } from '../services/csvService';

const LOG_SOURCE: string = 'useLinkManagement';

export interface ILinkOperationStatus {
  isLoading: boolean;
  isCreating: boolean;
  lastOperation: string;
  error?: string;
}

export interface ILinkManagementHook {
  // State
  myLinks: IContextualMenuItem[];
  organizationLinks: IContextualMenuItem[];
  linkOperationStatus: ILinkOperationStatus;
  
  // Actions
  setMyLinks: React.Dispatch<React.SetStateAction<IContextualMenuItem[]>>;
  setOrganizationLinks: React.Dispatch<React.SetStateAction<IContextualMenuItem[]>>;
  addPersonalLink: (link: IContextualMenuItem) => void;
  addOrganizationLink: (link: any) => Promise<void>;
  deletePersonalLink: (linkKey: string) => void;
  deleteOrganizationLink: (linkKey: string) => void;
  editPersonalLink: (linkKey: string, updatedLink: IContextualMenuItem) => void;
  validateLink: (link: IContextualMenuItem) => boolean;
  
  // CSV Operations
  exportLinksToCSV: (links: IContextualMenuItem[], filename: string) => void;
  importLinksFromCSV: (onSuccess: (links: IContextualMenuItem[]) => void) => void;
  exportCSVTemplate: () => void;
}

export const useLinkManagement = (
  footerService?: any,
  initialPersonalLinks: IContextualMenuItem[] = [],
  initialOrganizationLinks: IContextualMenuItem[] = []
): ILinkManagementHook => {
  
  const [myLinks, setMyLinks] = useState<IContextualMenuItem[]>(initialPersonalLinks);
  const [organizationLinks, setOrganizationLinks] = useState<IContextualMenuItem[]>(initialOrganizationLinks);
  const [linkOperationStatus, setLinkOperationStatus] = useState<ILinkOperationStatus>({
    isLoading: false,
    isCreating: false,
    lastOperation: ''
  });

  const addPersonalLink = useCallback((link: IContextualMenuItem) => {
    setMyLinks(prev => [...prev, link]);
    Log.info(LOG_SOURCE, `Added personal link: ${link.name}`);
  }, []);

  const addOrganizationLink = useCallback(async (link: any) => {
    try {
      setLinkOperationStatus(prev => ({ ...prev, isCreating: true, lastOperation: 'Adding organization link...' }));
      
      // Save to SharePoint if service is available
      if (footerService && 'addGlobalLink' in footerService) {
        const saved = await footerService.addGlobalLink(link);
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
        name: link.title,
        href: link.url,
        iconProps: { iconName: link.iconName },
        title: link.description,
        target: '_blank',
        data: {
          category: link.category,
          iconUrl: link.iconUrl || undefined,
          isMandatory: link.isMandatory,
          targetUsers: link.targetUsers,
          validFrom: link.validFrom,
          validTo: link.validTo,
          id: tempId
        }
      };
      
      setOrganizationLinks(prev => [...prev, newLink]);
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        isCreating: false, 
        lastOperation: 'Organization link added successfully' 
      }));
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        isCreating: false, 
        lastOperation: `Failed to add organization link: ${(error as Error).message}`,
        error: (error as Error).message
      }));
    }
  }, [footerService]);

  const deletePersonalLink = useCallback((linkKey: string) => {
    const linkToDelete = myLinks.find(link => link.key === linkKey);
    if (linkToDelete) {
      setMyLinks(prev => prev.filter(link => link.key !== linkKey));
      Log.info(LOG_SOURCE, `Deleted personal link: ${linkToDelete.name}`);
    }
  }, [myLinks]);

  const deleteOrganizationLink = useCallback((linkKey: string) => {
    const linkToDelete = organizationLinks.find(link => link.key === linkKey);
    if (linkToDelete) {
      setOrganizationLinks(prev => prev.filter(link => link.key !== linkKey));
      Log.info(LOG_SOURCE, `Deleted organization link: ${linkToDelete.name}`);
    }
  }, [organizationLinks]);

  const editPersonalLink = useCallback((linkKey: string, updatedLink: IContextualMenuItem) => {
    setMyLinks(prev => prev.map(link => 
      link.key === linkKey ? { ...updatedLink, key: linkKey } : link
    ));
    Log.info(LOG_SOURCE, `Updated personal link: ${updatedLink.name}`);
  }, []);

  const validateLink = useCallback((link: IContextualMenuItem): boolean => {
    return CSVService.validateLinkData(link);
  }, []);

  const exportLinksToCSV = useCallback((links: IContextualMenuItem[], filename: string) => {
    try {
      setLinkOperationStatus(prev => ({ ...prev, isLoading: true, lastOperation: 'Exporting links...' }));
      const csvContent = CSVService.convertLinksToCSV(links);
      CSVService.downloadCSVFile(csvContent, filename);
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastOperation: `Exported ${links.length} links successfully` 
      }));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastOperation: `Failed to export links: ${(error as Error).message}`,
        error: (error as Error).message
      }));
    }
  }, []);

  const importLinksFromCSV = useCallback((onSuccess: (links: IContextualMenuItem[]) => void) => {
    try {
      setLinkOperationStatus(prev => ({ ...prev, isLoading: true, lastOperation: 'Importing links...' }));
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.csv';
      fileInput.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
          const csvText = await file.text();
          const importedLinks = CSVService.parseCSVToLinks(csvText);
          
          const validLinks = importedLinks.filter(link => CSVService.validateLinkData(link));
          const invalidCount = importedLinks.length - validLinks.length;
          
          onSuccess(validLinks);
          
          setLinkOperationStatus(prev => ({ 
            ...prev, 
            isLoading: false, 
            lastOperation: `Import completed: ${validLinks.length} valid links imported${invalidCount > 0 ? `, ${invalidCount} invalid links skipped` : ''}` 
          }));
          
        } catch (error) {
          Log.error(LOG_SOURCE, error as Error);
          setLinkOperationStatus(prev => ({ 
            ...prev, 
            isLoading: false, 
            lastOperation: `Failed to import links: ${(error as Error).message}`,
            error: (error as Error).message
          }));
        }
      };
      
      fileInput.click();
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastOperation: `Failed to import links: ${(error as Error).message}`,
        error: (error as Error).message
      }));
    }
  }, []);

  const exportCSVTemplate = useCallback(() => {
    try {
      const templateContent = CSVService.generateImportTemplate();
      CSVService.downloadCSVFile(templateContent, 'footer-links-import-template.csv');
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        lastOperation: 'CSV import template downloaded successfully' 
      }));
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      setLinkOperationStatus(prev => ({ 
        ...prev, 
        lastOperation: `Failed to generate template: ${(error as Error).message}`,
        error: (error as Error).message
      }));
    }
  }, []);

  return {
    // State
    myLinks,
    organizationLinks,
    linkOperationStatus,
    
    // Actions
    setMyLinks,
    setOrganizationLinks,
    addPersonalLink,
    addOrganizationLink,
    deletePersonalLink,
    deleteOrganizationLink,
    editPersonalLink,
    validateLink,
    
    // CSV Operations
    exportLinksToCSV,
    importLinksFromCSV,
    exportCSVTemplate
  };
};