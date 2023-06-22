import { IItemData, IPermissionsData } from "../../models";

export interface IPermissionsService {
    getUniquePermissionsForItem(itemData: IItemData): Promise<boolean>;
    resetRoleInheritance(itemData: IItemData): Promise<boolean>;
    goToItemPermissionsPage(itemData: IItemData): Promise<void>;
    getUserPermissionsForItem(itemData: IItemData, userLogin: string): Promise<IPermissionsData>;
    hasUserManagePermissionAccessToList(itemData: IItemData, userLogin: string): Promise<boolean>;
    checkManagePermissionsAccess(value: IPermissionsData): boolean;
    checkReadPermissions(value: IPermissionsData): boolean;
    checkEditPermissions(value: IPermissionsData): boolean;
}

