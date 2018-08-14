import { IMenuProvider, MenuCategory } from "./index";
import { Log } from "@microsoft/sp-core-library";
import { Web, ListEnsureResult, Item } from "@pnp/sp";
import { MenuItem } from "./MenuItem";

const LOG_SOURCE: string = "ReactMegaMenuApplicationCustomizer_MenuSPListProvider";

/**
 * Mega Menu items SharePoint list provider.
 * Gets data from SharePoint list to populate the mega menu.
 * Can cache menu items in browser session storage to speed up
 * the menu load.
 */
export class MenuSPListProvider implements IMenuProvider {

    /**
     * Web absolute url so we can call pnp-js and get the menu list items.
     */
    private readonly _webAbsoluteUrl: string;

    /**
     * Enables or disables session storage as caching mechanism.
     */
    private readonly _sessionStorageCacheEnabled: boolean;

    /**
     * Browser session storage unique key.
     */
    private readonly _sessionStorageKey: string = "MegaMenuFormattedList_";

    constructor(webAbsoluteUrl: string, enableSessionStorageCache: boolean = false) {

        this._webAbsoluteUrl = webAbsoluteUrl;
        this._sessionStorageCacheEnabled = enableSessionStorageCache;
        this._sessionStorageKey += webAbsoluteUrl;
    }

    /**
     * Gets all items from SharePoint list and stores the formatted
     * mega menu list in the sessionStorage for quick access.
     */
    public getAllItems(): Promise<MenuCategory[]> {
        return new Promise<MenuCategory[]>((resolve, reject) => {

            let result: MenuCategory[] = [];

            if(this._sessionStorageCacheEnabled) {

                result = this._fetchFromSessionStorge();
                if(result.length) {
                    return resolve(result);
                }
            }

            // session storage is disabled, empty or corrupt so fetch menu items from the SharePoint list.
            this._fetchFromSPList().then((items:Item[]) => {

                result = this._groupByCategory(items);

                if(this._sessionStorageCacheEnabled) {

                    // cache for the session for quick access.
                    let jsonToString: string = JSON.stringify(result);
                    window.sessionStorage.setItem(this._sessionStorageKey, jsonToString);
                }

                return resolve(result);
            });
        });
    }

    /**
     * Fetches the menu items from the browser session storage.
     */
    private _fetchFromSessionStorge(): MenuCategory[] {

        let result: MenuCategory[] = [];

        // get the list items from the session storage if available.
        let stringResult: string = window.sessionStorage.getItem(this._sessionStorageKey);
        if (stringResult) {
            try {
                result = JSON.parse(stringResult);
            } catch(error) {
                // somenthing is wrong on parse then proceed and fetch from server.
                Log.error(LOG_SOURCE, error);
            }
        }
        return result;
    }

    /**
     * Fetches the menu items from the server, SharePoint mega menu list.
     */
    private _fetchFromSPList(): Promise<Item[]> {

        return new Promise<Item[]>((resolve, reject) => {

            let web: Web = new Web(this._webAbsoluteUrl);

            web.lists.ensure("Mega Menu List")
                .then((listResult: ListEnsureResult) => {

                    listResult.list.items
                        .select("ID", "MegaMenuCategory", "MegaMenuItemName", "MegaMenuItemUrl")
                        .get()
                        .then((items: Item[]) => {

                            resolve(items);
                        })
                        .catch(error => {

                            Log.error(LOG_SOURCE, new Error("Mega Menu List does not exits."));

                            reject(error);
                        });
                })
                .catch(error => {

                    Log.error(LOG_SOURCE, new Error("Mega Menu List does not exits."));

                    reject(error);
                });
        });
    }

    /**
     * Groups the SharePoint list menu items by category.
     * Would re-map the table structured data to json nested data.
     * @param items SPListItem
     */
    // tslint:disable:no-string-literal
    private _groupByCategory(items: Item[], ): MenuCategory[] {

        let result: MenuCategory[] = [];

        for (let i: number = 0; i < items.length; i++) {

            let item: Item = items[i];

            // init menu item.
            let menuItem: MenuItem = {
                id: item["ID"],
                name: item["MegaMenuItemName"],
                url: item["MegaMenuItemUrl"]
            };

            // check if category already exists in the result object.
            let categories: MenuCategory[] = result.filter(x => x.category === item["MegaMenuCategory"]);

            if (categories.length) {

                // push to the existing category.
                categories[0].items.push(menuItem);
            } else {

                // add new category and push the new menu item.
                result.push({ category: item["MegaMenuCategory"], items: [menuItem] } as MenuCategory);
            }
        }

        return result;
    }
}
