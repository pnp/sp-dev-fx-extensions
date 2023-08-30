import { Guid } from "@microsoft/sp-core-library";

export interface IItemData {
    itemId?: string;
    listId: Guid;
    webUrl: string;
    hasUniquePermissions?: boolean;
}