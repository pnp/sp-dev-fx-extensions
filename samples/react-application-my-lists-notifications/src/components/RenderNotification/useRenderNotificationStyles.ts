import * as React from "react";

import { IDocumentCardStyles, IStackStyles, IStyle, mergeStyles, mergeStyleSets } from "@fluentui/react";

import { AppContext } from "../../common/AppContext";

export const useRenderNotificationStyles = () => {
  const { theme, context } = React.useContext(AppContext);

  const itemContainerStyles: IStackStyles = {
    root: { paddingTop: 0, paddingLeft: 20, paddingRight: 20, paddingBottom: 20 } as IStyle,
  };

  const stackItemsContainer: IStackStyles = {
    root: { paddingTop: 15, maxHeight: `calc(100vh - 450px)`, overflow: "auto" },
  };

  const documentCardStyles: Partial<IDocumentCardStyles> = {
    root: {
      marginTop: 5,
      backgroundColor: theme.neutralLighterAlt,
      ":hover": {
        borderColor: theme.themePrimary,
        borderWidth: 1,
      } as IStyle,
    } as IStyle,
  };

  const configurationListClasses = mergeStyleSets({
    listIcon: mergeStyles({
      fontSize: 18,
      width: 18,
      height: 18,
      color: theme.themePrimary,
    }),
    nolistItemIcon: mergeStyles({
      fontSize: 28,
      width: 28,
      height: 28,
      color: theme.themePrimary,
    }),
    divContainer: {
      display: "block",
    } as IStyle,
  });

  return { configurationListClasses, documentCardStyles, itemContainerStyles, stackItemsContainer };
};
