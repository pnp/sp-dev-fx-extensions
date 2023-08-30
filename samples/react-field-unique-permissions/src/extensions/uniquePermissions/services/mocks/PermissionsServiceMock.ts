import { IItemData, IPermissionsData } from "../../models";
import { IPermissionsService } from "../interfaces";

export class PermissionsServiceMock implements IPermissionsService {
    getUniquePermissionsForItem(itemData: IItemData): Promise<boolean> {
        return Promise.resolve(true);
    }
    resetRoleInheritance(itemData: IItemData): Promise<boolean> {
        return Promise.resolve(true);
    }
    goToItemPermissionsPage(itemData: IItemData): Promise<void> {
        return Promise.resolve();
    }
    getUserPermissionsForItem(itemData: IItemData, userLogin: string): Promise<IPermissionsData> {
        return Promise.resolve(null);
    }
    hasUserManagePermissionAccessToList(itemData: IItemData, userLogin: string): Promise<boolean> {
        return Promise.resolve(true);
    }
    checkManagePermissionsAccess(value: IPermissionsData): boolean {
        return true;
    }
    checkReadPermissions(value: IPermissionsData): boolean {
        return true;
    }
    checkEditPermissions(value: IPermissionsData): boolean {
        return true;
    }

}