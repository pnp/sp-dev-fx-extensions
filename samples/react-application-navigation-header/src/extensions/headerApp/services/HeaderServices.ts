import { SPHttpClient } from '@microsoft/sp-http';
import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import type { IUserProfile, ISearchResult, IQuickAction, IAppLauncherItem, ILanguageOption, INotification, IBookmark } from '../models/IHeaderServices';
import { parseUrl } from '../utils/url';
import { spGetWithRetry } from '../utils/spHttpRetry';
import { reportError } from '../utils/errorReporting';

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'header-recent-searches';
const SEARCH_SELECT_PROPERTIES = 'Title,Path,Description,HitHighlightedSummary';
const NOTIFICATION_SELECT = 'Id,Title,Created,Link,IsRead';
const BOOKMARK_SELECT = 'Id,Title,URL';

export class HeaderServices {
  private readonly _spHttpClient: SPHttpClient;
  private _currentUserPromise?: Promise<IUserProfile | undefined>;

  public constructor(private readonly _context: ApplicationCustomizerContext) {
    this._spHttpClient = this._context.spHttpClient;
  }

  
  public async getCurrentUser(): Promise<IUserProfile | undefined> {
    if (!this._currentUserPromise) {
      this._currentUserPromise = this._fetchCurrentUser();
    }
    return this._currentUserPromise;
  }

  private async _fetchCurrentUser(): Promise<IUserProfile | undefined> {
    try {
      const response = await spGetWithRetry(
        this._spHttpClient,
        `${this._context.pageContext.web.absoluteUrl}/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=DisplayName,AccountName,Title,Department,UserProfileProperties`
      );

      if (!response.ok) {
        return undefined;
      }

      const profile = await response.json();
      const userProperties = profile?.UserProfileProperties ?? [];
      const getProp = (name: string): string | undefined =>
        userProperties.find((p: { Key: string; Value: string }) => p.Key === name)?.Value || undefined;

      return {
        displayName: profile?.DisplayName || getProp('PreferredName') || 'User',
        avatarUrl: `${this._context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${encodeURIComponent(getProp('AccountName') || this._context.pageContext.user.loginName || '')}`,
        jobTitle: getProp('Title'),
        department: getProp('Department')
      };
    } catch (error: unknown) {
      reportError(error, { action: 'user-profile-load-failed', level: 'service' });
      return {
        displayName: this._context.pageContext.user.displayName || 'User',
        avatarUrl: undefined
      };
    }
  }

  public async search(query: string, scope?: string): Promise<ISearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const searchUrl = `${this._context.pageContext.web.absoluteUrl}/_api/search/query?querytext='${encodeURIComponent(query)}'&rowlimit=10&selectproperties='${SEARCH_SELECT_PROPERTIES}'${scope ? `&sourceid='${scope}'` : ''}`;

    try {
      const response = await spGetWithRetry(this._spHttpClient, searchUrl);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const rows = data?.PrimaryQueryResult?.RelevantResults?.Table?.Rows ?? [];

      return rows.map((row: { Cells: { Key: string; Value: string }[] }) => {
        const getCell = (key: string): string | undefined =>
          row.Cells.find((cell) => cell.Key === key)?.Value;
        return {
          title: getCell('Title') || query,
          url: getCell('Path') || '#',
          description: getCell('Description') || getCell('HitHighlightedSummary')
        };
      });
    } catch (error: unknown) {
      reportError(error, { action: 'search-failed', level: 'service', metadata: { query } });
      return [];
    }
  }

  public getRecentSearches(): string[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
    } catch {

      return [];
    }
  }

  public saveRecentSearch(query: string): void {
    if (typeof window === 'undefined' || !query.trim()) {
      return;
    }

    try {
      const current = this.getRecentSearches().filter((item) => item.toLowerCase() !== query.toLowerCase());
      const next = [query, ...current].slice(0, MAX_RECENT_SEARCHES);
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch { void 0; }
  }

  public parseQuickActions(json: string | undefined): IQuickAction[] {
    return this._parseJsonArray(json);
  }

  public parseAppLauncherItems(json: string | undefined): IAppLauncherItem[] {
    return this._parseJsonArray(json);
  }

  public parseLanguageOptions(supportedLanguages: string | undefined, _defaultLanguage: string | undefined): ILanguageOption[] {
    if (!supportedLanguages) {
      return [
        { code: 'en', label: 'English', shortLabel: 'EN' },
        { code: 'sv', label: 'Svenska', shortLabel: 'SV' }
      ];
    }

    const codes = supportedLanguages.split(',').map((code) => code.trim()).filter((code) => code.length > 0);

    return codes.map((code) => {
      const normalized = code.toLowerCase();
      const label = this._languageLabel(normalized);
      return {
        code: normalized,
        label,
        shortLabel: label.slice(0, 2).toUpperCase()
      };
    });
  }

  private _languageLabel(code: string): string {
    const labels: Record<string, string> = {
      en: 'English',
      sv: 'Svenska',
      de: 'Deutsch',
      es: 'Español',
      fr: 'Français',
      pt: 'Português',
      zh: '中文',
      ja: '日本語',
      ar: 'العربية'
    };

    return labels[code] || code.toUpperCase();
  }

  
  public async getUnreadNotificationCount(listUrl: string | undefined): Promise<number> {
    const apiUrl = this._buildListItemsUrl(listUrl, 'Notifications', '$top=100&$select=Id&$filter=IsRead eq false');
    if (!apiUrl) {
      return 0;
    }

    try {
      const response = await spGetWithRetry(this._spHttpClient, apiUrl);

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      const items = data?.value ?? [];
      return Array.isArray(items) ? items.length : 0;
    } catch (error: unknown) {
      reportError(error, { action: 'unread-notification-count-failed', level: 'service', severity: 'warning' });
      return 0;
    }
  }

  public async getNotifications(listUrl: string | undefined): Promise<INotification[]> {
    const apiUrl = this._buildListItemsUrl(listUrl, 'Notifications', `$top=10&$orderby=Created desc&$select=${NOTIFICATION_SELECT}`);
    if (!apiUrl) {
      return [];
    }

    try {
      const response = await spGetWithRetry(this._spHttpClient, apiUrl);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const items = data?.value ?? [];

      return items.map((item: { Id: number; Title: string; Created: string; Link?: { Url: string }; IsRead?: boolean }) => ({
        id: String(item.Id),
        title: item.Title,
        url: item.Link?.Url,
        isRead: !!item.IsRead,
        createdAt: item.Created
      }));
    } catch (error: unknown) {
      reportError(error, { action: 'notifications-load-failed', level: 'service', severity: 'warning' });
      return [];
    }
  }

  public async getBookmarks(listUrl: string | undefined): Promise<IBookmark[]> {
    const apiUrl = this._buildListItemsUrl(listUrl, 'Bookmarks', `$top=50&$orderby=Title&$select=${BOOKMARK_SELECT}`);
    if (!apiUrl) {
      return this._getLocalBookmarks();
    }

    try {
      const response = await spGetWithRetry(this._spHttpClient, apiUrl);

      if (!response.ok) {
        return this._getLocalBookmarks();
      }

      const data = await response.json();
      const items = data?.value ?? [];

      return items.map((item: { Id: number; Title: string; URL?: { Url: string; Description: string } }) => ({
        id: String(item.Id),
        title: item.Title,
        url: item.URL?.Url || '#'
      }));
    } catch (error: unknown) {
      reportError(error, { action: 'bookmarks-load-failed', level: 'service', severity: 'warning' });
      return this._getLocalBookmarks();
    }
  }

  
  private _buildListItemsUrl(listUrl: string | undefined, listInternalName: string, query: string): string | undefined {
    if (!listUrl) {
      return undefined;
    }

    const parsedUrl = parseUrl(listUrl);
    if (!parsedUrl) {
      return undefined;
    }

    const webServerRelativeUrl = parsedUrl.pathname.replace(/\/+$/, '');
    const listServerRelativeUrl = `${webServerRelativeUrl}/Lists/${listInternalName}`;

    return `${parsedUrl.origin}${webServerRelativeUrl}/_api/web/getList('${encodeURIComponent(listServerRelativeUrl)}')/items?${query}`;
  }

  public saveLocalBookmark(bookmark: IBookmark): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const current = this._getLocalBookmarks().filter((item) => item.url !== bookmark.url);
      const next = [bookmark, ...current].slice(0, 50);
      window.localStorage.setItem('header-bookmarks', JSON.stringify(next));
    } catch { void 0; }
  }

  public removeLocalBookmark(url: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const next = this._getLocalBookmarks().filter((item) => item.url !== url);
      window.localStorage.setItem('header-bookmarks', JSON.stringify(next));
    } catch { void 0; }
  }

  private _getLocalBookmarks(): IBookmark[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem('header-bookmarks');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {

      return [];
    }
  }

  private _parseJsonArray<T>(json: string | undefined): T[] {
    if (!json) {
      return [];
    }

    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error: unknown) {

      reportError(error, { action: 'feature-json-parse-failed', level: 'service', severity: 'warning' });
      return [];
    }
  }
}
