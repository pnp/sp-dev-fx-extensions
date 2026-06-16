import * as React from 'react';
import { Text } from '@fluentui/react/lib/Text';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

import type { InspectionError } from '../../models/inspection-error';
import strings from 'AccessLensCommandSetStrings';
import styles from './InspectionStateMessage.module.scss';

export interface IInspectionStateMessageProps {
  loadState: 'loading' | 'loaded' | 'failed';
  errors: InspectionError[];
  isPartial: boolean;
}

function getErrorMessageBarType(error: InspectionError): MessageBarType {
  if (!error.recoverable) return MessageBarType.error;
  if (error.statusCode === 401 || error.statusCode === 403) return MessageBarType.warning;
  if (error.statusCode === 429) return MessageBarType.warning;
  return MessageBarType.info;
}

export const InspectionStateMessage: React.FC<IInspectionStateMessageProps> = ({ loadState, errors, isPartial }) => {
  if (loadState === 'loading') {
    return null;
  }

  const hasFatalError = loadState === 'failed' || errors.some(e => !e.recoverable);
  const stateLabel = hasFatalError
    ? strings.InspectionFailed
    : isPartial
      ? strings.InspectionPartial
      : strings.InspectionComplete;

  const mainBarType = hasFatalError
    ? MessageBarType.error
    : isPartial
      ? MessageBarType.warning
      : MessageBarType.success;

  const hasPermissionError = errors.some(
    e => e.statusCode === 401 || e.statusCode === 403
  );

  return (
    <div>
      <Text variant="mediumPlus" block style={{ marginBottom: 8, fontWeight: 600 }}>
        {strings.InspectionStateSectionTitle}
      </Text>
      <MessageBar messageBarType={mainBarType} className={styles.stateMessage}>
        <strong>{stateLabel}</strong>
        {isPartial && (
          <div style={{ marginTop: 4, fontWeight: 'normal' }}>
            {hasPermissionError
              ? strings.PermissionDeniedMessage
              : strings.PartialInspectionMessage}
          </div>
        )}
        {isPartial && (
          <div style={{ marginTop: 4, fontWeight: 'normal', fontStyle: 'italic' }}>
            {strings.NoSafeConclusion}
          </div>
        )}
      </MessageBar>
      {errors.length > 0 && (
        <div className={styles.errorDetails}>
          {errors.map((err, i) => (
            <MessageBar
              key={i}
              messageBarType={getErrorMessageBarType(err)}
              className={styles.errorItem}
            >
              [{err.scope}] {err.message}
            </MessageBar>
          ))}
        </div>
      )}
    </div>
  );
};
