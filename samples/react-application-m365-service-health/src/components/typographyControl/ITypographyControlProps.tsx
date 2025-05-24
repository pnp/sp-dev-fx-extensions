import * as React from "react";

/**
 * TypographyControlProps interface defines the properties for the TypographyControl component.
 */
export interface ITypographyControlProps {
  /**
   * The font size, mapped to Fluent UI tokens or custom value.
   */
  fontSize?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * The font weight, mapped to Fluent UI tokens or custom value.
   */
  fontWeight?: "regular" | "semibold" | "bold";

  /**
   * Number of lines to display before truncating.
   */
  numberOfLines?: number;

  /**
   * HTML element type to render (e.g., h1, p, span).
   */
  as?: "b" |
  "em" |
  "h1" |
  "h2" |
  "h3" |
  "h4" |
  "h5" |
  "h6" |
  "i" |
  "p" |
  "pre" |
  "span" |
  "strong";

  /**
   * Padding around the typography (predefined or custom value).
   */
  padding?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * Individual padding properties (predefined or custom value).
   */
  paddingTop?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  paddingBottom?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  paddingLeft?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  paddingRight?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * Margin around the typography (predefined or custom value).
   */
  margin?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * Individual margin properties (predefined or custom value).
   */
  marginTop?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  marginBottom?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  marginLeft?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  marginRight?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * The text content to render.
   */
  children: React.ReactNode;

  /**
   * Additional inline styles.
   */
  style?: React.CSSProperties;

  /**
   * Additional class names for the typography.
   */
  className?: string;
  /* color */
  color?: string;
}
