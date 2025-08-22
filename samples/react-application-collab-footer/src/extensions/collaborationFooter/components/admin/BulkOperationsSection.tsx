import * as React from 'react';
import { useCallback } from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { CSVService } from '../../services/csvService';
import { LinkValidationService } from '../../services/linkValidationService';
import styles from './BulkOperationsSection.module.scss';

export interface IBulkOperationsSectionProps {
  organizationLinks: IContextualMenuItem[];
  personalLinks: IContextualMenuItem[];
  onLinksImported: (links: IContextualMenuItem[]) => void;
  onStatusUpdate: (message: string, isError?: boolean) => void;
  onResetAllSettings?: () => void;
  onValidateAllLinks?: () => void;
  isLoading?: boolean;
}

export const BulkOperationsSection: React.FC<IBulkOperationsSectionProps> = ({
  organizationLinks,
  personalLinks,
  onLinksImported,
  onStatusUpdate,
  onResetAllSettings,
  onValidateAllLinks,
  isLoading = false
}) => {

  const handleImportLinks = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        onStatusUpdate('Importing links from CSV...');
        const csvText = await file.text();
        const importedLinks = CSVService.parseCSVToLinks(csvText);
        
        let validCount = 0;
        let invalidCount = 0;
        const validLinks: IContextualMenuItem[] = [];
        
        for (const link of importedLinks) {
          if (CSVService.validateLinkData(link)) {
            validLinks.push(link);
            validCount++;
          } else {
            invalidCount++;
          }
        }
        
        onLinksImported(validLinks);
        onStatusUpdate(
          `Import completed: ${validCount} links imported${invalidCount > 0 ? `, ${invalidCount} invalid links skipped` : ''}`
        );
        
      } catch (error) {
        onStatusUpdate(`Failed to import links: ${(error as Error).message}`, true);
      }
    };
    
    fileInput.click();
  }, [onLinksImported, onStatusUpdate]);

  const handleExportAllLinks = useCallback(() => {
    try {
      onStatusUpdate('Exporting all links...');
      const allLinks = [...organizationLinks, ...personalLinks];
      const csvContent = CSVService.convertLinksToCSV(allLinks);
      const filename = `footer-all-links-${new Date().toISOString().split('T')[0]}.csv`;
      
      CSVService.downloadCSVFile(csvContent, filename);
      onStatusUpdate(`Exported ${allLinks.length} links successfully`);
      
    } catch (error) {
      onStatusUpdate(`Failed to export links: ${(error as Error).message}`, true);
    }
  }, [organizationLinks, personalLinks, onStatusUpdate]);

  const handleExportWithTargeting = useCallback(() => {
    try {
      onStatusUpdate('Exporting links with audience targeting...');
      const allLinksWithMetadata = [...organizationLinks, ...personalLinks].map(link => ({
        ...link,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        exportDate: new Date().toISOString()
      }));
      
      const csvContent = CSVService.convertLinksToCSV(allLinksWithMetadata);
      const filename = `footer-links-with-targeting-${new Date().toISOString().split('T')[0]}.csv`;
      
      CSVService.downloadCSVFile(csvContent, filename);
      onStatusUpdate(`Exported ${allLinksWithMetadata.length} links with audience targeting data`);
      
    } catch (error) {
      onStatusUpdate(`Failed to export links with targeting: ${(error as Error).message}`, true);
    }
  }, [organizationLinks, personalLinks, onStatusUpdate]);

  const handleExportTemplate = useCallback(() => {
    try {
      const templateContent = CSVService.generateImportTemplate();
      CSVService.downloadCSVFile(templateContent, 'footer-links-import-template.csv');
      onStatusUpdate('CSV import template downloaded successfully');
      
    } catch (error) {
      onStatusUpdate(`Failed to generate template: ${(error as Error).message}`, true);
    }
  }, [onStatusUpdate]);

  const handleValidateAllLinks = useCallback(async () => {
    try {
      onStatusUpdate('Validating all links...');
      const allLinks = [...organizationLinks, ...personalLinks];
      const validationResults = await LinkValidationService.validateAllLinks(allLinks);
      
      const validCount = Array.from(validationResults.values()).filter(result => result.isValid).length;
      const invalidCount = validationResults.size - validCount;
      
      // Generate validation report
      const reportData = LinkValidationService.generateValidationReport(allLinks, validationResults);
      const csvContent = CSVService.convertValidationResultsToCSV(reportData);
      const filename = `link-validation-report-${new Date().toISOString().split('T')[0]}.csv`;
      
      CSVService.downloadCSVFile(csvContent, filename);
      onStatusUpdate(`Validation completed: ${validCount} valid, ${invalidCount} invalid links. Report downloaded.`);
      
    } catch (error) {
      onStatusUpdate(`Failed to validate links: ${(error as Error).message}`, true);
    }
  }, [organizationLinks, personalLinks, onStatusUpdate]);

  const handleExportAnalytics = useCallback(() => {
    try {
      onStatusUpdate('Exporting analytics data...');
      const allLinks = [...organizationLinks, ...personalLinks];
      const analyticsContent = CSVService.exportAnalyticsData(allLinks);
      const filename = `footer-analytics-data-${new Date().toISOString().split('T')[0]}.csv`;
      
      CSVService.downloadCSVFile(analyticsContent, filename);
      onStatusUpdate('Analytics data exported successfully');
      
    } catch (error) {
      onStatusUpdate(`Failed to export analytics: ${(error as Error).message}`, true);
    }
  }, [organizationLinks, personalLinks, onStatusUpdate]);

  return (
    <div className={styles.bulkOperationsSection}>
      <div className={styles.sectionHeader}>
        <Text variant="large" className={styles.sectionTitle}>Bulk Operations</Text>
        <Text variant="medium" className={styles.sectionDescription}>
          Import, export, and manage links in bulk using CSV files
        </Text>
      </div>

      <div className={styles.operationsGrid}>
        {/* Import/Export Operations */}
        <div className={styles.operationGroup}>
          <Text variant="mediumPlus" className={styles.groupTitle}>Import & Export</Text>
          <Stack tokens={{ childrenGap: 8 }}>
            <DefaultButton
              text="Import Links (CSV)"
              iconProps={{ iconName: 'Upload' }}
              onClick={handleImportLinks}
              disabled={isLoading}
              className={styles.operationButton}
            />
            <DefaultButton
              text="Export All Links"
              iconProps={{ iconName: 'Download' }}
              onClick={handleExportAllLinks}
              disabled={isLoading}
              className={styles.operationButton}
            />
            <DefaultButton
              text="Export with Targeting"
              iconProps={{ iconName: 'Group' }}
              onClick={handleExportWithTargeting}
              disabled={isLoading}
              className={styles.operationButton}
              title="Export CSV with full audience targeting data"
            />
            <DefaultButton
              text="Download CSV Template"
              iconProps={{ iconName: 'ExcelDocument' }}
              onClick={handleExportTemplate}
              disabled={isLoading}
              className={styles.operationButton}
              title="Download CSV template with sample data and examples"
            />
          </Stack>
        </div>

        {/* Analytics Operations */}
        <div className={styles.operationGroup}>
          <Text variant="mediumPlus" className={styles.groupTitle}>Analytics & Reports</Text>
          <Stack tokens={{ childrenGap: 8 }}>
            <DefaultButton
              text="Export Analytics"
              iconProps={{ iconName: 'BarChart4' }}
              onClick={handleExportAnalytics}
              disabled={isLoading}
              className={styles.operationButton}
            />
            <DefaultButton
              text="Validate All Links"
              iconProps={{ iconName: 'CheckMark' }}
              onClick={onValidateAllLinks || handleValidateAllLinks}
              disabled={isLoading}
              className={styles.operationButton}
              title="Check all links for accessibility and generate report"
            />
          </Stack>
        </div>
        
        {/* System Operations */}
        <div className={styles.operationGroup}>
          <Text variant="mediumPlus" className={styles.groupTitle}>System Operations</Text>
          <Stack tokens={{ childrenGap: 8 }}>
            {onResetAllSettings && (
              <DefaultButton
                text="Reset All Settings"
                iconProps={{ iconName: 'Refresh' }}
                onClick={onResetAllSettings}
                disabled={isLoading}
                className={styles.operationButton}
                styles={{
                  root: { 
                    borderColor: '#d13438',
                    color: '#d13438'
                  }
                }}
                title="Reset all configuration to default values"
              />
            )}
          </Stack>
        </div>
      </div>

      <div className={styles.linkCounts}>
        <Text variant="medium" className={styles.countText}>
          Organization Links: {organizationLinks.length} | Personal Links: {personalLinks.length} | Total: {organizationLinks.length + personalLinks.length}
        </Text>
      </div>
    </div>
  );
};