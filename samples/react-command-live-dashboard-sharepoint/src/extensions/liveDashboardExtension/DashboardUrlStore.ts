import { SPHttpClient, type SPHttpClientResponse } from '@microsoft/sp-http';
import type { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';

// Property bag key on the list's root folder where the per-list dashboard URL is persisted.
const PROPERTY_KEY: string = 'LiveDashboardExtension_DashboardUrl';

/**
 * Reads and writes the dashboard URL for a given list, using the list's own
 * property bag (RootFolder/Properties) so each list the command set is deployed
 * to can be configured independently, without redeploying the extension.
 *
 * Writing requires "Manage Lists" permission on the list; callers should treat
 * a failed save as non-fatal (the caller can still use the URL for the current
 * session, it just won't persist for other users).
 */
export default class DashboardUrlStore {
  private _context: ListViewCommandSetContext;
  private _cache: Map<string, string> = new Map();

  constructor(context: ListViewCommandSetContext) {
    this._context = context;
  }

  public async getUrl(listGuid: string): Promise<string | undefined> {
    if (this._cache.has(listGuid)) {
      return this._cache.get(listGuid);
    }

    const webUrl: string = this._context.pageContext.web.absoluteUrl;
    const endpoint: string =
      `${webUrl}/_api/web/lists(guid'${listGuid}')/rootfolder/properties?$select=${PROPERTY_KEY}`;

    try {
      const response: SPHttpClientResponse = await this._context.spHttpClient.get(
        endpoint,
        SPHttpClient.configurations.v1,
        { headers: { Accept: 'application/json;odata=nometadata' } }
      );

      if (!response.ok) {
        return undefined;
      }

      const body: { [key: string]: unknown } = await response.json();
      const value: unknown = body[PROPERTY_KEY];

      if (typeof value === 'string' && value.length > 0) {
        this._cache.set(listGuid, value);
        return value;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Saves the URL to the list's property bag. Returns true if it was persisted,
   * false if the write failed (e.g. insufficient permission).
   */
  public async saveUrl(listGuid: string, url: string): Promise<boolean> {
    this._cache.set(listGuid, url);

    const webUrl: string = this._context.pageContext.web.absoluteUrl;
    const endpoint: string = `${webUrl}/_api/web/lists(guid'${listGuid}')/rootfolder/properties`;

    try {
      const response: SPHttpClientResponse = await this._context.spHttpClient.post(
        endpoint,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept: 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*'
          },
          body: JSON.stringify({
            __metadata: { type: 'SP.PropertyValues' },
            [PROPERTY_KEY]: url
          })
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}
