import { IButtonStyles } from "office-ui-fabric-react/lib/Button";
import { IBasePickerStyles } from "office-ui-fabric-react/lib/Pickers";
import { IStackStyles } from "office-ui-fabric-react/lib/Stack";
import { mergeStyles, mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
import { ITextStyles } from "office-ui-fabric-react/lib/Text";

import { IIconStyles } from "@fluentui/react";

const theme = window.__themeState__.theme;

export const useListPickerStyles = (themeVariant: any | undefined) => {
  const textHeaderStyles: Partial<ITextStyles> = {
    root: { color: theme?.themePrimary },
  };

  const iconStyles: IIconStyles = { root: { width: 18, height: 18, fontSize: 18 } };

  const renderIconButtonRemoveStyles: Partial<IButtonStyles> = {
    root: {
      height: 26,
      lineHeight: 26,
    },
  };

  const renderItemStylesMulti: Partial<IStackStyles> = {
    root: {
      height: 26,
      lineHeight: 26,
      paddingLeft: 10,
      marginLeft: 5,
      marginBottom: 5,
      cursor: "default",
      backgroundColor: themeVariant?.palette?.themeLighterAlt ?? theme.themeLighterAlt,
      ":hover": {
        backgroundColor: theme.themeLighter,
      },
    },
  };

  const renderItemStylesSingle: Partial<IStackStyles> = {
    root: {
      height: 26,
      lineHeight: 26,
      paddingLeft: 10,
      cursor: "default",
      margin: 2,
      backgroundColor: themeVariant?.palette?.themeLighterAlt ?? theme.themeLighterAlt,
      ":hover": {
        backgroundColor: themeVariant?.palette?.themeLighter ?? theme.themeLighter,
      },
    },
  };

  const pickerStylesSingle: Partial<IBasePickerStyles> = {
    root: {
      width: " 100%",
      borderRadius: 0,
      marginTop: 0,
    },

    input: {
      width: "100%",
      backgroundColor: themeVariant?.palette?.white ?? theme.white,
    },
    itemsWrapper: {},
    text: {
      borderStyle: "solid",
      width: "100%",
      borderWidth: 1,
      backgroundColor: themeVariant?.palette?.white ?? theme.white,
      borderRadius: 0,
      borderColor: themeVariant?.palette?.neutralQuaternaryAlt ?? theme.neutralQuaternaryAlt,
      ":focus": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: themeVariant?.palette?.themePrimary ?? theme.themePrimary,
      },
      ":hover": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: themeVariant?.palette?.themePrimary ?? theme.themePrimary,
      },
      ":after": {
        borderWidth: 0,
        borderRadius: 0,
      },
    },
  };

  const pickerStylesMulti: Partial<IBasePickerStyles> = {
    root: {
      width: " 100%",
      borderRadius: 0,
    },

    input: {
      width: "100%",
      backgroundColor: themeVariant?.palette?.white ?? theme.white,
    },
    itemsWrapper: {
      padding: 3,
    },
    text: {
      borderStyle: "solid",
      width: "100%",
      borderWidth: 1,
      backgroundColor: themeVariant?.palette?.white ?? theme.white,
      borderRadius: 0,
      borderColor: themeVariant?.palette?.neutralQuaternaryAlt ?? theme.neutralQuaternaryAlt,
      ":focus": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: themeVariant?.palette?.themePrimary ?? theme.themePrimary,
      },
      ":hover": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: themeVariant?.palette?.themePrimary ?? theme.themePrimary,
      },
      ":after": {
        borderStyle: "solid",
        borderWidth: 1,
        // borderColor: theme.neutralQuaternaryAlt,
        borderColor: themeVariant?.palette?.themePrimary ?? theme.themePrimary,
      },
    },
  };

  const componentClasses = mergeStyleSets({
    eventCircleColor: mergeStyles({
      borderRadius: "50%",
      borderWidth: 3,
      borderStyle: "solid",
      padding: 10,
    }),
    separator: mergeStyles({
      marginTop: 25,
      marginLeft: 20,
      marginRight: 20,
      borderBottomWidth: 1,
      borderBottomColor: themeVariant?.palette?.neutralQuaternaryAlt ?? theme.neutralQuaternaryAlt,
      borderBottomStyle: "solid",
    }),
    filePickerButtonStyles: mergeStyles({
      position: "relative",
      top: -15,
    }),
    iconStyles: {
      paddingLeft: 2,
      fontWeight: 500,
      color: themeVariant?.palette?.themePrimary ?? theme?.themePrimary,
    },
    iconStylesGlobeAndList: {
      width: 18,
      height: 18,
      fontSize: 18,
    },
    iconStylesWebUrl: {
      width: 22,
      height: 22,
      fontSize: 22,
    },
  });

  const stacklabelHoverItem: IStackStyles = {
    root: {
      paddingTop: 15,
      paddingLeft: 15,
      paddingRight: 15,
      paddingBottom: 0,
      color: themeVariant?.themePrimary,
    },
  };

  return {
    componentClasses,
    pickerStylesMulti,
    pickerStylesSingle,
    renderItemStylesSingle,
    renderItemStylesMulti,
    renderIconButtonRemoveStyles,
    stacklabelHoverItem,
  };
};
