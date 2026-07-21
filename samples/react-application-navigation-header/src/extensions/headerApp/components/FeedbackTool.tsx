import * as React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { Emoji24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface IFeedbackToolProps {
  strings: IHeaderStrings;
  feedbackUrl?: string;
}

const FeedbackTool: React.FC<IFeedbackToolProps> = (props) => {
  const { strings, feedbackUrl } = props;

  if (!feedbackUrl) {
    return null;
  }

  return (
    <div className={styles.headerTool}>
      <Tooltip content={strings.FeedbackAriaLabel || 'Feedback'} relationship="label">
        <Button
          className={styles.headerToolButton}
          icon={<Emoji24Regular />}
          appearance="subtle"
          onClick={(): void => {
            emitNavigationTelemetry({
              action: 'feedback-click',
              level: 'service'
            });
            window.open(sanitizeUrl(feedbackUrl) || '#', '_blank', 'noopener,noreferrer');
          }}
          title={strings.FeedbackAriaLabel || 'Feedback'}
        />
      </Tooltip>
    </div>
  );
};

export default React.memo(FeedbackTool);
