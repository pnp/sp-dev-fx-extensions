import * as React from 'react';
import { Button, Popover, PopoverTrigger, PopoverSurface, Spinner } from '@fluentui/react-components';
import { Alert24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import type { INotification } from '../models/IHeaderServices';
import type { HeaderServices } from '../services/HeaderServices';
import { sanitizeUrl } from '../utils/url';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './HeaderTools.module.scss';

export interface INotificationsToolProps {
  strings: IHeaderStrings;
  services: HeaderServices;
  listUrl?: string;
}

const NotificationsTool: React.FC<INotificationsToolProps> = (props) => {
  const { strings, services, listUrl } = props;
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<INotification[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    let isDisposed = false;

    void services.getUnreadNotificationCount(listUrl).then((count) => {
      if (!isDisposed) {
        setUnreadCount(count);
      }
    });

    return () => {
      isDisposed = true;
    };
  }, [listUrl, services]);

  React.useEffect(() => {
    let isDisposed = false;

    const load = async (): Promise<void> => {
      setIsLoading(true);
      const result = await services.getNotifications(listUrl);
      if (!isDisposed) {

        setNotifications(result);
      }
      setIsLoading(false);
    };

    if (open) {
      void load();
    }

    return () => {
      isDisposed = true;
    };
  }, [open, listUrl, services]);

  const handleOpenChange = React.useCallback((e: unknown, data: { open: boolean }): void => {
    setOpen(data.open);
    if (data.open) {
      emitNavigationTelemetry({
        action: 'notifications-open',
        level: 'service',
        metadata: { count: unreadCount }
      });
    }
  }, [unreadCount]);

  return (
    <div className={styles.headerTool}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger>
          <Button
            className={styles.headerToolButton}
            icon={<Alert24Regular />}
            appearance="subtle"
            onClick={() => setOpen(!open)}
            title={strings.NotificationsAriaLabel || 'Notifications'}
          >
            {unreadCount > 0 ? (
              <span className={styles.notificationBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            ) : null}
          </Button>
        </PopoverTrigger>

        <PopoverSurface className={styles.notificationsCallout}>
          <div className={styles.notificationsContent}>
            <h3 className={styles.calloutTitle}>{strings.NotificationsAriaLabel || 'Notifications'}</h3>
            {isLoading ? (
              <Spinner label={strings.LoadingLabel} size="small" />
            ) : notifications.length === 0 ? (
              <p className={styles.emptyState}>{strings.NotificationsEmptyLabel || 'No new notifications'}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map((notification) => (
                  <a
                    key={notification.id}
                    className={styles.notificationItem}
                    href={sanitizeUrl(notification.url) || '#'}
                    onClick={(): void =>
                      emitNavigationTelemetry({
                        action: 'notification-click',
                        level: 'service',
                        itemId: notification.id,
                        itemLabel: notification.title
                      })
                    }
                  >
                    <span className={styles.notificationTitle}>{notification.title}</span>
                    <span className={styles.notificationTime}>{new Date(notification.createdAt).toLocaleDateString()}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

export default React.memo(NotificationsTool);
