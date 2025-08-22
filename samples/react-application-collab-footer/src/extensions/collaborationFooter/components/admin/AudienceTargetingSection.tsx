import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Text } from '@fluentui/react/lib/Text';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { DetailsList, IColumn } from '@fluentui/react/lib/DetailsList';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { UserAccessService, ITargetUser } from '../../services/userAccessService';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import styles from './AudienceTargetingSection.module.scss';

export interface IAudienceTargetingSectionProps {
  context: WebPartContext;
  selectedLink: IContextualMenuItem | null;
  onUpdateLink: (link: IContextualMenuItem) => void;
  onStatusUpdate: (message: string, isError?: boolean) => void;
}

export const AudienceTargetingSection: React.FC<IAudienceTargetingSectionProps> = ({
  context,
  selectedLink,
  onUpdateLink,
  onStatusUpdate
}) => {
  const [availableGroups, setAvailableGroups] = useState<Array<{key: string, text: string}>>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(false);
  const [targetUsers, setTargetUsers] = useState<ITargetUser[]>([]);
  const [validationResults, setValidationResults] = useState<Array<{user: ITargetUser, isValid: boolean, message: string}>>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Load available SharePoint groups
  const loadAvailableGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    try {
      const groups = await UserAccessService.getAvailableGroups(context);
      setAvailableGroups(groups);
    } catch (error) {
      onStatusUpdate(`Failed to load SharePoint groups: ${(error as Error).message}`, true);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [context, onStatusUpdate]);

  // Initialize component
  useEffect(() => {
    loadAvailableGroups();
  }, [loadAvailableGroups]);

  // Update target users when selected link changes
  useEffect(() => {
    if (selectedLink) {
      const linkData = selectedLink as any;
      setTargetUsers(linkData.targetUsers || []);
    } else {
      setTargetUsers([]);
    }
  }, [selectedLink]);

  // Handle people picker changes
  const handleTargetUsersChange = useCallback((items: any[]) => {
    const newTargetUsers: ITargetUser[] = items?.map(item => ({
      id: item.id || item.text || '',
      loginName: item.secondaryText || item.loginName || item.text || '',
      displayName: item.text || '',
      email: item.secondaryText || item.email || ''
    })) || [];
    
    setTargetUsers(newTargetUsers);
  }, []);

  // Validate target users
  const validateTargetUsers = useCallback(async () => {
    if (targetUsers.length === 0) {
      setValidationResults([]);
      return;
    }

    setIsValidating(true);
    try {
      const results = await UserAccessService.validateTargetUsers(targetUsers, context);
      setValidationResults(results);
      
      const validCount = results.filter(r => r.isValid).length;
      const invalidCount = results.length - validCount;
      
      if (invalidCount > 0) {
        onStatusUpdate(`Validation completed: ${validCount} valid, ${invalidCount} invalid users/groups`, invalidCount > validCount);
      } else {
        onStatusUpdate(`All ${validCount} users/groups are valid`);
      }
    } catch (error) {
      onStatusUpdate(`Validation failed: ${(error as Error).message}`, true);
    } finally {
      setIsValidating(false);
    }
  }, [targetUsers, context, onStatusUpdate]);

  // Apply audience targeting to selected link
  const applyAudienceTargeting = useCallback(() => {
    if (!selectedLink) return;

    const updatedLink = {
      ...selectedLink,
      targetUsers: targetUsers
    } as any;

    onUpdateLink(updatedLink);
    onStatusUpdate(`Updated audience targeting for "${selectedLink.name}"`);
  }, [selectedLink, targetUsers, onUpdateLink, onStatusUpdate]);

  // Clear audience targeting
  const clearAudienceTargeting = useCallback(() => {
    if (!selectedLink) return;

    const updatedLink = {
      ...selectedLink,
      targetUsers: []
    } as any;

    setTargetUsers([]);
    onUpdateLink(updatedLink);
    onStatusUpdate(`Cleared audience targeting for "${selectedLink.name}"`);
  }, [selectedLink, onUpdateLink, onStatusUpdate]);

  // Columns for validation results
  const validationColumns: IColumn[] = [
    {
      key: 'displayName',
      name: 'Display Name',
      fieldName: 'displayName',
      minWidth: 150,
      maxWidth: 200,
      onRender: (item) => item.user.displayName
    },
    {
      key: 'loginName',
      name: 'Login Name',
      fieldName: 'loginName',
      minWidth: 200,
      maxWidth: 300,
      onRender: (item) => item.user.loginName
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 80,
      maxWidth: 100,
      onRender: (item) => (
        <Text style={{ color: item.isValid ? '#107c10' : '#d13438' }}>
          {item.isValid ? 'Valid' : 'Invalid'}
        </Text>
      )
    },
    {
      key: 'message',
      name: 'Message',
      fieldName: 'message',
      minWidth: 200,
      onRender: (item) => item.message
    }
  ];

  if (!selectedLink) {
    return (
      <div className={styles.audienceTargetingSection}>
        <MessageBar messageBarType={MessageBarType.info}>
          Select a link from the list to configure audience targeting
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.audienceTargetingSection}>
      <div className={styles.sectionHeader}>
        <Text variant="large" className={styles.sectionTitle}>
          Audience Targeting for "{selectedLink.name}"
        </Text>
        <Text variant="medium" className={styles.sectionDescription}>
          Configure which users and SharePoint groups can see this link
        </Text>
      </div>

      {/* People Picker */}
      <div className={styles.peoplePickerContainer}>
        <PeoplePicker
          context={context as any}
          titleText="Target Users and Groups"
          personSelectionLimit={50}
          groupName=""
          showtooltip={true}
          defaultSelectedUsers={targetUsers.map(u => u.loginName)}
          onChange={handleTargetUsersChange}
          principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
          resolveDelay={1000}
          placeholder="Start typing to search for users or groups..."
        />
      </div>

      {/* Available Groups Quick Add */}
      {!isLoadingGroups && availableGroups.length > 0 && (
        <div className={styles.quickAddSection}>
          <Text variant="medium" className={styles.quickAddTitle}>Quick Add SharePoint Groups:</Text>
          <div className={styles.groupButtons}>
            {availableGroups.slice(0, 6).map(group => (
              <DefaultButton
                key={group.key}
                text={group.text}
                onClick={() => {
                  const groupUser: ITargetUser = {
                    id: group.key,
                    loginName: group.key,
                    displayName: group.text,
                    email: ''
                  };
                  if (!targetUsers.find(u => u.loginName === group.key)) {
                    setTargetUsers([...targetUsers, groupUser]);
                  }
                }}
                disabled={targetUsers.some(u => u.loginName === group.key)}
                className={styles.groupButton}
              />
            ))}
          </div>
        </div>
      )}

      {isLoadingGroups && (
        <div className={styles.loadingContainer}>
          <Spinner size={SpinnerSize.small} label="Loading SharePoint groups..." />
        </div>
      )}

      {/* Current Target Users Summary */}
      {targetUsers.length > 0 && (
        <div className={styles.summarySection}>
          <Text variant="medium" className={styles.summaryTitle}>
            Current Targeting ({targetUsers.length} users/groups):
          </Text>
          <div className={styles.targetUsersList}>
            {targetUsers.map((user, index) => (
              <div key={index} className={styles.targetUserItem}>
                <Text variant="small">{user.displayName}</Text>
                <DefaultButton
                  iconProps={{ iconName: 'Cancel' }}
                  onClick={() => {
                    const updatedUsers = targetUsers.filter((_, i) => i !== index);
                    setTargetUsers(updatedUsers);
                  }}
                  className={styles.removeButton}
                  title="Remove user/group"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Section */}
      {targetUsers.length > 0 && (
        <div className={styles.validationSection}>
          <div className={styles.validationActions}>
            <DefaultButton
              text="Validate Users/Groups"
              iconProps={{ iconName: 'CheckMark' }}
              onClick={validateTargetUsers}
              disabled={isValidating}
            />
            {isValidating && <Spinner size={SpinnerSize.small} />}
          </div>

          {validationResults.length > 0 && (
            <div className={styles.validationResults}>
              <Text variant="medium" className={styles.resultsTitle}>Validation Results:</Text>
              <DetailsList
                items={validationResults}
                columns={validationColumns}
                setKey="validationResults"
                layoutMode={0}
                compact={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <PrimaryButton
          text="Apply Targeting"
          onClick={applyAudienceTargeting}
          disabled={targetUsers.length === 0}
        />
        <DefaultButton
          text="Clear All Targeting"
          onClick={clearAudienceTargeting}
          disabled={!selectedLink.targetUsers || (selectedLink as any).targetUsers?.length === 0}
        />
      </div>

      {/* Help Text */}
      <div className={styles.helpSection}>
        <MessageBar messageBarType={MessageBarType.info}>
          <strong>Audience Targeting Help:</strong>
          <ul>
            <li>Leave empty to show the link to everyone</li>
            <li>Add users by typing their name or email</li>
            <li>Add SharePoint groups for broader targeting</li>
            <li>Use "Validate" to check if users/groups exist</li>
            <li>Mandatory links will be shown regardless of targeting</li>
          </ul>
        </MessageBar>
      </div>
    </div>
  );
};