import { Body1Strong, Subtitle1 } from "@fluentui/react-components";

import { ErrorCircleRegular } from "@fluentui/react-icons";
import { IErrorDisplayProps } from "./IErrorDisplayProps";
import React from "react";
import { useShowErrorStyles } from "./useShowErrorStyles";

export const ShowError: React.FC<IErrorDisplayProps> = ({ message }) => {
  const styles = useShowErrorStyles();
  return (
    <div className={styles.container}>
      <Subtitle1>Service Health</Subtitle1>
      <ErrorCircleRegular className={styles.icon} />
      <Body1Strong className={styles.message}>{message}</Body1Strong>
    </div>
  );
};

export default ShowError;
