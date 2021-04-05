import {
  IButtonStyles,
  IStackStyles,
  ITextStyles,
  mergeStyles,
  mergeStyleSets,
  IBasePickerStyles,
} from "office-ui-fabric-react";

import { Theme } from "spfx-uifabric-themes";

export const useSelectTeamPickerStyles = (theme: Theme | undefined) => {
  const textHeaderStyles: Partial<ITextStyles> = {
    root: { color: theme?.themePrimary },
  };


const renderIconButtonRemoveStyles:Partial<IButtonStyles> = {
  root:{
    height: 26,
    lineHeight: 26
  }
};

  const renderItemStylesMulti: Partial<IStackStyles> = {
    root: {
      height: 26,
      lineHeight: 26,
      paddingLeft: 10,
      marginLeft: 5,
      marginBottom: 5,
      cursor: "default",
      backgroundColor: theme.themeLighterAlt,
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
      backgroundColor: theme.themeLighterAlt,
      ":hover": {
        backgroundColor: theme.themeLighter,
      },
    },
  };

  const pickerStylesSingle: Partial<IBasePickerStyles> = {
    root: {
      width: " 100%",
      borderRadius: 0,
      marginTop: 0
    },

    input: {
      width: "100%",
      backgroundColor: theme.white,
    },
    itemsWrapper: {

    },
    text: {
      borderStyle: "solid",
      width: "100%",
      borderWidth: 1,
      backgroundColor: theme.white,
      borderRadius: 0,
      borderColor: theme.neutralQuaternaryAlt,
      ":focus": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: theme.themePrimary,
      },
      ":hover": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: theme.themePrimary,
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
      backgroundColor: theme.white,
    },
    itemsWrapper: {
      padding: 3,
    },
    text: {
      borderStyle: "solid",
      width: "100%",
      borderWidth: 1,
      backgroundColor: theme.white,
      borderRadius: 0,
      borderColor: theme.neutralQuaternaryAlt,
      ":focus": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: theme.themePrimary,
      },
      ":hover": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: theme.themePrimary,
      },
      ":after": {
        borderStyle: "solid",
        borderWidth: 1,
        // borderColor: theme.neutralQuaternaryAlt,
        borderColor: theme.themePrimary,
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
      borderBottomColor: theme?.neutralQuaternaryAlt,
      borderBottomStyle: "solid",
    }),
    filePickerButtonStyles: mergeStyles({
      position: "relative",
      top: -15,
    }),
    iconStyles: {
      paddingLeft: 2,
      fontWeight: 500,
      color: theme?.themePrimary,
    },
  });

  return {
    componentClasses,
    pickerStylesMulti,
    pickerStylesSingle,
    renderItemStylesSingle,
    renderItemStylesMulti,
    renderIconButtonRemoveStyles,
  };
};
