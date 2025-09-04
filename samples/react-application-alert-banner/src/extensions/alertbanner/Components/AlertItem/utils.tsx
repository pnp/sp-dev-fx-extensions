import * as React from "react";
import { AlertPriority } from "../Alerts/IAlerts";
import {
  Info24Regular,
  Warning24Regular,
  ErrorCircle24Regular,
  CheckmarkCircle24Regular
} from "@fluentui/react-icons";

export const PRIORITY_COLORS = {
  critical: { start: '#C0392B', end: '#E74C3C' }, // Dark Red to Brighter Red
  high: { start: '#D35400', end: '#F39C12' },     // Dark Orange to Golden Orange
  medium: { start: '#2980B9', end: '#3498DB' },    // Dark Blue to Sky Blue
  low: { start: '#27AE60', end: '#2ECC71' }      // Forest Green to Emerald Green
} as const;

export const getPriorityIcon = (priority: AlertPriority): React.ReactElement => {
  const getIconColor = (priority: AlertPriority): string => {
    switch (priority) {
      case "critical": return "#d13438";
      case "high": return "#f7630c";
      case "medium": return "#0078d4";
      case "low": return "#107c10";
      default: return "#107c10";
    }
  };
  
  const iconColor = getIconColor(priority);
  
  const commonProps = {
    style: { color: iconColor },
    width: "20px",
    height: "20px",
    fill: "currentColor"
  };
  
  switch (priority) {
    case "critical":
      return <ErrorCircle24Regular {...commonProps} />;
    case "high":
      return <Warning24Regular {...commonProps} />;
    case "medium":
      return <Info24Regular {...commonProps} />;
    case "low":
    default:
      return <CheckmarkCircle24Regular {...commonProps} />;
  }
};