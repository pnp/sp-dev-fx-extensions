import React from 'react';

export interface IconButtonProps {
  /** The default icon to display as a React element */
  icon: React.ReactElement;
  /** The icon to display on hover (optional) as a React element */
  hoverIcon?: React.ReactElement;
  /** Optional image source.
   *  If provided, an image will be rendered instead of the icon.
   */
  imageSrc?: string;
  /** Button width (number or CSS string). Default is 24. */
  width?: number | string;
  /** Button height (number or CSS string). Default is 24. */
  height?: number | string;
  /**
   * The default color for the icon/image.
   * If not provided, the Fluent UI token for colorBrandBackground is used.
   */
  color?: string;
  /**
   * The color for the icon/image on hover.
   * If not provided, the Fluent UI token for colorBrandBackgroundHover is used.
   */
  hoverColor?: string;
  /** Callback for when the button is clicked. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Determines if the button is enabled. Default is true. */
  enabled?: boolean;
}
