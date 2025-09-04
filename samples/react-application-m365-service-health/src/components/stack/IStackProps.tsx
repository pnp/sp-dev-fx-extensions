import React from "react";

/**
 * StackProps interface defines the properties for the Stack component.
 */
export interface IStackProps {
  /**
   * Direction of stacking: horizontal (row) or vertical (column).
   */
  direction?: "horizontal" | "vertical";

  /**
   * Flexbox justify-content property.
   */
  justifyContent?: React.CSSProperties["justifyContent"];

  /**
   * Flexbox align-items property.
   */
  alignItems?: React.CSSProperties["alignItems"];

  /**
   * Gap between items (can be predefined or custom value like '20px').
   */
  gap?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * Column gap between items (custom value or predefined).
   */
  columnGap?: string;

  /**
   * Row gap between items (custom value or predefined).
   */
  rowGap?: string;

  /**
   * Predefined margin sizes (shorthand) or custom value.
   */
  margin?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * Predefined padding sizes (shorthand) or custom value.
   */
  padding?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * Individual margin properties (predefined or custom value).
   */
  marginTop?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  marginBottom?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  marginLeft?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  marginRight?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * Individual padding properties (predefined or custom value).
   */
  paddingTop?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  paddingBottom?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  paddingLeft?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;
  paddingRight?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | string;

  /**
   * Width of the stack.
   */
  width?: React.CSSProperties["width"];

  /* Height of the stack. */
  height?: React.CSSProperties["height"];

  /**
   * Enable or disable wrapping of items.
   */
  wrap?: boolean;

  /**
   * Child components to be rendered inside the stack.
   */
  children: React.ReactNode;

  /**
   * Additional inline styles.
   */
  style?: React.CSSProperties;

  /**
   * Additional class names for the stack.
   */
  className?: string;
  /* Overflow property */
  overflow?: React.CSSProperties["overflow"];
  /** background Color */
  background?: React.CSSProperties["backgroundColor"];
}
