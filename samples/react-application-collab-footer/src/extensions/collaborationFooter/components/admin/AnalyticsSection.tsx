import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Text } from '@fluentui/react/lib/Text';
import styles from './AnalyticsSection.module.scss';

export interface IAnalyticsSectionProps {
  adminSettings: any;
  onAdminSettingChange: (key: string, value: any) => void;
  onExportAnalyticsData: () => void;
}

export const AnalyticsSection: React.FC<IAnalyticsSectionProps> = ({
  adminSettings,
  onAdminSettingChange,
  onExportAnalyticsData
}) => {
  return (
    <div className={styles.analyticsSection}>
      <div className={styles.adminSection}>
        <Text variant="large" className={styles.sectionTitle}>Analytics & Tracking</Text>
        
        <Toggle
          label="Enable Click Tracking"
          checked={adminSettings.enableClickTracking || false}
          onChange={(_, checked) => onAdminSettingChange('enableClickTracking', checked)}
          onText="Track link usage"
          offText="No analytics"
        />
        
        <Toggle
          label="Popular Links Detection"
          checked={adminSettings.enablePopularDetection || false}
          onChange={(_, checked) => onAdminSettingChange('enablePopularDetection', checked)}
          onText="Auto-detect popular links"
          offText="Manual designation only"
          styles={{ root: { marginTop: '16px' } }}
        />
        
        <TextField
          label="Popular Threshold (clicks)"
          type="number"
          value={(adminSettings.popularThreshold || 50).toString()}
          onChange={(_, value) => onAdminSettingChange('popularThreshold', parseInt(value || '50'))}
          description="Number of clicks needed to mark as popular"
          disabled={!adminSettings.enablePopularDetection}
          styles={{ root: { marginTop: '16px' } }}
        />
        
        <DefaultButton
          text="Export Analytics Data"
          onClick={onExportAnalyticsData}
          disabled={!adminSettings.enableClickTracking}
          iconProps={{ iconName: 'Download' }}
          styles={{ root: { marginTop: '16px' } }}
        />
      </div>
    </div>
  );
};