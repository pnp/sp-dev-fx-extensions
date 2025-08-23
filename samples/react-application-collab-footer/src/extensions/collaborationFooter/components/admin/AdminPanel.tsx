import * as React from 'react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { ScrollablePane } from '@fluentui/react/lib/ScrollablePane';
import { SharePointConfigSection } from './SharePointConfigSection';
import { DisplaySettingsSection } from './DisplaySettingsSection';
import { PerformanceSection } from './PerformanceSection';
import { AnalyticsSection } from './AnalyticsSection';
import { SecuritySection } from './SecuritySection';
import { AdvancedConfigSection } from './AdvancedConfigSection';
import { BulkOperationsSection } from './BulkOperationsSection';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import styles from './AdminPanel.module.scss';

export interface IAdminPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  adminSettings: any;
  onAdminSettingChange: (key: string, value: any) => void;
  onSaveSettings: () => void;
  onExportAnalyticsData: () => void;
  onResetAllSettings: () => void;
  onValidateAllLinks: () => void;
  organizationLinks: IContextualMenuItem[];
  personalLinks: IContextualMenuItem[];
  onLinksImported: (links: IContextualMenuItem[]) => void;
  onStatusUpdate: (message: string, isError?: boolean) => void;
  isLoading?: boolean;
}

export const AdminPanel: React.FC<IAdminPanelProps> = ({
  isOpen,
  onDismiss,
  adminSettings,
  onAdminSettingChange,
  onSaveSettings,
  onExportAnalyticsData,
  onResetAllSettings,
  onValidateAllLinks,
  organizationLinks,
  personalLinks,
  onLinksImported,
  onStatusUpdate,
  isLoading = false
}) => {
  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.medium}
      headerText="Admin Settings - Collaboration Footer"
      closeButtonAriaLabel="Close admin panel"
      styles={{
        main: { zIndex: 1000 }
      }}
    >
      <div className={styles.adminPanelContent}>
        <ScrollablePane styles={{ root: { height: '100%' } }}>
          <SharePointConfigSection
            adminSettings={adminSettings}
            onAdminSettingChange={onAdminSettingChange}
          />
          
          <DisplaySettingsSection
            adminSettings={adminSettings}
            onAdminSettingChange={onAdminSettingChange}
          />
          
          <PerformanceSection
            adminSettings={adminSettings}
            onAdminSettingChange={onAdminSettingChange}
          />
          
          <AnalyticsSection
            adminSettings={adminSettings}
            onAdminSettingChange={onAdminSettingChange}
            onExportAnalyticsData={onExportAnalyticsData}
          />
          
          <SecuritySection
            adminSettings={adminSettings}
            onAdminSettingChange={onAdminSettingChange}
          />
          
          <BulkOperationsSection
            organizationLinks={organizationLinks}
            personalLinks={personalLinks}
            onLinksImported={onLinksImported}
            onStatusUpdate={onStatusUpdate}
            onResetAllSettings={onResetAllSettings}
            onValidateAllLinks={onValidateAllLinks}
            isLoading={isLoading}
          />
          
          <AdvancedConfigSection
            adminSettings={adminSettings}
            onAdminSettingChange={onAdminSettingChange}
          />
        </ScrollablePane>
        
        <div className={styles.adminActions}>
          <PrimaryButton
            text="Save Settings"
            onClick={onSaveSettings}
            disabled={isLoading}
            styles={{ root: { marginRight: '8px' } }}
          />
          <DefaultButton
            text="Cancel"
            onClick={onDismiss}
            disabled={isLoading}
          />
        </div>
      </div>
    </Panel>
  );
};