import * as React from 'react';

export interface IRenderDialogProps {
  isOpen: boolean;
  dialogTitle?: string | React.ReactNode;
  dialogActions?: JSX.Element;
  onDismiss?: (open?: boolean) => void;
  minWidth?: number | string;
  maxWidth?: number | string;
  className?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
}
