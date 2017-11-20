import { IMyFavouriteItem } from "../../interfaces/IMyFavouriteItem";

export interface IMyFavouritesState {
    showPanel: boolean;
    showDialog: boolean;
    dialogTitle: string;
    myFavouriteItems: IMyFavouriteItem[];
    itemInContext: IMyFavouriteItem;
    isEdit: boolean;
    status: JSX.Element;
    disableButtons: boolean;
}