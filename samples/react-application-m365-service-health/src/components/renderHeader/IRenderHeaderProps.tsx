import * as React from "react";

export interface IRenderHeaderProps {
  onDismiss: (open?: boolean) => void;
  icon?: string | JSX.Element;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  showCloseButton?: boolean;
}
