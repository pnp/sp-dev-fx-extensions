import { IMyFavouriteItem } from "../../../interfaces/IMyFavouriteItem";
import { IMyFavoutitesService } from "../../../services/IMyFavouritesService";

export interface IMyFavoutiteDisplayItemProps {
    displayItem: IMyFavouriteItem;
    deleteFavourite(favouriteItemId: number): void;
    editFavoutite(itemToBeEdited: IMyFavouriteItem): void;
}