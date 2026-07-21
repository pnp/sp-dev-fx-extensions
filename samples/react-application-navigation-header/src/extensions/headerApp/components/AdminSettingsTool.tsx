import * as React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { Settings24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface IAdminSettingsToolProps {
  strings: IHeaderStrings;
  adminUrl?: string;
  onOpenEditor?: () => void;
}

const AdminSettingsTool: React.FC<IAdminSettingsToolProps> = (props) => {
  const { strings, adminUrl, onOpenEditor } = props;

  const handleClick = React.useCallback((): void => {
    emitNavigationTelemetry({
      action: 'admin-settings-click',
      level: 'service'
    });

    if (onOpenEditor) {
      onOpenEditor();
      return;
    }

    if (adminUrl) {
      window.location.href = sanitizeUrl(adminUrl) || '#';
    }
  }, [onOpenEditor, adminUrl]);

  if (!onOpenEditor && !adminUrl) {
    return null;
  }

  return (
    <div className={styles.headerTool}>
      <Tooltip content={strings.AdminSettingsAriaLabel || 'Administration'} relationship="label">
        <Button
          className={styles.headerToolButton}
          icon={<Settings24Regular />}
          appearance="subtle"
          onClick={handleClick}
          title={strings.AdminSettingsAriaLabel || 'Administration'}
        />
      </Tooltip>
    </div>
  );
};

export default React.memo(AdminSettingsTool);