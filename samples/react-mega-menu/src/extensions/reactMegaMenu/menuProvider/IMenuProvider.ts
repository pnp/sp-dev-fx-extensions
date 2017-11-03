import { MenuCategory } from "./MenuCategory";

export interface IMenuProvider {

    getAllItems(): Promise<MenuCategory[]>;
}