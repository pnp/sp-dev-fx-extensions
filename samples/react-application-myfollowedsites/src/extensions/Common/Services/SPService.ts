import { ISPService } from './ISPService';
import { sp, Web, Site } from "@pnp/sp";
import { setup as pnpSetup } from '@pnp/common';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { ISiteItem } from '../Modules/ISiteItem';



export class SPService implements ISPService {

    private appCustomizerContext: ApplicationCustomizerContext | undefined = undefined;

    /*
      @description - Constructor
    */
    constructor(context: ApplicationCustomizerContext) {
        this.appCustomizerContext = context;
        pnpSetup({
            spfxContext: context
        });
        

    }

    public async getMyFollowedSites(): Promise<ISiteItem[]> {
        try {
            
            return sp.social.my.followed(4).then(myFollowedSites => {
                let myFollowedSitesLocal: ISiteItem[] = [];
                
                if (myFollowedSites) {

                    const myFollowedSitesPromises = myFollowedSites.map(async(msite)=>{

                        let sLogo: string | undefined = undefined;
                            try {
                                sLogo = await this.getSiteLogo(msite.Uri);
                                if (undefined !== sLogo) {
                                    return {
                                        Id: msite.Id,
                                        Name: msite.Name,
                                        Uri: msite.Uri,
                                        SiteLogo: sLogo
                                    };
                                }
    
                            } catch (error) {
    
                            }

                    });
                   return Promise.all(myFollowedSitesPromises);
                }
            });
        }
        catch (err) {

        }
    }
    /**
     * @description - Returns site logo URL
     * @param siteUrl -Target site URL
     */
    private async getSiteLogo(siteUrl: string): Promise<string> {
        try {
            //console.log('Processing site "' + siteUrl + '" for site logo');
            let web: Web = new Web(siteUrl);
            //let sLogo: string = undefined;
            try {
                let sLogoResult: any = await web.select('SiteLogoUrl').get();
                return sLogoResult.SiteLogoUrl;
            }
            catch (e) {
                return undefined;
            }

            //    return web.select('SiteLogoUrl').get().then(sLogo=>{
            //         return sLogo;
            //     }).catch(err=>{
            //         return undefined;
            //     });

        } catch (error) {
            console.error(JSON.stringify(error));
        }
    }

    /**
     * @description - Sorts IUserRequest[] object based on particular column
     * @param items - IUserRequests array
     * @param sortBy - Column to sort with
     * @param descending - True if descending else false.
     */
    public SortMyFollowedSites(items: ISiteItem[], sortBy: string, descending?: boolean): any[] {
        if (items && items.length > 0) {
            if (sortBy && sortBy !== undefined) {
                //column type is not 'Object'
                if (descending) {
                    return items.sort((a: any, b: any) => {
                        if (a[sortBy] < b[sortBy]) {
                            return 1;
                        }
                        if (a[sortBy] > b[sortBy]) {
                            return -1;
                        }
                        return 0;

                    });

                } else {
                    return items.sort((a: any, b: any) => {
                        if (a[sortBy] < b[sortBy]) {
                            return -1;
                        }
                        if (a[sortBy] > b[sortBy]) {
                            return 1;
                        }
                        return 0;
                    });
                }

            }
        }
    }



}