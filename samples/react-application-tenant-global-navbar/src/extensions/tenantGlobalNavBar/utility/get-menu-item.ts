import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import * as SPTermStore from "./../services/SPTermStoreService";

export const mapMenuItem = (
  menuItem: SPTermStore.ISPTermObject,
  itemType: ContextualMenuItemType
): IContextualMenuItem => {
  const item: IContextualMenuItem = {
    key: menuItem.identity,
    name: menuItem.name,
    itemType: itemType,
    href: menuItem.terms.length === 0 && menuItem.localCustomProperties["_Sys_Nav_SimpleLinkUrl"] || null,
    subMenuProps:
      menuItem.terms.length > 0
        ? {
            items: menuItem.terms.map((childItem) => {
              return mapMenuItem(childItem, ContextualMenuItemType.Normal);
            }),
          }
        : undefined,
    isSubMenu: itemType !== ContextualMenuItemType.Header,
  };

  // Conditionally include iconProps if iconName is present
  if (menuItem.localCustomProperties.iconName !== undefined) {
    item.iconProps = {
      iconName: menuItem.localCustomProperties.iconName,
    };
  }

  return item;
};
