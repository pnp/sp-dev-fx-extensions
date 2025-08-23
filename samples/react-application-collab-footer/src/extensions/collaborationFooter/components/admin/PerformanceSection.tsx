import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Text } from '@fluentui/react/lib/Text';
import styles from './PerformanceSection.module.scss';

export interface IPerformanceSectionProps {
  adminSettings: any;
  onAdminSettingChange: (key: string, value: any) => void;
}

export const PerformanceSection: React.FC<IPerformanceSectionProps> = ({
  adminSettings,
  onAdminSettingChange
}) => {
  return (
    <div className={styles.performanceSection}>
      <div className={styles.adminSection}>
        <Text variant="large" className={styles.sectionTitle}>Performance & Caching</Text>
        
        <TextField
          label="Cache Duration (minutes)"
          type="number"
          value={(adminSettings.cacheDurationMinutes || 5).toString()}
          onChange={(_, value) => onAdminSettingChange('cacheDurationMinutes', parseInt(value || '5'))}
          description="How long to cache link data locally"
        />
        
        <Toggle
          label="Enable Background Refresh"
          checked={adminSettings.enableBackgroundRefresh || false}
          onChange={(_, checked) => onAdminSettingChange('enableBackgroundRefresh', checked)}
          onText="Auto-refresh enabled"
          offText="Manual refresh only"
          styles={{ root: { marginTop: '16px' } }}
        />
        
        <TextField
          label="Batch Size for Operations"
          type="number"
          value={(adminSettings.batchSize || 20).toString()}
          onChange={(_, value) => onAdminSettingChange('batchSize', parseInt(value || '20'))}
          description="Number of items to process in bulk operations"
          styles={{ root: { marginTop: '16px' } }}
        />
      </div>
    </div>
  );
};