import { IMyFavouriteItem } from "../interfaces/IMyFavouriteItem";

export interface IMyFavoutitesService {
    getMyFavourites(tryFromCache: boolean): Promise<IMyFavouriteItem[]>;
    saveFavourite(favouriteItem: IMyFavouriteItem): Promise<boolean>;
    deleteFavourite(favouriteItemId: number): Promise<boolean>;
    updateFavourite(favouriteItem: IMyFavouriteItem): Promise<boolean>;
}