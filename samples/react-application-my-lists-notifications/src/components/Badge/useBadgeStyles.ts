import * as React from "react";

import { IIconStyles, IStackStyles } from "@fluentui/react";

import { AppContext } from "../../common/AppContext";

export const useBadgeStyles = () => {
  const { theme, context } = React.useContext(AppContext);

  const panelTitleStyles: IStackStyles = {
    root: {
      width: "100%",
      fontWeight: 700,
      paddingTop: 20,
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 20,
    },
  };

  const iconTitleStyles: IIconStyles = {
    root: { fontSize: 16 },
  };

  return { iconTitleStyles, panelTitleStyles };
};
