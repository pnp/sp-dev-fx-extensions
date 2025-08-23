import * as React from 'react';
import { useState, Suspense } from 'react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';

// Lazy load admin components to reduce initial bundle size
const AdminNavigationPanel = React.lazy(() => 
  import('../admin/AdminNavigationPanel').then(module => ({ default: module.AdminNavigationPanel }))
);
import { PersonalLinksTab } from './tabs/PersonalLinksTab';
import { OrganizationLinksTab } from './tabs/OrganizationLinksTab';
import { UserSettingsTab } from './tabs/UserSettingsTab';
import { useSafeTimeout } from '../../hooks/useSafeTimeout';
import { IconGallery } from '../shared/IconGallery';
import styles from './LinkManagementDialog.module.scss';

export interface ILinkManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  context: WebPartContext;
  activeTab: string;
  onTabChange: (tab: string) => void;
  
  // Personal Links
  personalLinks: IContextualMenuItem[];
  onPersonalLinksChange: (links: IContextualMenuItem[]) => void;
  personalLinksState: {
    searchQuery: string;
    selectedCategory: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  };
  onPersonalLinksStateChange: (state: any) => void;
  
  // Organization Links
  organizationLinks: IContextualMenuItem[];
  allAvailableOrgLinks: IContextualMenuItem[];
  onOrganizationLinksChange: (links: IContextualMenuItem[]) => void;
  organizationLinksState: {
    searchQuery: string;
    selectedCategory: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    currentPage: number;
    itemsPerPage: number;
  };
  onOrganizationLinksStateChange: (state: any) => void;
  
  // Forms
  showAddPersonalLinkForm: boolean;
  showAddOrgLinkForm: boolean;
  newLinkFormData: any;
  onShowAddPersonalLinkForm: (show: boolean) => void;
  onShowAddOrgLinkForm: (show: boolean) => void;
  onNewLinkFormDataChange: (data: any) => void;
  onSavePersonalLink: () => void;
  onSaveOrganizationLink: () => void;
  onSaveLinks?: (links: IContextualMenuItem[]) => Promise<boolean>;
  
  // Admin
  isAdmin: boolean;
  adminSettings: any;
  onAdminSettingChange: (key: string, value: any) => void;
  listValidationStatus: any;
  linkOperationStatus: any;
  legacyMode: boolean;
  isLoading: boolean;
  availableCategories: any[];
  onLinksImported: (links: IContextualMenuItem[]) => void;
  onStatusUpdate: (message: string, isError?: boolean) => void;
  onCategoriesChanged: () => void;
  
  // SharePoint operations
  onCreateGlobalLinksList: () => Promise<void>;
  onCreateUserSelectionsList: () => Promise<void>;
  onValidateLists: () => Promise<void>;
  
  // User Settings
  onUserSettingsChanged?: (settings: any) => void;
  currentUserSettings?: any;
  
  // Services
  footerService?: any;
}

export const LinkManagementDialog: React.FC<ILinkManagementDialogProps> = ({
  isOpen,
  onClose,
  context,
  activeTab,
  onTabChange,
  personalLinks,
  onPersonalLinksChange,
  personalLinksState,
  onPersonalLinksStateChange,
  organizationLinks,
  allAvailableOrgLinks,
  onOrganizationLinksChange,
  organizationLinksState,
  onOrganizationLinksStateChange,
  showAddPersonalLinkForm,
  showAddOrgLinkForm,
  newLinkFormData,
  onShowAddPersonalLinkForm,
  onShowAddOrgLinkForm,
  onNewLinkFormDataChange,
  onSavePersonalLink,
  onSaveOrganizationLink,
  onSaveLinks,
  isAdmin,
  adminSettings,
  onAdminSettingChange,
  listValidationStatus,
  linkOperationStatus,
  legacyMode,
  isLoading,
  availableCategories,
  onLinksImported,
  onStatusUpdate,
  onCategoriesChanged,
  onCreateGlobalLinksList,
  onCreateUserSelectionsList,
  onValidateLists,
  onUserSettingsChanged,
  currentUserSettings,
  footerService
}) => {
  const { setSafeTimeout } = useSafeTimeout();
  const [showIconGallery, setShowIconGallery] = useState<boolean>(false);

  const handleSaveAndClose = () => {
    // Save all changes and close dialog
    onStatusUpdate('Changes saved successfully');
    setSafeTimeout(() => onStatusUpdate(''), 3000);
    onClose();
  };

  const handleIconSelect = (iconName: string) => {
    onNewLinkFormDataChange({ ...newLinkFormData, iconName });
    setShowIconGallery(false);
    // Prevent the dialog from closing by stopping any event propagation
  };

  return (
    <>
      <Panel
        isOpen={isOpen}
        onDismiss={onClose}
        type={PanelType.large}
        headerText="Manage Links"
        closeButtonAriaLabel="Close"
        className={styles.linkManagementPanel}
        isLightDismiss={true}
        isHiddenOnDismiss={true}
        layerProps={{
          styles: {
            root: {
              zIndex: 1000
            }
          }
        }}
        styles={{
          main: {
            zIndex: 1000
          },
          content: {
            zIndex: 1001
          },
          scrollableContent: {
            zIndex: 1001
          }
        }}
      >
        <div className={styles.panelContent}>
          <div className={styles.pivotContainer}>
            <Pivot
              selectedKey={activeTab}
              onLinkClick={(item) => onTabChange(item?.props.itemKey || 'personal')}
              headersOnly={false}
              getTabId={(itemKey) => `pivot-${itemKey}`}
              styles={{
                root: { marginBottom: '16px' },
                linkIsSelected: { 
                  fontSize: '16px', 
                  fontWeight: '600',
                  borderBottom: '2px solid var(--color-primary)'
                }
              }}
            >
              {/* Personal Links Tab */}
              <PivotItem
                headerText={`Personal Links (${personalLinks.length})`}
                itemKey="personal"
                itemIcon="Contact"
              >
                <PersonalLinksTab
                  links={personalLinks}
                  onLinksChange={onPersonalLinksChange}
                  state={personalLinksState}
                  onStateChange={onPersonalLinksStateChange}
                  showAddForm={showAddPersonalLinkForm}
                  onShowAddForm={onShowAddPersonalLinkForm}
                  newLinkFormData={newLinkFormData}
                  onFormDataChange={onNewLinkFormDataChange}
                  onSave={onSavePersonalLink}
                  availableCategories={availableCategories}
                  onShowIconGallery={() => setShowIconGallery(true)}
                  isLoading={linkOperationStatus.isCreating}
                  onSaveLinks={onSaveLinks}
                  footerService={footerService}
                />
              </PivotItem>

              {/* Organization Links Tab */}
              {!legacyMode && (
                <PivotItem
                  headerText={`Organization Links (${allAvailableOrgLinks.length})`}
                  itemKey="organization"
                  itemIcon="BulkUpload"
                >
                  <OrganizationLinksTab
                    links={organizationLinks}
                    allAvailableLinks={allAvailableOrgLinks}
                    onLinksChange={onOrganizationLinksChange}
                    state={organizationLinksState}
                    onStateChange={onOrganizationLinksStateChange}
                    showAddForm={showAddOrgLinkForm}
                    onShowAddForm={onShowAddOrgLinkForm}
                    newLinkFormData={newLinkFormData}
                    onFormDataChange={onNewLinkFormDataChange}
                    onSave={onSaveOrganizationLink}
                    isAdmin={isAdmin}
                    availableCategories={availableCategories}
                    onShowIconGallery={() => setShowIconGallery(true)}
                    isLoading={linkOperationStatus.isCreating}
                    context={context}
                    footerService={footerService}
                  />
                </PivotItem>
              )}

              {/* User Settings Tab */}
              <PivotItem
                headerText="Settings"
                itemKey="settings"
                itemIcon="Settings"
              >
                <UserSettingsTab
                  context={context}
                  onSettingsChanged={onUserSettingsChanged || (() => {})}
                  currentSettings={currentUserSettings}
                />
              </PivotItem>

              {/* Admin Tab */}
              {isAdmin && !legacyMode && (
                <PivotItem
                  headerText="Admin"
                  itemKey="admin"
                  itemIcon="AdminSettings"
                >
                  <div className={styles.tabContent}>
                    <Suspense fallback={
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                        <Spinner size={SpinnerSize.large} label="Loading admin panel..." />
                      </div>
                    }>
                      <AdminNavigationPanel
                        context={context}
                        adminSettings={adminSettings}
                        onAdminSettingChange={onAdminSettingChange}
                        listValidationStatus={listValidationStatus}
                        onCreateGlobalLinksList={onCreateGlobalLinksList}
                        onCreateUserSelectionsList={onCreateUserSelectionsList}
                        onValidateLists={onValidateLists}
                        organizationLinks={organizationLinks}
                        personalLinks={personalLinks}
                        onLinksImported={onLinksImported}
                        onStatusUpdate={onStatusUpdate}
                        onCategoriesChanged={onCategoriesChanged}
                        isLoading={isLoading}
                      />
                    </Suspense>
                  </div>
                </PivotItem>
              )}
            </Pivot>
          </div>
          
          {/* Dialog Actions */}
          <div className={styles.dialogActions}>
            <PrimaryButton
              text="Save Changes"
              onClick={handleSaveAndClose}
              disabled={linkOperationStatus.isCreating || linkOperationStatus.isUpdating || linkOperationStatus.isDeleting}
              styles={{ root: { marginRight: '8px' } }}
            />
            <DefaultButton
              text="Cancel"
              onClick={onClose}
              disabled={linkOperationStatus.isCreating || linkOperationStatus.isUpdating || linkOperationStatus.isDeleting}
            />
          </div>
        </div>
      </Panel>
      <IconGallery
        isOpen={showIconGallery}
        selectedIcon={newLinkFormData?.iconName}
        onIconSelect={handleIconSelect}
        onCustomIconUpload={(file) => {
          // Handle custom icon upload logic here
        }}
        onClose={() => setShowIconGallery(false)}
      />
    </>
  );
};