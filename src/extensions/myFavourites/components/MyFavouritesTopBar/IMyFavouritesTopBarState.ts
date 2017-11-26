import { IMyFavouriteItem } from "../../../interfaces/IMyFavouriteItem";

export interface IMyFavouritesTopBarState {
    showPanel: boolean;
    showDialog: boolean;
    dialogTitle: string;
    myFavouriteItems: IMyFavouriteItem[];
    itemInContext: IMyFavouriteItem;
    isEdit: boolean;
    status: JSX.Element;
    disableButtons: boolean;
}