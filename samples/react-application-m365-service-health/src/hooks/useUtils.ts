import * as React from "react";

import { IConsoleMessageOptions } from "../models/IConsoleMessageOptions";
import { tokens } from "@fluentui/react-components";

export interface IUtils {
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  statusLegend: { label: string; color: string }[];
  formatConsoleMessage: (options: IConsoleMessageOptions) => void;
}

// Status Color token map
const statusColorTokenMap: Record<string, string> = {
  serviceoperational: tokens.colorPaletteGreenBackground3,
  investigating: tokens.colorPaletteYellowBackground3,
  restoringservice: tokens.colorPaletteDarkOrangeBackground2,
  verifyingservice: tokens.colorPaletteBlueBackground2,
  servicerestored: tokens.colorPaletteGreenBackground2,
  postincidentreviewpublished: tokens.colorPaletteBlueBackground2,
  servicedegradation: tokens.colorPaletteDarkOrangeBackground3,
  serviceinterruption: tokens.colorPaletteRedBackground3,
  extendedrecovery: tokens.colorPalettePurpleBackground2,
  falsepositive: tokens.colorPaletteGreenBackground3,
  investigationsuspended: tokens.colorNeutralBackground5Pressed,
};

// Status Friendly label map
const statusLabelMap: Record<string, string> = {
  serviceoperational: "Operational",
  investigating: "Investigating",
  restoringservice: "Restoring Service",
  verifyingservice: "Verifying",
  servicerestored: "Restored",
  postincidentreviewpublished: "Post-Incident Review",
  servicedegradation: "Degradation",
  serviceinterruption: "Interruption",
  extendedrecovery: "Extended Recovery",
  falsepositive: "False Positive",
  investigationsuspended: "Investigation Suspended",
};

export const useUtils = (): IUtils => {
  const getStatusColor = React.useCallback((status: string): string => {
    const key = status.toLowerCase();
    return statusColorTokenMap[key] ?? tokens.colorNeutralBackground3;
  }, []);

  const getStatusLabel = React.useCallback((status: string): string => {
    const key = status.toLowerCase();
    return statusLabelMap[key] ?? "Unknown";
  }, []);

  const formatConsoleMessage = React.useCallback(
    ({
      appName,
      functionName,
      messageType,
      message,
    }: IConsoleMessageOptions): void => {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] [${appName}] [${functionName}] ${message}`;

      switch (messageType) {
        case "info":
          console.info(formattedMessage);
          break;
        case "warn":
          console.warn(formattedMessage);
          break;
        case "error":
          console.error(formattedMessage);
          break;
        case "log":
        default:
          console.log(formattedMessage);
          break;
      }
    },
    []
  );
  const statusLegend = React.useMemo(() => {
    const knownStatuses = Object.keys(statusColorTokenMap);
    return knownStatuses.map((status) => ({
      label: getStatusLabel(status),
      color: getStatusColor(status),
    }));
  }, [getStatusLabel, getStatusColor]);

  return { getStatusColor, getStatusLabel, statusLegend, formatConsoleMessage };
};
