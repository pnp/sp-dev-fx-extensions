import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { isThrottled, retryDelayMs } from './throttle';

/** Throttled responses are retried this many times (each wait up to 2 minutes) before giving up. */
const MAX_THROTTLE_RETRIES: number = 8;
const MAX_NETWORK_RETRIES: number = 2;

/**
 * Small SharePoint REST helper for one web.
 * Uses odata=verbose for writes (works for every endpoint used here) and
 * odata=nometadata for reads, with OData-Version 3.0. SPHttpClient's v1
 * configuration rejects an empty OData-Version (it must be 3.0 or 4.0), and
 * 3.0 is the version SharePoint's verbose JSON format belongs to.
 */
export class SpRest {
  private readonly _client: SPHttpClient;
  private readonly _webUrl: string;
  /** Called before each throttling wait, e.g. to tell the user why the job paused. */
  public onThrottle: ((waitMs: number) => void) | undefined;

  constructor(client: SPHttpClient, webUrl: string) {
    this._client = client;
    this._webUrl = webUrl.replace(/\/+$/, '');
  }

  public get webUrl(): string {
    return this._webUrl;
  }

  /** GET returning parsed JSON. Throws on any non-2xx response. */
  public async get<T>(path: string): Promise<T> {
    const response: SPHttpClientResponse = await this._send(() => this._client.get(this._url(path), SPHttpClient.configurations.v1, {
      headers: { 'Accept': 'application/json;odata=nometadata', 'odata-version': '3.0' }
    }));
    return this._json<T>(response, 'GET', path);
  }

  /** GET that returns undefined for 404 instead of throwing. */
  public async tryGet<T>(path: string): Promise<T | undefined> {
    const response: SPHttpClientResponse = await this._send(() => this._client.get(this._url(path), SPHttpClient.configurations.v1, {
      headers: { 'Accept': 'application/json;odata=nometadata', 'odata-version': '3.0' }
    }));
    if (response.status === 404) {
      return undefined;
    }
    return this._json<T>(response, 'GET', path);
  }

  /** POST with an odata=verbose JSON body. */
  public async post<T>(path: string, body?: unknown): Promise<T> {
    const options: ISPHttpClientOptions = {
      headers: body !== undefined
        ? {
          'Accept': 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=verbose',
          'odata-version': '3.0'
        }
        // No body: send no Content-Type either. Action endpoints such as
        // breakroleinheritance(...) reject a JSON content type with an empty
        // body ("Cannot handle the data at position 0").
        : {
          'Accept': 'application/json;odata=nometadata',
          'odata-version': '3.0'
        }
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    const response: SPHttpClientResponse = await this._send(() => this._client.post(this._url(path), SPHttpClient.configurations.v1, options));
    return this._json<T>(response, 'POST', path);
  }

  /** MERGE (update) with an odata=verbose JSON body. */
  public async merge(path: string, body: unknown): Promise<void> {
    const response: SPHttpClientResponse = await this._send(() => this._client.post(this._url(path), SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=verbose',
        'odata-version': '3.0',
        'X-HTTP-Method': 'MERGE',
        'IF-MATCH': '*'
      },
      body: JSON.stringify(body)
    }));
    await this._json<unknown>(response, 'MERGE', path);
  }

  /** DELETE an object. */
  public async del(path: string): Promise<void> {
    const response: SPHttpClientResponse = await this._send(() => this._client.post(this._url(path), SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'odata-version': '3.0',
        'X-HTTP-Method': 'DELETE',
        'IF-MATCH': '*'
      }
    }));
    await this._json<unknown>(response, 'DELETE', path);
  }

  /** Adds a list item using JSON light, so no list item type name is needed. Returns the new item's ID. */
  public async addItem(listTitle: string, fields: { [name: string]: unknown }): Promise<number> {
    const path: string = `/_api/web/lists/getbytitle('${SpRest.quote(listTitle)}')/items`;
    const response: SPHttpClientResponse = await this._send(() => this._client.post(this._url(path), SPHttpClient.configurations.v1, {
      headers: { 'Accept': 'application/json;odata=nometadata', 'Content-Type': 'application/json;odata=nometadata', 'odata-version': '3.0' },
      body: JSON.stringify(fields)
    }));
    const created: { Id: number } = await this._json<{ Id: number }>(response, 'POST', path);
    return created.Id;
  }

  /**
   * Updates a list item using JSON light. With an ETag, the update only
   * succeeds if nobody changed the item since it was read (412 otherwise).
   */
  public async updateItem(listTitle: string, id: number, fields: { [name: string]: unknown }, etag?: string): Promise<void> {
    const path: string = `/_api/web/lists/getbytitle('${SpRest.quote(listTitle)}')/items(${id})`;
    const response: SPHttpClientResponse = await this._send(() => this._client.post(this._url(path), SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'odata-version': '3.0',
        'X-HTTP-Method': 'MERGE',
        'IF-MATCH': etag || '*'
      },
      body: JSON.stringify(fields)
    }));
    await this._json<unknown>(response, 'MERGE', path);
  }

  /**
   * GET with minimal metadata, so items carry their "odata.etag". Also
   * returns SharePoint's current time from the response Date header (falls
   * back to this PC's clock), so callers needn't trust the PC clock.
   */
  public async getWithEtags<T>(path: string): Promise<{ data: T; serverNow: Date }> {
    const response: SPHttpClientResponse = await this._send(() => this._client.get(this._url(path), SPHttpClient.configurations.v1, {
      headers: { 'Accept': 'application/json;odata=minimalmetadata', 'odata-version': '3.0' }
    }));
    const dateHeader: string | null = response.headers.get('Date');
    const serverNow: Date = dateHeader && !isNaN(new Date(dateHeader).getTime()) ? new Date(dateHeader) : new Date();
    return { data: await this._json<T>(response, 'GET', path), serverNow };
  }

  /** Reads a file's text by server-relative URL; undefined if it doesn't exist. */
  public async readFile(serverRelativeUrl: string): Promise<string | undefined> {
    const path: string = `/_api/web/GetFileByServerRelativePath(decodedurl='${SpRest.quote(serverRelativeUrl)}')/$value`;
    const response: SPHttpClientResponse = await this._send(() => this._client.get(this._url(path), SPHttpClient.configurations.v1, {
      headers: { 'odata-version': '3.0' }
    }));
    if (response.status === 404) {
      return undefined;
    }
    const text: string = await response.text();
    if (!response.ok) {
      const error: Error & { status?: number } = new Error(`GET ${path} failed (${response.status}): ${SpRest._errorMessage(text)}`);
      error.status = response.status;
      throw error;
    }
    return text;
  }

  /** Creates or overwrites a file in a folder. */
  public async writeFile(folderServerRelativeUrl: string, fileName: string, content: string): Promise<void> {
    const path: string = `/_api/web/GetFolderByServerRelativePath(decodedurl='${SpRest.quote(folderServerRelativeUrl)}')` +
      `/Files/AddUsingPath(decodedurl='${SpRest.quote(fileName)}',overwrite=true)`;
    const response: SPHttpClientResponse = await this._send(() => this._client.post(this._url(path), SPHttpClient.configurations.v1, {
      headers: { 'Accept': 'application/json;odata=nometadata', 'Content-Type': 'application/octet-stream', 'odata-version': '3.0' },
      body: content
    }));
    await this._json<unknown>(response, 'POST', path);
  }

  /** Escapes a value for use inside a single-quoted REST URL segment, e.g. getbytitle('...'). */
  public static quote(value: string): string {
    return encodeURIComponent(value.replace(/'/g, "''"));
  }

  /**
   * Sends a request, waiting and retrying while SharePoint throttles (429/503,
   * honouring Retry-After) and retrying network failures a couple of times.
   * Any other response is returned as-is for the caller to handle.
   */
  private async _send(call: () => Promise<SPHttpClientResponse>): Promise<SPHttpClientResponse> {
    let networkFailures: number = 0;
    for (let attempt = 1; ; attempt++) {
      let response: SPHttpClientResponse;
      try {
        response = await call();
      } catch (error) {
        if (++networkFailures > MAX_NETWORK_RETRIES) {
          throw error;
        }
        await SpRest._sleep(retryDelayMs(undefined, attempt, new Date().getTime()));
        continue;
      }
      if (!isThrottled(response.status) || attempt > MAX_THROTTLE_RETRIES) {
        return response;
      }
      const wait: number = retryDelayMs(response.headers.get('Retry-After') || undefined, attempt, new Date().getTime());
      if (this.onThrottle) {
        this.onThrottle(wait);
      }
      await SpRest._sleep(wait);
    }
  }

  private static _sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve: () => void) => { window.setTimeout(resolve, ms); });
  }

  private _url(path: string): string {
    return this._webUrl + (path.charAt(0) === '/' ? path : '/' + path);
  }

  private async _json<T>(response: SPHttpClientResponse, method: string, path: string): Promise<T> {
    const text: string = await response.text();
    if (!response.ok) {
      const error: Error & { status?: number } = new Error(`${method} ${path} failed (${response.status}): ${SpRest._errorMessage(text)}`);
      error.status = response.status;
      throw error;
    }
    if (!text) {
      return undefined as unknown as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      return undefined as unknown as T;
    }
  }

  private static _errorMessage(text: string): string {
    try {
      const parsed: { error?: { message?: { value?: string } | string }; 'odata.error'?: { message?: { value?: string } } } = JSON.parse(text);
      const error = parsed.error || parsed['odata.error'];
      if (error && error.message) {
        return typeof error.message === 'string' ? error.message : (error.message.value || text);
      }
    } catch {
      // not JSON
    }
    return text.length > 300 ? text.substring(0, 300) + '...' : text;
  }
}
