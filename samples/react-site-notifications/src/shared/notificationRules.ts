export type NotificationType = 'Notification' | 'Warning' | 'Error';

export interface NotificationItem {
  id: number;
  message: string;
  type: NotificationType;
  targetSiteUrl: string;
  includeSubsites: boolean;
  isActive: boolean;
  isModal: boolean;
  isDismissible: boolean;
  fingerprint: string;
  startDateTime: string | null;
  endDateTime: string | null;
}

interface NormalizedSiteUrl {
  origin: string;
  segments: string[];
}

function normalizeSiteUrl(value: string): NormalizedSiteUrl | undefined {
  try {
    const url: URL = new URL(value);
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') ||
      url.username || url.password || url.search || url.hash) {
      return undefined;
    }

    const segments: string[] = url.pathname.split('/').filter(Boolean).map(segment => {
      const decoded: string = decodeURIComponent(segment);
      if (decoded.includes('/') || decoded.includes('\\')) {
        throw new Error('Encoded path separator');
      }
      return decoded.toLowerCase();
    });
    return { origin: url.origin.toLowerCase(), segments };
  } catch (error) {
    if (error instanceof URIError || error instanceof TypeError ||
      (error instanceof Error && error.message === 'Encoded path separator')) {
      return undefined;
    }
    throw error;
  }
}

function containsSite(parent: NormalizedSiteUrl, child: NormalizedSiteUrl): boolean {
  return parent.origin === child.origin &&
    parent.segments.length <= child.segments.length &&
    parent.segments.every((segment, index) => segment === child.segments[index]);
}

export function isTargetWithinCollection(targetUrl: string, collectionUrl: string): boolean {
  const target: NormalizedSiteUrl | undefined = normalizeSiteUrl(targetUrl);
  const collection: NormalizedSiteUrl | undefined = normalizeSiteUrl(collectionUrl);
  return !!target && !!collection && containsSite(collection, target);
}

export function matchesTarget(
  targetUrl: string,
  currentUrl: string,
  collectionUrl: string,
  includeSubsites: boolean
): boolean {
  const target: NormalizedSiteUrl | undefined = normalizeSiteUrl(targetUrl);
  const current: NormalizedSiteUrl | undefined = normalizeSiteUrl(currentUrl);
  const collection: NormalizedSiteUrl | undefined = normalizeSiteUrl(collectionUrl);
  if (!target || !current || !collection || !containsSite(collection, target) ||
    !containsSite(collection, current) || !containsSite(target, current)) {
    return false;
  }
  return includeSubsites || target.segments.length === current.segments.length;
}

export function validateNotification(item: Omit<NotificationItem, 'fingerprint'>, collectionUrl: string): string[] {
  const errors: string[] = [];
  if (!item.message.trim()) errors.push('Message is required.');
  if (item.type !== 'Notification' && item.type !== 'Warning' && item.type !== 'Error') {
    errors.push('Notification type is invalid.');
  }
  if (!isTargetWithinCollection(item.targetSiteUrl, collectionUrl)) {
    errors.push('Target URL must be a site URL in this site collection without a query or fragment.');
  }
  const start: number | undefined = item.startDateTime === null ? undefined : Date.parse(item.startDateTime);
  const end: number | undefined = item.endDateTime === null ? undefined : Date.parse(item.endDateTime);
  if (start !== undefined && !Number.isFinite(start)) errors.push('Start date is invalid.');
  if (end !== undefined && !Number.isFinite(end)) errors.push('End date is invalid.');
  if (start !== undefined && end !== undefined && Number.isFinite(start) &&
    Number.isFinite(end) && end <= start) {
    errors.push('End date must be after start date.');
  }
  return errors;
}

export function isScheduled(item: NotificationItem, now: number): boolean {
  const start: number = item.startDateTime === null ? -Infinity : Date.parse(item.startDateTime);
  const end: number = item.endDateTime === null ? Infinity : Date.parse(item.endDateTime);
  return item.isActive && start <= now && now < end;
}

export function nextBoundary(items: NotificationItem[], now: number): number | undefined {
  let next: number | undefined;
  items.forEach(item => {
    if (!item.isActive) return;
    [item.startDateTime, item.endDateTime].forEach(value => {
      if (value === null) return;
      const time: number = Date.parse(value);
      if (Number.isFinite(time) && time > now && (next === undefined || time < next)) next = time;
    });
  });
  return next;
}

const priority: Record<NotificationType, number> = { Error: 0, Warning: 1, Notification: 2 };

export function eligibleNotifications(
  items: NotificationItem[],
  currentUrl: string,
  collectionUrl: string,
  now: number
): NotificationItem[] {
  return items.filter(item => validateNotification(item, collectionUrl).length === 0 &&
    isScheduled(item, now) &&
    matchesTarget(item.targetSiteUrl, currentUrl, collectionUrl, item.includeSubsites))
    .sort((a, b) => priority[a.type] - priority[b.type] || a.id - b.id);
}
