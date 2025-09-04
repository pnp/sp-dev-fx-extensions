import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { Text } from '@fluentui/react/lib/Text';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Icon } from '@fluentui/react/lib/Icon';
import { useTheme } from '@fluentui/react/lib/Theme';
import styles from './SharePointConfigSection.module.scss';

export interface IListValidationStatus {
  globalLinksExists: boolean;
  userSelectionsExists: boolean;
  isValidating: boolean;
  lastChecked: Date | null;
}

export interface ISharePointConfigSectionProps {
  adminSettings: any;
  onAdminSettingChange: (key: string, value: any) => void;
  listValidationStatus?: IListValidationStatus;
  onCreateGlobalLinksList?: () => Promise<void>;
  onCreateUserSelectionsList?: () => Promise<void>;
  onValidateLists?: () => Promise<void>;
  isLoading?: boolean;
}

export const SharePointConfigSection: React.FC<ISharePointConfigSectionProps> = ({
  adminSettings,
  onAdminSettingChange,
  listValidationStatus,
  onCreateGlobalLinksList,
  onCreateUserSelectionsList,
  onValidateLists,
  isLoading = false
}) => {
  const theme = useTheme();

  return (
    <div className={styles.sharePointConfigSection}>
      <div className={styles.adminSection}>
        <Text variant="large" className={styles.sectionTitle}>SharePoint Lists Configuration</Text>
        <TextField
          label="Global Links List Title"
          value={adminSettings.globalLinksListTitle}
          onChange={(_, value) => onAdminSettingChange('globalLinksListTitle', value || '')}
          description="Name of the SharePoint list for global links"
        />
      </div>

      <div className={styles.adminSection}>
        <Text variant="large" className={styles.sectionTitle}>OneDrive User Storage</Text>
        <Toggle
          label="Enable User Selection Storage"
          checked={adminSettings.enableUserSelectionStorage}
          onChange={(_, checked) => onAdminSettingChange('enableUserSelectionStorage', checked)}
          onText="Store in OneDrive"
          offText="Use SharePoint Lists"
          styles={{ root: { marginBottom: '16px' } }}
        />
        <p style={{ fontSize: '12px', color: theme.palette.neutralSecondary }}>
          When enabled, user link selections and preferences are stored as JSON files in their OneDrive for cross-device sync.
        </p>
      </div>

      {/* SharePoint Lists Management Section */}
      {listValidationStatus && (onCreateGlobalLinksList || onCreateUserSelectionsList || onValidateLists) && (
        <div className={styles.adminSection}>
          <Text variant="large" className={styles.sectionTitle}>
            <Icon iconName="SharePointLogo" style={{ marginRight: '8px' }} />
            SharePoint Lists Management
          </Text>
          <Stack tokens={{ childrenGap: 12 }}>
            {onCreateGlobalLinksList && (
              <DefaultButton
                text={listValidationStatus.globalLinksExists ? "✓ Global Links List Ready" : "Create Global Links List"}
                iconProps={{ iconName: listValidationStatus.globalLinksExists ? 'CheckMark' : 'Add' }}
                disabled={listValidationStatus.globalLinksExists || listValidationStatus.isValidating || isLoading}
                onClick={onCreateGlobalLinksList}
                styles={{
                  root: {
                    backgroundColor: listValidationStatus.globalLinksExists ? '#dff6dd' : undefined,
                    borderColor: listValidationStatus.globalLinksExists ? '#107c10' : undefined
                  }
                }}
              />
            )}
            {onCreateUserSelectionsList && (
              <DefaultButton
                text={listValidationStatus.userSelectionsExists ? "✓ User Selections List Ready" : "Create User Selections List"}
                iconProps={{ iconName: listValidationStatus.userSelectionsExists ? 'CheckMark' : 'Add' }}
                disabled={listValidationStatus.userSelectionsExists || listValidationStatus.isValidating || isLoading}
                onClick={onCreateUserSelectionsList}
                styles={{
                  root: {
                    backgroundColor: listValidationStatus.userSelectionsExists ? '#dff6dd' : undefined,
                    borderColor: listValidationStatus.userSelectionsExists ? '#107c10' : undefined
                  }
                }}
              />
            )}
            {onValidateLists && (
              <DefaultButton
                text="Validate Lists Status"
                iconProps={{ iconName: 'Refresh' }}
                onClick={onValidateLists}
                disabled={listValidationStatus.isValidating || isLoading}
              />
            )}
            {listValidationStatus.lastChecked && (
              <Text variant="small" style={{ color: theme.palette.neutralSecondary, fontStyle: 'italic' }}>
                Last checked: {listValidationStatus.lastChecked.toLocaleTimeString()}
              </Text>
            )}
          </Stack>
        </div>
      )}
    </div>
  );
};