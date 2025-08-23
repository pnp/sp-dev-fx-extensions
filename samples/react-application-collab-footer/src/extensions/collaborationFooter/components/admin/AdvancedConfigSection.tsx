import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Text } from '@fluentui/react/lib/Text';
import styles from './AdvancedConfigSection.module.scss';

export interface IAdvancedConfigSectionProps {
  adminSettings: any;
  onAdminSettingChange: (key: string, value: any) => void;
}

export const AdvancedConfigSection: React.FC<IAdvancedConfigSectionProps> = ({
  adminSettings,
  onAdminSettingChange
}) => {
  return (
    <div className={styles.advancedConfigSection}>
      <div className={styles.adminSection}>
        <Text variant="large" className={styles.sectionTitle}>Advanced Configuration</Text>
        
        <TextField
          label="Custom CSS Classes"
          multiline
          rows={3}
          value={adminSettings.customCssClasses || ''}
          onChange={(_, value) => onAdminSettingChange('customCssClasses', value || '')}
          description="Additional CSS classes to apply to the footer (space-separated)"
        />
        
        <TextField
          label="Custom JavaScript"
          multiline
          rows={4}
          value={adminSettings.customJavaScript || ''}
          onChange={(_, value) => onAdminSettingChange('customJavaScript', value || '')}
          description="Custom JavaScript to execute after footer initialization"
          styles={{ root: { marginTop: '16px' } }}
        />
        
        <Toggle
          label="Debug Mode"
          checked={adminSettings.debugMode || false}
          onChange={(_, checked) => onAdminSettingChange('debugMode', checked)}
          onText="Verbose logging enabled"
          offText="Standard logging"
          styles={{ root: { marginTop: '16px' } }}
        />
      </div>
    </div>
  );
};