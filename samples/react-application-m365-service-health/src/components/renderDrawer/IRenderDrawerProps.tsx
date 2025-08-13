import * as React from 'react';

import { DrawerType } from './RenderDrawer';

export interface IRenderDrawerProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string | React.ReactNode;
  headerActions?: JSX.Element;
  footerActions?: JSX.Element;
  size?: "small" | "medium" | "large" | "full";
  separator?: boolean;
  type?: DrawerType;
  style?: React.CSSProperties;
  children: React.ReactNode;
  position?: "start" | "end";
  classNameHeader?: string;
  classNameBody?: string;
  classNameFooter?: string;
}
