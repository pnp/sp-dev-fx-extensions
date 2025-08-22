import * as React from 'react';
import { useState } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Text } from '@fluentui/react/lib/Text';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Icon } from '@fluentui/react/lib/Icon';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { SharePointConfigSection } from './SharePointConfigSection';
import { BulkOperationsSection } from './BulkOperationsSection';
import { AnalyticsSection } from './AnalyticsSection';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CategoriesManagementSection } from './CategoriesManagementSection';
import { AudienceTargetingSection } from './AudienceTargetingSection';
import { PerformanceSection } from './PerformanceSection';
import { DisplaySettingsSection } from './DisplaySettingsSection';
import styles from './AdminNavigationPanel.module.scss';

export interface IAdminNavigationPanelProps {
  context: WebPartContext;
  adminSettings: any;
  onAdminSettingChange: (key: string, value: any) => void;
  listValidationStatus?: {
    globalLinksExists: boolean;
    userSelectionsExists: boolean;
    isValidating: boolean;
    lastChecked: Date | null;
  };
  onCreateGlobalLinksList?: () => Promise<void>;
  onCreateUserSelectionsList?: () => Promise<void>;
  onValidateLists?: () => Promise<void>;
  organizationLinks: IContextualMenuItem[];
  personalLinks: IContextualMenuItem[];
  onLinksImported: (links: IContextualMenuItem[]) => void;
  onStatusUpdate: (message: string, isError?: boolean) => void;
  onCategoriesChanged: () => void;
  isLoading?: boolean;
}


type AdminSection = 
  | 'main' 
  | 'sharepoint' 
  | 'bulk-operations' 
  | 'analytics-config' 
  | 'analytics-dashboard' 
  | 'categories' 
  | 'audience-targeting' 
  | 'performance'
  | 'display-settings';

export const AdminNavigationPanel: React.FC<IAdminNavigationPanelProps> = ({
  context,
  adminSettings,
  onAdminSettingChange,
  listValidationStatus,
  onCreateGlobalLinksList,
  onCreateUserSelectionsList,
  onValidateLists,
  organizationLinks,
  personalLinks,
  onLinksImported,
  onStatusUpdate,
  onCategoriesChanged,
  isLoading = false
}) => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('main');

  const adminSections = [
    {
      key: 'sharepoint',
      title: 'SharePoint Configuration',
      description: 'Configure SharePoint lists and OneDrive storage',
      icon: 'SharePointLogo',
      color: '#0078d4'
    },
    {
      key: 'bulk-operations',
      title: 'Bulk Operations',
      description: 'Import/export links and bulk management',
      icon: 'BulkUpload',
      color: '#107c10'
    },
    {
      key: 'analytics-config',
      title: 'Analytics Configuration',
      description: 'Configure analytics settings and data collection',
      icon: 'AnalyticsReport',
      color: '#5c2d91'
    },
    {
      key: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      description: 'View analytics data and usage statistics',
      icon: 'BarChart4',
      color: '#d83b01'
    },
    {
      key: 'categories',
      title: 'Categories Management',
      description: 'Create and manage link categories',
      icon: 'Tag',
      color: '#8764b8'
    },
    {
      key: 'audience-targeting',
      title: 'Audience Targeting',
      description: 'Configure user and group targeting for links',
      icon: 'People',
      color: '#00bcf2'
    },
    {
      key: 'performance',
      title: 'Performance Settings',
      description: 'Configure caching and performance options',
      icon: 'FastMode',
      color: '#00b7c3'
    },
    {
      key: 'display-settings',
      title: 'Display & Appearance',
      description: 'Customize footer size, layout, and visual settings',
      icon: 'Design',
      color: '#e3008c'
    }
  ];

  const renderMainNavigation = () => (
    <div className={styles.mainNavigation}>
      <div className={styles.navigationHeader}>
        <Text variant="xLarge" className={styles.title}>Admin Panel</Text>
        <Text variant="medium" className={styles.description}>
          Manage your collaboration footer settings and features
        </Text>
      </div>
      
      <div className={styles.navigationGrid}>
        {adminSections.map(section => (
          <div 
            key={section.key}
            className={styles.navigationCard}
            onClick={() => setCurrentSection(section.key as AdminSection)}
          >
            <div 
              className={styles.cardIcon}
              style={{ backgroundColor: section.color }}
            >
              <Icon iconName={section.icon} />
            </div>
            <div className={styles.cardContent}>
              <Text variant="mediumPlus" className={styles.cardTitle}>
                {section.title}
              </Text>
              <Text variant="small" className={styles.cardDescription}>
                {section.description}
              </Text>
            </div>
            <Icon iconName="ChevronRight" className={styles.cardArrow} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSectionHeader = (title: string, description: string) => (
    <div className={styles.sectionHeader}>
      <DefaultButton
        iconProps={{ iconName: 'Back' }}
        text="Back to Admin Panel"
        onClick={() => setCurrentSection('main')}
        className={styles.backButton}
      />
      <div className={styles.sectionTitleContainer}>
        <Text variant="xLarge" className={styles.sectionTitle}>{title}</Text>
        <Text variant="medium" className={styles.sectionDescription}>{description}</Text>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'main':
        return renderMainNavigation();

      case 'sharepoint':
        return (
          <div>
            {renderSectionHeader('SharePoint Configuration', 'Configure SharePoint lists and OneDrive storage')}
            <SharePointConfigSection
              adminSettings={adminSettings}
              onAdminSettingChange={onAdminSettingChange}
              listValidationStatus={listValidationStatus}
              onCreateGlobalLinksList={onCreateGlobalLinksList}
              onCreateUserSelectionsList={onCreateUserSelectionsList}
              onValidateLists={onValidateLists}
              isLoading={isLoading}
            />
          </div>
        );

      case 'bulk-operations':
        return (
          <div>
            {renderSectionHeader('Bulk Operations', 'Import/export links and bulk management')}
            <BulkOperationsSection
              organizationLinks={organizationLinks}
              personalLinks={personalLinks}
              onLinksImported={onLinksImported}
              onStatusUpdate={onStatusUpdate}
              isLoading={isLoading}
            />
          </div>
        );

      case 'analytics-config':
        return (
          <div>
            {renderSectionHeader('Analytics Configuration', 'Configure analytics settings and data collection')}
            <AnalyticsSection
              adminSettings={adminSettings}
              onAdminSettingChange={onAdminSettingChange}
              onExportAnalyticsData={async () => {
                // This will be handled by the parent component
                onStatusUpdate('Analytics export initiated...');
              }}
            />
          </div>
        );

      case 'analytics-dashboard':
        return (
          <div>
            {renderSectionHeader('Analytics Dashboard', 'View analytics data and usage statistics')}
            <AnalyticsDashboard
              context={context}
              onStatusUpdate={onStatusUpdate}
            />
          </div>
        );

      case 'categories':
        return (
          <div>
            {renderSectionHeader('Categories Management', 'Create and manage link categories')}
            <CategoriesManagementSection
              context={context}
              links={[...organizationLinks, ...personalLinks]}
              onStatusUpdate={onStatusUpdate}
              onCategoriesChanged={onCategoriesChanged}
            />
          </div>
        );

      case 'audience-targeting':
        return (
          <div>
            {renderSectionHeader('Audience Targeting', 'Configure user and group targeting for links')}
            <AudienceTargetingSection
              context={context}
              selectedLink={null}
              onUpdateLink={(updatedLink) => {
                onStatusUpdate(`Updated audience targeting for "${updatedLink.name}"`);
              }}
              onStatusUpdate={onStatusUpdate}
            />
          </div>
        );

      case 'performance':
        return (
          <div>
            {renderSectionHeader('Performance Settings', 'Configure caching and performance options')}
            <PerformanceSection
              adminSettings={adminSettings}
              onAdminSettingChange={onAdminSettingChange}
            />
          </div>
        );

      case 'display-settings':
        return (
          <div>
            {renderSectionHeader('Display & Appearance', 'Customize footer size, layout, and visual settings')}
            <DisplaySettingsSection
              adminSettings={adminSettings}
              onAdminSettingChange={onAdminSettingChange}
            />
          </div>
        );

      default:
        return renderMainNavigation();
    }
  };

  return (
    <div className={styles.adminNavigationPanel}>
      {renderCurrentSection()}
    </div>
  );
};