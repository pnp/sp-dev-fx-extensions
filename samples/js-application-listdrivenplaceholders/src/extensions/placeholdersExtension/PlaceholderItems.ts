import * as pnp from 'sp-pnp-js';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';

const LOCALSTORAGE_PREFIX: string = "SPFXPlaceholders_";
const PLACEHOLDERS_LISTNAME: string = "SPFx Placeholders";
const FIELD_TITLENAME: string = "Title";
const FIELD_SPFXCONTENTNAME: string = "SPFxContent";
const CACHE_EXPIRATIONMINUTES: number = 5;

export interface IPlaceholderItem {
    Title: string;
    SPFxContent: string;
}

export interface IPlaceholderCache {
    Expiration: Number;
    Content: IPlaceholderItem[];
}

export class PlaceholderItems {

    public static GetItems(webID: string): Promise<IPlaceholderItem[]> {
        return (Environment.type === EnvironmentType.Local) ?
            this.GetMockListItems() : this.GetRealListItems(webID);

    }

    private static GetRealListItems(webID: string): Promise<IPlaceholderItem[]> {
        return new Promise<IPlaceholderItem[]>((resolve) => {

            //Find data in localStorage or retrieve from list
            const cachedPlaceholders: IPlaceholderCache =
                localStorage ? JSON.parse(localStorage.getItem(LOCALSTORAGE_PREFIX + webID)) : null;

            if (cachedPlaceholders && cachedPlaceholders.Expiration > new Date().getTime()) {
                //return localStorage when available and within cached timeframe
                resolve(cachedPlaceholders.Content);
            } else {
                //return data from list when localStorage unavailable or stale
                pnp.sp.web.lists.getByTitle(PLACEHOLDERS_LISTNAME).items.
                    select(FIELD_TITLENAME, FIELD_SPFXCONTENTNAME).get().then((data: IPlaceholderItem[]) => {
                        //Save in localStorage if available
                        if (localStorage) {
                            localStorage.setItem(LOCALSTORAGE_PREFIX + webID,
                                JSON.stringify({
                                    Expiration: new Date().getTime() + (CACHE_EXPIRATIONMINUTES * 60 * 1000),
                                    Content: data
                                }));
                        }
                        console.log('got it from the list');
                        resolve(data);
                    });
            }

        });

    }

    private static GetMockListItems(): Promise<IPlaceholderItem[]> {
        return new Promise<IPlaceholderItem[]>((resolve) => {
            resolve(
                [
                    { Title: "PageHeader", SPFxContent: "Header Content" },
                    { Title: "PageFooter", SPFxContent: "Footer Content" }
                ]
            );
        });


    }
}