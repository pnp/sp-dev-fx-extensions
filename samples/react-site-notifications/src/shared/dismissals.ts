import type { NotificationItem } from './notificationRules';

export function dismissalKey(collectionUrl: string, id: number): string {
  const url: URL = new URL(collectionUrl);
  return `site-notifications:dismissal:${url.origin.toLowerCase()}${url.pathname.replace(/\/$/, '').toLowerCase()}:${id}`;
}

export function isDismissed(storage: Storage, collectionUrl: string, item: NotificationItem): boolean {
  const value: string | null = storage.getItem(dismissalKey(collectionUrl, item.id));
  if (value !== null && !/^[a-f0-9]{64}$/.test(value)) {
    throw new Error('Stored notification dismissal is invalid.');
  }
  return item.isDismissible && value === item.fingerprint;
}

export function saveDismissal(storage: Storage, collectionUrl: string, item: NotificationItem): void {
  storage.setItem(dismissalKey(collectionUrl, item.id), item.fingerprint);
}
