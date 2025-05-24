import { mergeClasses, tokens } from "@fluentui/react-components";

import { IStackProps } from "./IStackProps";
import React from "react";
import { css } from "@emotion/css";

/**
 * Mapping of predefined sizes to Fluent UI tokens.
 */
const sizeMap: Record<string, string> = {
  xs: tokens.spacingHorizontalXS,
  s: tokens.spacingHorizontalS,
  m: tokens.spacingHorizontalM,
  l: tokens.spacingHorizontalL,
  xl: tokens.spacingHorizontalXL,
  xxl: tokens.spacingHorizontalXXL,
};

/**
 * Stack component provides a flexible layout using Flexbox.
 * It allows stacking child components either horizontally or vertically with predefined spacing options.
 */
export const Stack: React.FC<IStackProps> = React.memo(
  ({
    direction = "vertical",
    justifyContent = "flex-start",
    alignItems = "stretch",
    gap,
    columnGap,
    rowGap,
    margin,
    padding,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    width,
    height,
    wrap = false,
    children,
    style,
    className,
    overflow,
    background
  }) => {
    const stackStyle = css({
      display: "flex",
      flexDirection: direction === "horizontal" ? "row" : "column",
      justifyContent,
      alignItems,
      gap: gap && sizeMap[gap] ? sizeMap[gap] : gap,
      columnGap:
        columnGap && sizeMap[columnGap] ? sizeMap[columnGap] : columnGap,
      rowGap: rowGap && sizeMap[rowGap] ? sizeMap[rowGap] : rowGap,
      margin: margin && sizeMap[margin] ? sizeMap[margin] : margin,
      padding: padding && sizeMap[padding] ? sizeMap[padding] : padding,
      marginTop:
        marginTop && sizeMap[marginTop] ? sizeMap[marginTop] : marginTop,
      marginBottom:
        marginBottom && sizeMap[marginBottom]
          ? sizeMap[marginBottom]
          : marginBottom,
      marginLeft:
        marginLeft && sizeMap[marginLeft] ? sizeMap[marginLeft] : marginLeft,
      marginRight:
        marginRight && sizeMap[marginRight]
          ? sizeMap[marginRight]
          : marginRight,
      paddingTop:
        paddingTop && sizeMap[paddingTop] ? sizeMap[paddingTop] : paddingTop,
      paddingBottom:
        paddingBottom && sizeMap[paddingBottom]
          ? sizeMap[paddingBottom]
          : paddingBottom,
      paddingLeft:
        paddingLeft && sizeMap[paddingLeft]
          ? sizeMap[paddingLeft]
          : paddingLeft,
      paddingRight:
        paddingRight && sizeMap[paddingRight]
          ? sizeMap[paddingRight]
          : paddingRight,
      width,
      height,
      overflow,
      flexWrap: wrap ? "wrap" : "nowrap",
      backgroundColor: background,
      ...style,
    });

    return (
      <div className={mergeClasses(className, stackStyle)}>{children}</div>
    );
  }
);

export default Stack;
