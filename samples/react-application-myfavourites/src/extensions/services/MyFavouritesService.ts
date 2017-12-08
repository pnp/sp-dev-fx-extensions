import { IMyFavoutitesService } from "./IMyFavouritesService";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { IMyFavouritesTopBarProps } from "../myFavourites/components/MyFavouritesTopBar/IMyFavouritesTopBarProps";
import pnp, { List, ItemAddResult, ItemUpdateResult } from "sp-pnp-js";
import { IMyFavouriteItem } from "../interfaces/IMyFavouriteItem";
import { Log } from "@microsoft/sp-core-library";
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions, ISPHttpClientConfiguration, ODataVersion } from '@microsoft/sp-http';
import SPHttpClientConfiguration from "@microsoft/sp-http/lib/spHttpClient/SPHttpClientConfiguration";
import HttpClientConfiguration from "@microsoft/sp-http/lib/httpClient/HttpClientConfiguration";

const LOG_SOURCE: string = "CC_MyFavourites_ApplicationCustomizer";
const FAVOURITES_LIST_NAME: string = "Favourites";

export class MyFavouritesService implements IMyFavoutitesService {
    private _context: ApplicationCustomizerContext;
    private _props: IMyFavouritesTopBarProps;
    private _currentWebUrl: string;
    private _sessionStorageKey: string = "MyFavourites_";

    constructor(_props: IMyFavouritesTopBarProps) {
        this._props = _props;
        this._context = _props.context;
        this._currentWebUrl = this._context.pageContext.web.absoluteUrl;
        this._sessionStorageKey += this._currentWebUrl;
        pnp.setup({
            sp: {
                baseUrl: this._currentWebUrl
            }
        });
    }

    public async getMyFavourites(tryFromCache: boolean): Promise<IMyFavouriteItem[]> {
        let myFavourites: IMyFavouriteItem[] = [];
        if(tryFromCache) {
            myFavourites = this._fetchFromSessionStorge();
            if(myFavourites.length) {
                return myFavourites;
            }
        }
        myFavourites = await this._fetchFromSPList();
        let favInCache: string = JSON.stringify(myFavourites);
        window.sessionStorage.setItem(this._sessionStorageKey, favInCache);
        return myFavourites;
    }

    public async saveFavourite(favouriteItem: IMyFavouriteItem): Promise<boolean> {
        return pnp.sp.web.lists.getByTitle(FAVOURITES_LIST_NAME).items.add({
            'Title': favouriteItem.Title,
            'Description': favouriteItem.Description,
            'ItemUrl': window.location.href
        }).then(async (result: ItemAddResult): Promise<boolean> => {
            let addedItem: IMyFavouriteItem = result.data;
            console.log(addedItem);
            await this.getMyFavourites(false);
            return true;
        }, (error: any): boolean => {
            return false;
        });
    }

    public async deleteFavourite(favouriteItemId: number): Promise<boolean> {
        return pnp.sp.web.lists.getByTitle(FAVOURITES_LIST_NAME).items.getById(favouriteItemId).delete()
        .then(async (): Promise<boolean> => {
            await this.getMyFavourites(false);
            return true;
        }, (error: any): boolean => {
            return false;
        });
    }

    public async updateFavourite(favouriteItem: IMyFavouriteItem): Promise<boolean> {
        return pnp.sp.web.lists.getByTitle(FAVOURITES_LIST_NAME).items.getById(favouriteItem.Id).update({
            'Title': favouriteItem.Title,
            'Description': favouriteItem.Description
        }).then(async (result: ItemUpdateResult): Promise<boolean> => {
            console.log(result);
            await this.getMyFavourites(false);
            return true;
        }, (error: any): boolean => {
            return false;
        });
    }

    private _fetchFromSessionStorge(): IMyFavouriteItem[] {

        let result: IMyFavouriteItem[] = [];
        let stringResult: string = window.sessionStorage.getItem(this._sessionStorageKey);
        if (stringResult) {
            try {
                Log.info(LOG_SOURCE, "Fetched favourites from cache");
                result = JSON.parse(stringResult);
            } catch (error) {
                Log.error(LOG_SOURCE, error);
            }
        }
        return result;
    }

    private async _fetchFromSPList(): Promise<IMyFavouriteItem[]> {
        const currentUserId: number = await this._getUserId();
        return pnp.sp.web.lists.getByTitle(FAVOURITES_LIST_NAME)
            .items
            .select(
            "Id",
            "Title",
            "ItemUrl",
            "Description"
            )
            .filter("Author eq " + currentUserId)
            .get()
            .then((myFavourites: IMyFavouriteItem[]) => {
                Log.info(LOG_SOURCE, "Fetched favourites from list");
                return myFavourites;
            })
            .catch((error) => {
                Log.error(LOG_SOURCE, error);
                return [];
            });
    }

    private _getUserId(): Promise<number> {
        return pnp.sp.site.rootWeb.ensureUser(this._context.pageContext.user.email).then(result => {
            return result.data.Id;
        });
    }
}
