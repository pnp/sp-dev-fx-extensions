/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { IDataGridProps } from "./IDataGridProps";
import { css } from "@emotion/css";

export const useDataGridStyles = <T,>(props: IDataGridProps<T>) => {
  const styles = {
    loadingContainer: css({
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }),
    noItemsMessage: css({
      textAlign: "center",
      marginTop: 20,
    }),
    rowSelection: css({
      ":hover": {
        cursor: "pointer",
      },
    }),
  };

  return { styles };
};
