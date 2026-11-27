import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { matchesTarget, NotificationItem, NotificationType, validateNotification } from './notificationRules';
import { sanitizeMessage } from './safeMessage';
import { checkNotificationSchema } from './schemaChecks';

export interface NotificationRecord {
  id: number;
  item?: NotificationItem;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNotificationType(value: unknown): value is NotificationType {
  return value === 'Notification' || value === 'Warning' || value === 'Error';
}

async function parseItem(value: unknown, collectionUrl: string, currentUrl?: string): Promise<NotificationRecord | undefined> {
  if (!isRecord(value) || typeof value.Id !== 'number') {
    throw new Error('SharePoint returned a notification without a valid item ID.');
  }
  const errors: string[] = [];
  const type: unknown = value.NotificationType;
  const target: unknown = isRecord(value.TargetSiteUrl) ? value.TargetSiteUrl.Url : undefined;
  if (typeof value.Message !== 'string') errors.push('Message is missing.');
  if (!isNotificationType(type)) errors.push('Type is invalid.');
  if (typeof target !== 'string') errors.push('Target URL is missing.');
  if (typeof value.IncludeSubsites !== 'boolean') errors.push('Include subsites is invalid.');
  if (typeof value.IsActive !== 'boolean') errors.push('Active is invalid.');
  if (typeof value.IsModal !== 'boolean') errors.push('Modal is invalid.');
  if (typeof value.IsDismissible !== 'boolean') errors.push('Dismissible is invalid.');
  if (value.StartDateTime !== null && typeof value.StartDateTime !== 'string') errors.push('Start date is invalid.');
  if (value.EndDateTime !== null && typeof value.EndDateTime !== 'string') errors.push('End date is invalid.');
  if (errors.length > 0 || !isNotificationType(type)) return { id: value.Id, errors };

  const message: string = typeof value.Message === 'string' ? value.Message : '';
  const safe = sanitizeMessage(message);
  errors.push(...safe.errors);
  const item: Omit<NotificationItem, 'fingerprint'> = {
    id: value.Id,
    message: safe.html,
    type,
    targetSiteUrl: typeof target === 'string' ? target : '',
    includeSubsites: value.IncludeSubsites === true,
    isActive: value.IsActive === true,
    isModal: value.IsModal === true,
    isDismissible: value.IsDismissible === true,
    startDateTime: typeof value.StartDateTime === 'string' ? value.StartDateTime : null,
    endDateTime: typeof value.EndDateTime === 'string' ? value.EndDateTime : null
  };
  errors.push(...validateNotification(item, collectionUrl));
  if (errors.length > 0) return { id: value.Id, errors };
  if (currentUrl !== undefined && !matchesTarget(item.targetSiteUrl, currentUrl, collectionUrl, item.includeSubsites)) {
    return undefined;
  }
  const bytes: Uint8Array = new TextEncoder().encode(JSON.stringify([message, type]));
  const digest: ArrayBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const fingerprint: string = Array.from(new Uint8Array(digest), byte => ('0' + byte.toString(16)).slice(-2)).join('');
  return { id: value.Id, item: { ...item, fingerprint }, errors };
}

function sleep(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Request cancelled.', 'AbortError'));
      return;
    }
    let timer: number;
    const abort = (): void => {
      window.clearTimeout(timer);
      reject(new DOMException('Request cancelled.', 'AbortError'));
    };
    timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    signal.addEventListener('abort', abort, { once: true });
  });
}

export class NotificationService {
  public constructor(private readonly client: SPHttpClient, private readonly rootUrl: string) {}

  public getListUrl(): string {
    return `${this.rootUrl.replace(/\/$/, '')}/_api/web/GetList(@list)`;
  }

  public getListParameter(): string {
    const root: URL = new URL(this.rootUrl);
    const listPath: string = `${decodeURIComponent(root.pathname).replace(/\/$/, '')}/Lists/SiteNotifications`;
    const escapedPath: string = encodeURIComponent(listPath.replace(/'/g, "''")).replace(/'/g, '%27');
    return `@list='${escapedPath}'`;
  }

  private async getWithRetry(url: string, signal: AbortSignal): Promise<SPHttpClientResponse> {
    const deadline: number = Date.now() + 30000;
    for (let attempt: number = 0; ; attempt++) {
      const response: SPHttpClientResponse = await this.client.get(url, SPHttpClient.configurations.v1, { signal });
      if (response.ok) return response;
      if ((response.status !== 429 && response.status !== 503) || attempt >= 2) {
        throw new Error(`SharePoint request failed (${response.status}).`);
      }
      const retryAfter: string | null = response.headers.get('Retry-After');
      let delay: number = 1000 * Math.pow(2, attempt);
      if (retryAfter) {
        const seconds: number = Number(retryAfter);
        const date: number = Date.parse(retryAfter);
        if (Number.isFinite(seconds)) delay = Math.max(0, seconds * 1000);
        else if (Number.isFinite(date)) delay = Math.max(0, date - Date.now());
      }
      if (Date.now() + delay > deadline) {
        throw new Error(`SharePoint request failed (${response.status}); retry window exceeded.`);
      }
      await sleep(delay, signal);
    }
  }

  public async load(signal: AbortSignal, activeOnly: boolean, currentUrl?: string): Promise<NotificationRecord[]> {
    const root: URL = new URL(this.rootUrl);
    const select: string = 'Id,Message,NotificationType,TargetSiteUrl,IncludeSubsites,IsActive,IsModal,IsDismissible,StartDateTime,EndDateTime';
    const filter: string = activeOnly ? '&$filter=IsActive%20eq%201' : '';
    let url: string | undefined = `${this.getListUrl()}/items` +
      `?$select=${select}&$top=200${filter}&${this.getListParameter()}`;
    const records: NotificationRecord[] = [];
    while (url) {
      const next: URL = new URL(url, this.rootUrl);
      if (next.origin !== root.origin ||
        !next.pathname.toLowerCase().startsWith(`${root.pathname.replace(/\/$/, '').toLowerCase()}/_api/`)) {
        throw new Error('SharePoint returned an unexpected pagination URL.');
      }
      const response: SPHttpClientResponse = await this.getWithRetry(next.href, signal);
      const payload: unknown = await response.json();
      if (!isRecord(payload) || !Array.isArray(payload.value)) {
        throw new Error('SharePoint returned an unexpected notification list response.');
      }
      const parsed = await Promise.all(payload.value.map((row: unknown) => parseItem(row, this.rootUrl, currentUrl)));
      records.push(...parsed.filter((record): record is NotificationRecord => record !== undefined));
      const nextLink: unknown = payload['@odata.nextLink'] ?? payload['odata.nextLink'];
      if (nextLink !== undefined && typeof nextLink !== 'string') {
        throw new Error('SharePoint returned an invalid pagination link.');
      }
      url = typeof nextLink === 'string' ? nextLink : undefined;
    }
    return records;
  }

  public async checkSchema(signal: AbortSignal): Promise<string[]> {
    const listUrl: string = `${this.getListUrl()}?$select=Title,BaseTemplate,EnableVersioning&${this.getListParameter()}`;
    const listResponse: SPHttpClientResponse = await this.getWithRetry(listUrl, signal);
    const list: unknown = await listResponse.json();
    const select: string = 'InternalName,TypeAsString,Required,Indexed,DefaultValue,SchemaXml,Hidden,ReadOnlyField';
    const url: string = `${this.getListUrl()}/fields?$select=${select}&$top=5000&${this.getListParameter()}`;
    const response: SPHttpClientResponse = await this.getWithRetry(url, signal);
    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.value) ||
      payload['@odata.nextLink'] !== undefined || payload['odata.nextLink'] !== undefined) {
      throw new Error('SharePoint returned incomplete or invalid field metadata.');
    }
    return checkNotificationSchema(list, payload.value);
  }
}
