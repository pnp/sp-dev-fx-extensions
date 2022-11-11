import { FormDisplayMode, Guid } from "@microsoft/sp-core-library";
import { FormCustomizerContext } from "@microsoft/sp-listview-extensibility";
import { ICustomer } from "../../model/ICustomer";
import { IFormData } from "../../model/IFormData";

export interface IFormContainerProps {
    context: FormCustomizerContext;
    listGuid: Guid;
    itemID: number | undefined;
    listItem: ICustomer;
    EditFormUrl: string;
    AddFormUrl: string;
    displayMode: FormDisplayMode;
    onSave: () => void;
    onClose: () => void;
}