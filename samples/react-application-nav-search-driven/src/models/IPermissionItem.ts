export interface IPermissionItem {
    key: string;
    name: string;
    description: string;
    url: string;
    permission: string;
    isDefault: boolean;
    width?: number;
    height?: number;
}