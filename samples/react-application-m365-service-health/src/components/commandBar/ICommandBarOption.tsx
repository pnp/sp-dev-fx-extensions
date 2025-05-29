import React from "react";

export interface ICommandBarOption {
  /** Label for the button */
  label?: string;

  /** Icon for the button */
  icon: JSX.Element;

  /** Callback for the button */
  onClick: () => void;

  /** Whether the button should be disabled */
  disabled?: boolean;

  /** Custom style for the button */
  style?: React.CSSProperties;

  /** Custom className for the button */
  className?: string;
  /* apperance */
  appearance?: "primary" | "subtle" | "outline" | "transparent";

}
