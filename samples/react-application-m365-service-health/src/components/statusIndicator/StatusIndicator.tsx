/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";

import { useStyles } from "./useStyles";
import { useUtils } from "../../hooks/useUtils";

export interface StatusIndicatorProps {
  status: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const { getStatusColor } = useUtils();
  const { statusBullet, root } = useStyles();
  return (
    <div className={root}>
      <span
        className={statusBullet}
        style={{
          backgroundColor: getStatusColor(status),
        }}
      />
    </div>
  );
};
