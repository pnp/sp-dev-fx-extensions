import { css } from "@emotion/css";

interface IUseStyles {
  statusBullet: string;
  root: string;
}

export const useStyles = (): IUseStyles => {
  return {
    statusBullet: css({
      width: 20,
      height: 20,
      borderRadius: "50%",
      marginRight: 8,
    }),
    root: css({
      display: "flex",
      alignItems: "center",
      gap: 8,
    }),
  };
};
