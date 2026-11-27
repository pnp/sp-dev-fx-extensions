import * as React from 'react';
import { Modal } from '@fluentui/react/lib/Modal';
import { Log } from '@microsoft/sp-core-library';
import { isDismissed, saveDismissal } from './dismissals';
import { NotificationItem, NotificationType } from './notificationRules';
import styles from './Banner.module.scss';

export interface BannerProps {
  items: NotificationItem[];
  collectionUrl: string;
  preview?: boolean;
}

const typeStyles: Record<NotificationType, string> = {
  Notification: styles.notification,
  Warning: styles.warning,
  Error: styles.error
};

function SeverityIcon({ type }: { type: NotificationType }): React.ReactElement {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {type === 'Warning' ? <path d="M12 3 2 21h20L12 3Z" />
        : type === 'Error' ? <polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" />
          : <circle cx="12" cy="12" r="9" />}
      {type === 'Notification' ? (
        <><path d="M12 11v5" /><path d="M12 8h.01" /></>
      ) : (
        <><path d="M12 9v5" /><path d="M12 17h.01" /></>
      )}
    </svg>
  );
}

function logStorageError(error: unknown): void {
  Log.error('SiteBanner', new Error(`Notification dismissal storage failed: ${error instanceof Error ? error.name : 'unknown error'}.`));
}

function previewMessage(html: string): string {
  const container: HTMLElement = document.createElement('div');
  container.innerHTML = html;
  container.querySelectorAll('a[href]').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('aria-label', `${link.textContent || 'Link'} (opens in new tab)`);
  });
  return container.innerHTML;
}

export function Banner({ items, collectionUrl, preview = false }: BannerProps): React.ReactElement {
  const [hidden, setHidden] = React.useState<Record<number, { fingerprint: string; mode: 'dismiss' | 'card' }>>({});
  const [version, setVersion] = React.useState<number>(0);
  const [warning, setWarning] = React.useState<string>('');
  const titleId: string = React.useId();
  const messageId: string = React.useId();

  React.useEffect(() => {
    if (preview) return;
    const changed = (event: StorageEvent): void => {
      if (event.key === null || event.key.startsWith('site-notifications:dismissal:')) {
        setVersion(value => value + 1);
      }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, [preview]);

  const result = React.useMemo(() => {
    let error: unknown;
    const visible: NotificationItem[] = items.filter(item => {
      const local = hidden[item.id];
      if (local?.fingerprint === item.fingerprint && item.isDismissible && local.mode === 'dismiss') {
        return false;
      }
      if (preview || !item.isDismissible) return true;
      try {
        return !isDismissed(window.localStorage, collectionUrl, item);
      } catch (caught) {
        error = caught;
        return true;
      }
    });
    return { visible, error };
  }, [items, hidden, collectionUrl, preview, version]);

  React.useEffect(() => {
    if (result.error) logStorageError(result.error);
  }, [result.error]);

  const close = (item: NotificationItem): void => {
    if (item.isDismissible && !preview) {
      try {
        saveDismissal(window.localStorage, collectionUrl, item);
        setVersion(value => value + 1);
        return;
      } catch (error) {
        logStorageError(error);
        setWarning('Your dismissal could not be remembered; this notification may return on navigation or reload.');
      }
    }
    setHidden(previous => ({
      ...previous,
      [item.id]: { fingerprint: item.fingerprint, mode: 'dismiss' }
    }));
  };

  const showCard = (item: NotificationItem): void => {
    setHidden(previous => ({ ...previous, [item.id]: { fingerprint: item.fingerprint, mode: 'card' } }));
  };

  const isCard = (item: NotificationItem): boolean => !item.isModal ||
    (hidden[item.id]?.fingerprint === item.fingerprint && hidden[item.id].mode === 'card');
  const cards: NotificationItem[] = result.visible.filter(isCard);
  const modal: NotificationItem | undefined = result.visible.find(item => !isCard(item));
  const content = (item: NotificationItem, asModal: boolean): React.ReactElement => (
    <div className={`${styles.banner} ${typeStyles[item.type]}`}>
      <div className={styles.row}>
        <SeverityIcon type={item.type} />
        <span className={styles.visuallyHidden} id={asModal ? titleId : undefined}>{item.type}: </span>
        <div className={styles.message} id={asModal ? messageId : undefined}
          dangerouslySetInnerHTML={{ __html: preview ? previewMessage(item.message) : item.message }} />
        {item.isDismissible && (
          <button type="button" className={styles.close} onClick={() => asModal ? showCard(item) : close(item)}
            aria-label={asModal ? `Close ${item.type} dialog` : `Dismiss ${item.type} notification`}>
            <span aria-hidden="true">{'\u00d7'}</span>
          </button>
        )}
      </div>
      {asModal && !item.isDismissible && (
        <button type="button" className={styles.action} onClick={() => showCard(item)}
          aria-label={`OK, ${item.type} notification`}>
          OK
        </button>
      )}
    </div>
  );

  return (
    <div className={styles.region}>
      <div role="region" aria-label="Site notifications" aria-live="polite" aria-atomic="false"
        tabIndex={cards.length ? 0 : undefined} className={styles.stack}>
        {cards.map(item => <section key={item.id}>{content(item, false)}</section>)}
      </div>
      {warning && <p role="status" className={styles.warningMessage}>{warning}</p>}
      {modal && (
        <Modal key={modal.id} isOpen isBlocking titleAriaId={titleId} subtitleAriaId={messageId} containerClassName={styles.modal}
          styles={{ main: { backgroundColor: 'transparent', boxShadow: 'none', minHeight: 0 } }}>
          <div onKeyDown={event => {
            if (event.key === 'Escape' && modal.isDismissible) {
              event.stopPropagation();
              showCard(modal);
            }
          }}>{content(modal, true)}</div>
        </Modal>
      )}
    </div>
  );
}
