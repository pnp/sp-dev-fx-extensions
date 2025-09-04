import * as React from 'react';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { Text } from '@fluentui/react/lib/Text';
import styles from './SecuritySection.module.scss';

export interface ISecuritySectionProps {
  adminSettings: any;
  onAdminSettingChange: (key: string, value: any) => void;
}

export const SecuritySection: React.FC<ISecuritySectionProps> = ({
  adminSettings,
  onAdminSettingChange
}) => {
  return (
    <div className={styles.securitySection}>
      <div className={styles.adminSection}>
        <Text variant="large" className={styles.sectionTitle}>Security & Permissions</Text>
        
        <Toggle
          label="Restrict Admin Features"
          checked={adminSettings.restrictAdminFeatures || false}
          onChange={(_, checked) => onAdminSettingChange('restrictAdminFeatures', checked)}
          onText="Site Collection Admins only"
          offText="Site Owners and above"
        />
        
        <Dropdown
          label="Link Validation Level"
          selectedKey={adminSettings.linkValidationLevel || 'basic'}
          onChange={(_, option) => onAdminSettingChange('linkValidationLevel', option?.key as string)}
          options={[
            { key: 'none', text: 'No validation' },
            { key: 'basic', text: 'URL format only' },
            { key: 'strict', text: 'Check URL accessibility' },
            { key: 'enterprise', text: 'Enterprise security scan' }
          ]}
          styles={{ root: { marginTop: '16px' } }}
        />
        
        <Toggle
          label="Enable Link Expiration"
          checked={adminSettings.enableLinkExpiration || false}
          onChange={(_, checked) => onAdminSettingChange('enableLinkExpiration', checked)}
          onText="Auto-hide expired links"
          offText="Manual management"
          styles={{ root: { marginTop: '16px' } }}
        />
      </div>
    </div>
  );
};