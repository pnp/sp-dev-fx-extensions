/** @jsxImportSource @emotion/react */
import { css } from "@emotion/css";
import { tokens } from "@fluentui/react-components";
export const useRenderHeaderStyles = (): { [key: string]: string } => {
  return {
    closeButton: css({
      marginLeft: "auto",
      position: "absolute",
      top: "10px",
      right: "10px",
      zIndex: 99999,
    }),

    divider: css({
      width: "100%",
      height: "1px",
      backgroundColor: tokens.colorNeutralStroke1,  
      marginTop: "6px",
    }),

    renderHeaderContent: css({
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "stretch",
      width: "100%",
    }),

    renderHeaderHeader: css({
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      padding: "10px",
      gap: "20px",
    }),

    renderHeaderFooter: css({
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      padding: "20px",
      gap: "20px",
    }),

    renderHeaderBody: css({
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      padding: "20px",
      gap: "20px",
    }),

    renderHeaderTitleContainer: css({
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignContent: "center",
      alignItems: "center",
      width: "100%",
   
    }),

    renderHeaderTitle: css({
      display: "-webkit-box",
      WebkitLineClamp: "1",
      WebkitBoxOrient: "vertical",
      textAlign: "start",
      textOverflow: "ellipsis",
      paddingTop: 0 ,
      wordBreak: "break-word",
    }),

    renderHeaderDescription: css({
      display: "-webkit-box",
      WebkitLineClamp: "4",
      WebkitBoxOrient: "vertical",
      textAlign: "start",
      textOverflow: "ellipsis",
      wordBreak: "break-word",
    }),

    dialogTitleAndDescriptionContainer: css({
      display: "flex",
      flexDirection: "column",
      justifyContent: "start",
      alignItems: "start",
      paddingLeft: "10px",
      paddingRight: "20px",
      width: "100%",
    }),
  };
};