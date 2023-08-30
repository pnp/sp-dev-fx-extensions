import { IPermissionsService, ICustomSPHttpClient } from "./interfaces";
import { IItemData, IPermissionsData } from "../models";

export class PermissionsService implements IPermissionsService {    
    constructor(protected spHttpClient: ICustomSPHttpClient) {
    }

    public async getUniquePermissionsForItem(itemData: IItemData): Promise<boolean> {
        const { spHttpClient } = this;
        const { webUrl, listId: listName, itemId } = itemData;

        const result = await spHttpClient.get(`${webUrl}/_api/web/lists('${listName}')/items(${itemId})/HasUniqueRoleAssignments`);
        return result?.value || false;
    }

    public async resetRoleInheritance(itemData: IItemData): Promise<boolean> {
        const { spHttpClient } = this;
        const { webUrl, listId: listName, itemId } = itemData;

        const result = await spHttpClient.post(`${webUrl}/_api/web/lists('${listName}')/items(${itemId})/resetroleinheritance`, {});
        return result?.value || false;

    }
    public async goToItemPermissionsPage(itemData: IItemData): Promise<void> {
        const { webUrl, listId: listName, itemId } = itemData;
        window.location.href = `${webUrl}/_layouts/15/user.aspx?List=${listName}&obj=${listName},${itemId},LISTITEM&noredirect=true`;
    }

    public async getUserPermissionsForItem(itemData: IItemData, userLogin: string): Promise<IPermissionsData> {
        const { spHttpClient } = this;
        const { webUrl, listId: listName, itemId } = itemData;

        const loginName = encodeURIComponent(userLogin);
        const result = await spHttpClient.get(`${webUrl}/_api/web/lists('${listName}')/items(${itemId})/getUserEffectivePermissions(@user)?@user=%27${loginName}%27`);

        return result;
    }

    public async hasUserManagePermissionAccessToList(itemData: IItemData, userLogin: string): Promise<boolean> {
        const { spHttpClient } = this;
        const { webUrl, listId: listName } = itemData;

        const loginName = encodeURIComponent(userLogin);
        try {
            const result = await spHttpClient.get(`${webUrl}/_api/web/lists('${listName}')/getUserEffectivePermissions(@user)?@user=%27${loginName}%27`);
            const hasManagePermissionsAccess = this.checkManagePermissionsAccess(result);
            return hasManagePermissionsAccess;
        } catch {
            return false;
        }
    }

    public checkManagePermissionsAccess = (value: IPermissionsData): boolean => {
        const managePermissionsValue = 24;

        const num = 1 << managePermissionsValue;
        const hasManagePermissionsAccess = 0 !== (value.Low & num)

        return hasManagePermissionsAccess;
    };


    public checkReadPermissions = (value: IPermissionsData): boolean => {
        const readPermissionsValue = 0;

        const num = 1 << readPermissionsValue;
        const hasReadPermissionsAccess = 0 !== (value.Low & num)
        return hasReadPermissionsAccess;
    };

    public checkEditPermissions = (value: IPermissionsData): boolean => {
        const editPermissionsValue = 2;

        const num = 1 << editPermissionsValue;
        const hasEditPermissionsAccess = 0 !== (value.Low & num)

        return hasEditPermissionsAccess;
    };

}