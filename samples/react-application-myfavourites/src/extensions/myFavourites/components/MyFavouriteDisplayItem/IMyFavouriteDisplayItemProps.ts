import { IMyFavouriteItem } from "../../../interfaces/IMyFavouriteItem";

export interface IMyFavouriteDisplayItemProps {
    displayItem: IMyFavouriteItem;
    deleteFavourite(favouriteItemId: number): void;
    editFavoutite(itemToBeEdited: IMyFavouriteItem): void;
}
