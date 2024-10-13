import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { mapMenuItem } from "./get-menu-item";

export const mapMenuItems = (menuItems): IContextualMenuItem[] => {
  return menuItems?.map((menuItem) => {
    return mapMenuItem(menuItem, ContextualMenuItemType.Header);
  });
};
