import { IConfigStoreItem } from '../SPSG.Common.Modules/IConfigStoreItem';
import { ISPApp } from '../SPSG.Common.Modules/ISPApp';
export interface ISPService {
    GetConfigStoreItems(category: string, key?: string): Promise<IConfigStoreItem[]>;
    GetCurrentSiteProperties(): Promise<any>;
    GetSiteInstalledApp(): Promise<ISPApp[]>;
    GetUserProfileByLoginID(userLogin: string): Promise<any>;
}
