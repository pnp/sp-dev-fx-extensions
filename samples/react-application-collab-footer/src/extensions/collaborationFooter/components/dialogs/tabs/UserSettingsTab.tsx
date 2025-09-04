import * as React from 'react';
import { UserSettingsPanel } from '../../settings/UserSettingsPanel';
import { BaseComponentContext } from '@microsoft/sp-component-base';
import { IUserSettings } from '../../../types/UserSettings';
import styles from './UserSettingsTab.module.scss';

export interface IUserSettingsTabProps {
  context: BaseComponentContext;
  onSettingsChanged: (settings: IUserSettings) => void;
  currentSettings?: IUserSettings;
}

export const UserSettingsTab: React.FC<IUserSettingsTabProps> = ({
  context,
  onSettingsChanged,
  currentSettings
}) => {
  return (
    <div className={styles.tabContent}>
      {/* Tab Header */}
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderText}>
          <h3>User Settings</h3>
          <p>Customize how the collaboration footer works for you. Configure display options, behavior, and performance settings.</p>
        </div>
      </div>

      {/* Settings Panel Content */}
      <UserSettingsPanel
        context={context}
        isOpen={true} // Always open when tab is selected
        onDismiss={() => {}} // No-op since it's embedded
        onSettingsChanged={onSettingsChanged}
        currentSettings={currentSettings}
      />
    </div>
  );
};