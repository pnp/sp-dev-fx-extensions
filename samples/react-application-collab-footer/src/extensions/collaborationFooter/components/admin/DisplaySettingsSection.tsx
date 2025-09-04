import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { Text } from '@fluentui/react/lib/Text';
import { useTheme } from '@fluentui/react/lib/Theme';
import styles from './DisplaySettingsSection.module.scss';

export interface IDisplaySettingsSectionProps {
  adminSettings: any;
  onAdminSettingChange: (key: string, value: any) => void;
}

export const DisplaySettingsSection: React.FC<IDisplaySettingsSectionProps> = ({
  adminSettings,
  onAdminSettingChange
}) => {
  const theme = useTheme();

  return (
    <div className={styles.displaySettingsSection}>
      <div className={styles.adminSection}>
        <Text variant="large" className={styles.sectionTitle}>Display Settings</Text>
        
        <TextField
          label="Max Links Per Category"
          type="number"
          value={adminSettings.maxLinksPerCategory?.toString()}
          onChange={(_, value) => onAdminSettingChange('maxLinksPerCategory', parseInt(value || '10'))}
          description="Maximum number of links to display per category"
        />
        
        <Toggle
          label="Enable Search Feature"
          checked={adminSettings.enableSearch}
          onChange={(_, checked) => onAdminSettingChange('enableSearch', checked)}
          onText="Show search button"
          offText="Hide search button"
          styles={{ root: { marginTop: '16px' } }}
        />
        
        <Toggle
          label="Enable Animations"
          checked={adminSettings.enableAnimations}
          onChange={(_, checked) => onAdminSettingChange('enableAnimations', checked)}
          onText="Animated"
          offText="Static"
          styles={{ root: { marginTop: '16px' } }}
        />
        
        <Dropdown
          label="Default View Mode"
          selectedKey={adminSettings.defaultViewMode || 'compact'}
          onChange={(_, option) => onAdminSettingChange('defaultViewMode', option?.key as string)}
          options={[
            { key: 'compact', text: 'Compact Pills' },
            { key: 'dropdown', text: 'Category Dropdowns' },
            { key: 'search', text: 'Search-First' },
            { key: 'mixed', text: 'Mixed (Priority + Dropdowns)' }
          ]}
          styles={{ root: { marginTop: '16px' } }}
        />
        
        <Dropdown
          label="Banner Size"
          selectedKey={adminSettings.bannerSize || 'medium'}
          onChange={(_, option) => onAdminSettingChange('bannerSize', option?.key as string)}
          options={[
            { key: 'small', text: 'Small' },
            { key: 'medium', text: 'Medium (Default)' },
            { key: 'large', text: 'Large' }
          ]}
          styles={{ root: { marginTop: '16px' } }}
        />
        <p style={{ fontSize: '12px', color: theme.palette.neutralSecondary, marginTop: '4px' }}>
          Controls the height and padding of the collaboration footer banner
        </p>
      </div>
    </div>
  );
};