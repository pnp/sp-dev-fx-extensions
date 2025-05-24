import { css } from "@emotion/css";
import { tokens } from "@fluentui/react-components";
export interface UseStylesResult {
  root: string;
  title: string;
  buttonCancel: string;
  drawerHeader: string;
  drawerContent: string;
}
export const useStyles = (): UseStylesResult => {
  return {
    root: css({
      backgroundColor: tokens.colorBrandBackground,
      color: tokens.colorNeutralForegroundOnBrand,
    }),
    title: css({
      lineClamp: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),
    buttonCancel: css({
      backgroundColor: "transparent",
      ":hover": {
        backgroundColor: tokens.colorNeutralBackground1,
      },
    }),
    drawerHeader: css({
      padding: 0,
    }),
    drawerContent: css({
      paddingTop: 20,
    }),
  };
};
