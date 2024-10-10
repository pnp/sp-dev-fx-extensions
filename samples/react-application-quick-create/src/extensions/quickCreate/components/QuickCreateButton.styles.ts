import {
  IIconProps,
  IPanelStyleProps,
  IPanelStyles,
  IStyleFunctionOrObject,
} from "@fluentui/react";

export const panelProps: IStyleFunctionOrObject<
  IPanelStyleProps,
  IPanelStyles
> = {
  scrollableContent: {
    height: "100%",
  },
  commands: {
    padding: "0px !important",
  },
  content: {
    padding: "0px !important",
    height: "100%",
  },
};

export const iconProps: IIconProps = { iconName: "LightningBolt" };
