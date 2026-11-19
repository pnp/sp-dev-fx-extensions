import { SPHttpClient } from '@microsoft/sp-http';
import { SpRest } from '../../../shared/spRest';
import {
  CENTRAL_SITE_DESCRIPTION, CENTRAL_SITE_PROPERTY, CatalogAccess, ICentralDescription,
  catalogAccess, centralPropertyValue, describeCentral
} from '../../../shared/centralSite';

export interface ICentralSiteStatus extends ICentralDescription {
  /** The tenant app catalog, where the property is kept; undefined if the tenant has none. */
  appCatalogUrl?: string;
  access: CatalogAccess;
}

/**
 * Reads and sets the tenant property HitCounterCentralSiteUrl (scope F6).
 * The property lives on the tenant app catalog; anyone can read it, only a
 * SharePoint admin who is an admin of the app catalog can set it, and only
 * while the app catalog allows custom scripts.
 */
export class CentralSite {
  private readonly _client: SPHttpClient;
  private readonly _rest: SpRest;

  constructor(client: SPHttpClient, rest: SpRest) {
    this._client = client;
    this._rest = rest;
  }

  public async status(trackSetting: boolean): Promise<ICentralSiteStatus> {
    const tenant: { CorporateCatalogUrl?: string } = await this._rest.get('/_api/SP_TenantSettings_Current');
    const appCatalogUrl: string | undefined = tenant && tenant.CorporateCatalogUrl ? tenant.CorporateCatalogUrl : undefined;
    const value: string | undefined = await this._read();
    let access: CatalogAccess = 'no-access';
    if (appCatalogUrl) {
      try {
        access = catalogAccess(await new SpRest(this._client, appCatalogUrl).get('/_api/web/EffectiveBasePermissions'));
      } catch {
        access = 'no-access'; // 401/403: not a member of the app catalog.
      }
    }
    return { ...describeCentral(value, this._rest.webUrl, trackSetting), appCatalogUrl, access };
  }

  /** Makes this site the central site, then reads the property back to confirm. */
  public async makeThisSiteCentral(appCatalogUrl: string, trackCentralSite: boolean): Promise<void> {
    const value: string = centralPropertyValue(this._rest.webUrl, trackCentralSite);
    try {
      await new SpRest(this._client, appCatalogUrl).post('/_api/web/SetStorageEntity', {
        key: CENTRAL_SITE_PROPERTY,
        value,
        description: CENTRAL_SITE_DESCRIPTION,
        comments: `Set from the HitCounter dashboard on ${this._rest.webUrl}`
      });
    } catch (error) {
      const message: string = String((error as Error).message || error);
      if ((error as { status?: number }).status === 403 || /access.?denied/i.test(message)) {
        throw new Error('SharePoint refused to save the property. Only a SharePoint admin who is also an admin of the app catalog can ' +
          'set it, and only while the app catalog allows custom scripts (see the steps below).');
      }
      throw error;
    }
    const saved: string | undefined = await this._read();
    if (saved !== value) {
      throw new Error('The property was saved but reads back differently. Try again in a minute.');
    }
  }

  private async _read(): Promise<string | undefined> {
    const entity: { Value?: string } | undefined = await this._rest.get(`/_api/web/GetStorageEntity('${CENTRAL_SITE_PROPERTY}')`);
    return entity && entity.Value ? entity.Value : undefined;
  }
}
