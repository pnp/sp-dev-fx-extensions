import * as React from "react";

import { Text, mergeClasses, tokens } from "@fluentui/react-components";

import { ITypographyControlProps } from "./ITypographyControlProps";
import { css } from "@emotion/css";

/**
 * Mapping of predefined font sizes to Fluent UI tokens.
 */
const fontSizeMap: Record<string, string> = {
  xs: tokens.fontSizeBase200,
  s: tokens.fontSizeBase300,
  m: tokens.fontSizeBase400,
  l: tokens.fontSizeBase500,
  xl: tokens.fontSizeBase600,
  xxl: tokens.fontSizeHero700,
};

/**
 * Mapping of predefined spacing sizes to Fluent UI tokens.
 */
const spacingMap: Record<string, string> = {
  xs: tokens.spacingHorizontalXS,
  s: tokens.spacingHorizontalS,
  m: tokens.spacingHorizontalM,
  l: tokens.spacingHorizontalL,
  xl: tokens.spacingHorizontalXL,
  xxl: tokens.spacingHorizontalXXL,
};

/**
 * Mapping of predefined font weights to Fluent UI tokens.
 */
const fontWeightMap: Record<string, string> = {
  regular: tokens.fontWeightRegular,
  semibold: tokens.fontWeightSemibold,
  bold: tokens.fontWeightBold,
};

/**
 * TypographyControl component provides a way to control typography styles with Fluent UI's `Text` component as the base.
 */
export const TypographyControl: React.FC<ITypographyControlProps> = (props: ITypographyControlProps) => {
  const {
    fontSize,
    fontWeight,
    numberOfLines,
    as,
    padding,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    children,
    style,
    className,
    color
  } = props;
  const typographyStyle = css({
    color: color,
    fontSize:
      fontSize && fontSizeMap[fontSize] ? fontSizeMap[fontSize] : fontSize,
    fontWeight:
      fontWeight && fontWeightMap[fontWeight]
        ? fontWeightMap[fontWeight]
        : fontWeight,
    display: numberOfLines ? "-webkit-box" : undefined,
    WebkitBoxOrient: "vertical",
    overflow: numberOfLines ? "hidden" : undefined,
    WebkitLineClamp: numberOfLines,
    padding: padding && spacingMap[padding] ? spacingMap[padding] : padding,
    paddingTop:
      paddingTop && spacingMap[paddingTop]
        ? spacingMap[paddingTop]
        : paddingTop,
    paddingBottom:
      paddingBottom && spacingMap[paddingBottom]
        ? spacingMap[paddingBottom]
        : paddingBottom,
    paddingLeft:
      paddingLeft && spacingMap[paddingLeft]
        ? spacingMap[paddingLeft]
        : paddingLeft,
    paddingRight:
      paddingRight && spacingMap[paddingRight]
        ? spacingMap[paddingRight]
        : paddingRight,
    margin: margin && spacingMap[margin] ? spacingMap[margin] : margin,
    marginTop:
      marginTop && spacingMap[marginTop] ? spacingMap[marginTop] : marginTop,
    marginBottom:
      marginBottom && spacingMap[marginBottom]
        ? spacingMap[marginBottom]
        : marginBottom,
    marginLeft:
      marginLeft && spacingMap[marginLeft]
        ? spacingMap[marginLeft]
        : marginLeft,
    marginRight:
      marginRight && spacingMap[marginRight]
        ? spacingMap[marginRight]
        : marginRight,
    ...style,
  });

  return (
    <Text as={as} className={mergeClasses(className, typographyStyle)}>
      {children}
    </Text>
  );
};

export default TypographyControl;
