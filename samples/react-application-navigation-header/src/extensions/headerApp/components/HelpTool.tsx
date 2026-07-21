import * as React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { Question24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface IHelpToolProps {
  strings: IHeaderStrings;
  helpUrl?: string;
}

const HelpTool: React.FC<IHelpToolProps> = (props) => {
  const { strings, helpUrl } = props;

  if (!helpUrl) {
    return null;
  }

  return (
    <div className={styles.headerTool}>
      <Tooltip content={strings.HelpAriaLabel || 'Help'} relationship="label">
        <Button
          className={styles.headerToolButton}
          icon={<Question24Regular />}
          appearance="subtle"
          onClick={(): void => {
            emitNavigationTelemetry({
              action: 'help-click',
              level: 'service'
            });
            window.open(sanitizeUrl(helpUrl) || '#', '_blank', 'noopener,noreferrer');
          }}
          title={strings.HelpAriaLabel || 'Help'}
        />
      </Tooltip>
    </div>
  );
};

export default React.memo(HelpTool);
