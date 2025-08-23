import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import styles from './ModernCollabFooter.module.scss';

export interface IFooterNotificationsProps {
  myLinksSaved: boolean | null;
  setMyLinksSaved: (value: boolean | null) => void;
}

export const FooterNotifications: React.FC<IFooterNotificationsProps> = ({
  myLinksSaved,
  setMyLinksSaved
}) => {
  if (myLinksSaved === null) return null;

  return (
    <div className={styles.notificationBar}>
      <MessageBar
        messageBarType={myLinksSaved ? MessageBarType.success : MessageBarType.error}
        isMultiline={false}
        onDismiss={() => setMyLinksSaved(null)}
        dismissButtonAriaLabel="Close notification"
        styles={{
          root: {
            borderRadius: '4px',
            fontSize: '11px',
            minHeight: '20px',
            padding: '2px 8px',
          }
        }}
      >
        {myLinksSaved ? 'Links saved!' : 'Save failed'}
      </MessageBar>
    </div>
  );
};