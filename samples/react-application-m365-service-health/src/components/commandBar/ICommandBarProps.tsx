import { ICommandBarOption } from "./ICommandBarOption";
import React from "react";

export interface ICommandBarProps {
  /** Array of options to render in the CommandBar */
  options: ICommandBarOption[];
  className?: string;
  style?: React.CSSProperties;
  faritems?: ICommandBarOption[];
}
