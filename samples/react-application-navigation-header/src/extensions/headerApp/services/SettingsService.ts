import type { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import type { ISettingsFile } from '../models/ISettingsFile';
import { DEFAULT_SETTINGS, mergeSettings } from '../models/ISettingsFile';
import { spGetWithRetry, spPostWithRetry } from '../utils/spHttpRetry';
import { saveFileWithETagConcurrency } from '../utils/spFileConcurrency';
import { isPlainObject, sanitizeNavigationItems } from '../utils/navigationFileValidation';
import { reportError } from '../utils/errorReporting';

const DEFAULT_FILE_NAME = 'settings.json';
const DEFAULT_FOLDER = 'SiteAssets';
const CACHE_TTL_MS = 1000 * 60 * 5;

export class SettingsService {
  private _cachedSettings?: ISettingsFile;
  private _cacheTimestamp: number = 0;
  private _inFlightPromise?: Promise<ISettingsFile>;
  
  private _lastKnownETag?: string;

  public constructor(
    private readonly _context: ApplicationCustomizerContext,
    private readonly _homeUrl: string,
    private readonly _fileName: string = DEFAULT_FILE_NAME,
    private readonly _folder: string = DEFAULT_FOLDER
  ) {}

  public getCachedSettings(): ISettingsFile | undefined {
    if (this._cachedSettings && Date.now() - this._cacheTimestamp < CACHE_TTL_MS) {
      return this._cachedSettings;
    }
    return undefined;
  }

  public clearCache(): void {
    this._cachedSettings = undefined;
    this._cacheTimestamp = 0;
    this._inFlightPromise = undefined;
  }

  public async getSettings(): Promise<ISettingsFile> {
    const cached = this.getCachedSettings();
    if (cached) {
      return cached;
    }

    if (!this._inFlightPromise) {
      this._inFlightPromise = (async (): Promise<ISettingsFile> => {
        try {
          const file = await this._loadSettingsFile();
          const settings = mergeSettings(DEFAULT_SETTINGS, file);
          this._cachedSettings = settings;
          this._cacheTimestamp = Date.now();
          return settings;
        } catch (error: unknown) {
          reportError(error, { action: 'settings-load-failed', level: 'service', severity: 'warning' });
          return mergeSettings(DEFAULT_SETTINGS, {});
        } finally {
          this._inFlightPromise = undefined;
        }
      })();
    }

    return this._inFlightPromise;
  }

  
  public async saveSettings(settings: ISettingsFile, updatedBy?: string): Promise<void> {
    const stamped: ISettingsFile = {
      ...settings,
      version: 1,
      updatedBy,
      updatedAt: new Date().toISOString()
    };

    const folderServerRelativeUrl = this._getFolderServerRelativeUrl();
    const body = JSON.stringify(stamped, null, 2);

    try {
      const result = await saveFileWithETagConcurrency(
        this._context.spHttpClient,
        this._homeUrl,
        folderServerRelativeUrl,
        this._fileName,
        body,
        this._lastKnownETag,
        'Updated via header settings editor'
      );
      this._lastKnownETag = result.etag;
    } catch (error: unknown) {
      reportError(error, { action: 'settings-save-failed', level: 'service', rethrow: true });
    }

    this.clearCache();
  }

  private async _loadSettingsFile(): Promise<Partial<ISettingsFile>> {
    const fileServerRelativeUrl = `${this._getFolderServerRelativeUrl()}/${this._fileName}`;
    const fileUrl = `${this._homeUrl}/_api/web/getfilebyserverrelativeurl('${fileServerRelativeUrl}')/$value`;

    const response = await spGetWithRetry(this._context.spHttpClient, fileUrl);

    if (!response.ok) {
      if (response.status === 404) {

        this._lastKnownETag = undefined;
        return {};
      }
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    this._lastKnownETag = response.headers.get('ETag') ?? undefined;

    const text = await response.text();
    if (!text.trim()) {
      return {};
    }

    try {
      const parsed = JSON.parse(text) as Record<string, unknown> | null;
      if (!isPlainObject(parsed)) {
        return {};
      }

      const warnings: string[] = [];
      const sanitized: Partial<ISettingsFile> = {
        version: typeof parsed.version === 'number' ? parsed.version : undefined,
        updatedBy: typeof parsed.updatedBy === 'string' ? parsed.updatedBy : undefined,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined
      };

      if (parsed.general !== undefined) {
        if (isPlainObject(parsed.general)) {
          sanitized.general = parsed.general as ISettingsFile['general'];
        } else {
          warnings.push(`general: expected an object, got ${typeof parsed.general} — ignored.`);
        }
      }

      if (parsed.features !== undefined) {
        if (isPlainObject(parsed.features)) {
          sanitized.features = parsed.features as ISettingsFile['features'];
        } else {
          warnings.push(`features: expected an object, got ${typeof parsed.features} — ignored.`);
        }
      }

      if (parsed.colors !== undefined) {
        if (isPlainObject(parsed.colors)) {
          sanitized.colors = parsed.colors as ISettingsFile['colors'];
        } else {
          warnings.push(`colors: expected an object, got ${typeof parsed.colors} — ignored.`);
        }
      }

      if (parsed.fontSizes !== undefined) {
        if (isPlainObject(parsed.fontSizes)) {
          sanitized.fontSizes = parsed.fontSizes as ISettingsFile['fontSizes'];
        } else {
          warnings.push(`fontSizes: expected an object, got ${typeof parsed.fontSizes} — ignored.`);
        }
      }

      if (parsed.navigation !== undefined) {
        const { items, warnings: navWarnings } = sanitizeNavigationItems(parsed.navigation);
        sanitized.navigation = items as unknown as ISettingsFile['navigation'];
        warnings.push(...navWarnings);
      }

      if (warnings.length > 0) {
        reportError(new Error(`settings.json: ${warnings.length} field(s) dropped during validation`), {
          action: 'settings-validation-warnings',
          level: 'service',
          severity: 'warning',
          metadata: { details: warnings.slice(0, 10).join(' | ') }
        });
      }

      return sanitized;
    } catch (parseError) {
      reportError(parseError, { action: 'settings-parse-failed', level: 'service', severity: 'warning' });
      return {};
    }
  }

  public async uploadLogo(file: File): Promise<string> {
    const folderServerRelativeUrl = this._getFolderServerRelativeUrl();

    const rawName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extensionIndex = rawName.lastIndexOf('.');
    const uniqueSuffix = Date.now();
    const cleanFileName = extensionIndex > 0
      ? `${rawName.slice(0, extensionIndex)}-${uniqueSuffix}${rawName.slice(extensionIndex)}`
      : `${rawName}-${uniqueSuffix}`;
    const uploadUrl = `${this._homeUrl}/_api/web/getfolderbyserverrelativeurl('${folderServerRelativeUrl}')/files/add(overwrite=true,url='${cleanFileName}')`;

    try {
      const buffer = await file.arrayBuffer();

      const response = await spPostWithRetry(this._context.spHttpClient, uploadUrl, {
        body: buffer,
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'Content-Type': file.type || 'application/octet-stream'
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      return `${folderServerRelativeUrl}/${cleanFileName}`;
    } catch (error: unknown) {

      reportError(error, { action: 'logo-upload-failed', level: 'service' });
      throw error;
    }
  }

  private _getFolderServerRelativeUrl(): string {
    try {
      return `${new URL(this._homeUrl).pathname.replace(/\/+$/, '')}/${this._folder}`;
    } catch {
      return `/${this._folder}`;
    }
  }
}