import { ISPService } from './ISPService';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { IConfigStoreItem } from '../SPSG.Common.Modules/IConfigStoreItem';
import { ISPApp } from '../SPSG.Common.Modules/ISPApp';
export declare class SPService implements ISPService {
    private appCustomizerContext;
    constructor(context: ApplicationCustomizerContext);
    /**
     * @description - Property to get Config Store Site URL based on context
     */
    readonly GetConfigStoreSiteUrl: string;
    GetConfigStoreItems(category: string, key?: string): Promise<IConfigStoreItem[]>;
    GetCurrentSiteProperties(): Promise<any>;
    GetSiteInstalledApp(): Promise<ISPApp[]>;
    /**
     * @description - Returns User
     * @param userUPN -User Office Login ID
     */
    GetUserProfileByLoginID(userLogin: string): Promise<any>;
}
