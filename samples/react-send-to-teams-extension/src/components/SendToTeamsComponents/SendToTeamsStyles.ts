import React from "react";

import {
  IButtonStyles,
  IDatePickerStyles,
  IDocumentCardStyles,
  IDropdownStyles,
  IIconStyles,
  IStackStyles,
  ITextFieldStyles,
  ITextStyles,
  mergeStyles,
  mergeStyleSets,
} from "office-ui-fabric-react";


import { GlobalStateContext } from "../../globalState";
import  {Theme } from "spfx-uifabric-themes";

export const useSendToTeamsStyles = (
  theme:   Theme | undefined,

) => {


const dropDownStyles: Partial<IDropdownStyles> ={

  title:{

    borderStyle: "solid",
    borderWidth: 0,
    borderColor:theme.neutralQuaternaryAlt,
    ":focus": {
      borderStyle: "solid",
      borderWidth: 0,
      borderColor:theme.themePrimary,
    },
    ":hover": {
      borderStyle: "solid",
      borderWidth: 0,
      borderColor:theme.themePrimary,
    },
    ":active": {
      borderStyle: "solid",
      borderWidth: 0,
      borderColor:theme.themePrimary,
    },
    ":after":{
      borderStyle: "solid",
      borderWidth: 0,
      borderColor:theme.themePrimary,
    }
 },

  dropdown:{
    borderStyle: "solid",
      borderWidth: 1,
      borderColor:theme.neutralQuaternaryAlt,
      fontSize:theme["ms-font-xLarge-fontSize"],
      ":focus": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor:theme.themePrimary,
      },
      ":hover": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor:theme.themePrimary,
      },
      ":focus::after":{
        borderRadius: 0,
        border: `0px solid ${theme.themePrimary}`
      }
  },
  root:{
     width:"100%",
     borderStyle: "solid",
     borderWidth: 0,
     borderColor:theme.neutralQuaternaryAlt,
  }
};
  const textHeaderStyles : Partial<ITextStyles> ={
    root: { color: theme?.themePrimary }
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
      borderBottomColor:theme?.neutralQuaternaryAlt,
      borderBottomStyle: "solid",
    }),
    filePickerButtonStyles: mergeStyles({
      position: "relative",
      top: -15,
     /*  borderWidth: 1.5,
      borderStyle: "solid",
      borderRadius: "50%",
      width: 45,
      height: 45,
      paddigng: 5,
       color:theme.accent,
       backgroundColor:theme.neutralLighterAlt,
      borderColor:theme.neutralLight */
    }),
    iconStyles:{
      paddingLeft: 2, fontWeight: 500, color: theme?.themePrimary
    }
  });


  const titleStyle: IDocumentCardStyles = {
    root: {
      minHeight: 280,
      maxHeight: 280,
      brackgroundColor:theme?.neutralPrimaryAlt,
      /*  maxWidth: 220, */
      boxShadow: "0 5px 15px rgba(50, 50, 90, .2)",
    },
  };

  const mainStackStyles: Partial<IStackStyles> = {
    root: {
      paddingTop: 20,
      paddingBottom: 10,
    },
  };
  const fieldStackStylesHeader: Partial<IStackStyles> = {
    root: { paddingTop: 10 },
  };
  const fieldStackStylesInput: Partial<IStackStyles> = {
    root: { paddingTop: 7 },
  };

  const actionButtonStyles: Partial<IButtonStyles> = {
    //  root: { margin: 0, width: 35, height: 35 },
    root: {
      width: 30,
      height: 30,
      color:theme?.accent,
      backgroundColor:theme.neutralLighterAlt,
      borderRadius: "50%",
      borderColor:theme.neutralLight,
    },
    icon: {
      fontSize: 12,
    },
    rootHovered: {
      borderColor:theme.themePrimary,
    },
  };

  const actionIconStyles: Partial<IIconStyles> = {};

  const textFieldDisplayNameStyles: Partial<ITextFieldStyles> = {
    root:{marginBottom: 7, width: '100%', color: theme?.themePrimary },
    field: {
      borderStyle: "solid",
      borderWidth: 1,
      borderColor:theme.neutralQuaternaryAlt,
      fontSize:theme["ms-font-xLarge-fontSize"],
      ":focus": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor:theme.themePrimary,
      },
      ":hover": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor:theme.themePrimary,
      },
    },
  };

  const textFieldStyles: Partial<ITextFieldStyles> = {
    root: {marginBottom: 7, width: "100%"},
    field: {
      borderStyle: "solid",
      borderWidth: 1,
      borderColor:theme.neutralQuaternaryAlt,
      ":focus": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor:theme.themePrimary,
      },
      ":hover": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor:theme.themePrimary,
      },
    },
  };


  const dateFieldStyles: Partial<IDatePickerStyles> ={
    root:{
      width: '100%',
      borderStyle: "solid",
      borderWidth: 1,
      marginBottom: 5,
      borderColor:theme.neutralQuaternaryAlt,
      ":hover": {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor:theme.themePrimary,
      },
    },
  };

  const tilesContainer = mergeStyles({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
    gridColumnGap: "1rem",
    gridRowGap: "5px",
    padding: 10
  });

  const documentCardStyles: Partial<IDocumentCardStyles> = {
    root: {
      minHeight: 130,
      maxHeight: 130,
      /*  maxWidth: 220, */
      boxShadow: "0 15px 35px rgba(50, 50, 90, .1)",
    },
  };



  return {
    actionButtonStyles,
    titleStyle,
    componentClasses,
    mainStackStyles,
    fieldStackStylesHeader,
    actionIconStyles,
    textFieldStyles,
    fieldStackStylesInput,
    textFieldDisplayNameStyles,
    dateFieldStyles,
    textHeaderStyles,
    tilesContainer,
    documentCardStyles,
    dropDownStyles
  };
};
