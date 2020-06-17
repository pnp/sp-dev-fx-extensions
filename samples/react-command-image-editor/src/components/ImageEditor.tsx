import "./ImageEditor/tui-image-editor.css";
import "tui-color-picker/dist/tui-color-picker.css";

import ImageEditor from "@toast-ui/react-image-editor";
import {
  FontWeights,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  IconButton,
  mergeStyles,
  mergeStyleSets,
  IIconProps,
  getTheme,
  BaseButton,
  Button,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
} from "office-ui-fabric-react";
import * as React from "react";
import { useState } from "react";
import { useConstCallback } from "@uifabric/react-hooks";
import { ThemeProvider, ThemeChangedEventArgs, IReadonlyTheme } from '@microsoft/sp-component-base';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import $ from 'jquery';

export interface IImageEditorProps {
  imageUrl: string;
  fileName: string;
  showPanel: boolean;
  themeVariant: IReadonlyTheme | undefined;
}

export const EditImage : React.FunctionComponent<IImageEditorProps> = (
  props: IImageEditorProps
) => {
  const [showPanel, setIsOpen] = useState(props.showPanel);
  const imageEditor:any = React.createRef();
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [messageError, setMessageError] = useState('');
  const dismissPanel = () => {
    const editorInstance = imageEditor.current.getInstance();
    editorInstance.destroy();
    setIsOpen(false);
    // props.onDismiss();
  };

  React.useEffect(() => {
    setIsOpen(true);


  }, [props]);


  const cancelIcon: IIconProps = { iconName: "Cancel" };
  const theme = props.themeVariant ?  props.themeVariant : getTheme();


  const contentStyles = mergeStyleSets({
    modaloverlay: {
      zIndex: 1000,
      backgroundColor: theme.palette.neutralLight,
      opacity: 0.6,
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%"

    },
    imageContainer: {
      width: "1024px",
      display: "flex",
      alignItems: "stretch",

    },
    container: {
      zIndex: 99999,
      display: "flex",
      borderStyle: "solid",
      boxShadow:
        "rgba(0, 0, 0, 0.22) 0px 25.6px 57.6px 0px, rgba(0, 0, 0, 0.18) 0px 4.8px 14.4px 0px",
      borderBlockWidth: "0 2 2 2",
      borderColor: theme.palette.neutralLight,
      boxSizing: "border-box",
      borderRadius: "0px",
      backgroundColor: theme.palette.white,
      flexDirection: "column",
      width: "1040",
      top: "50%",
      left: "50%",
      position: "fixed",
      paddingTop: 0,
      paddingLeft: 10,
      paddingRight: 10,
      paddingBottom: 10,
      transform: "translate(-50%, -50%)",

    },
    header: [
      // tslint:disable-next-line:deprecation
      theme.fonts.xLarge,
      {
      //  borderTop: `4px solid ${theme.palette.themePrimary}`,
        color: theme.palette.neutralPrimary,
        display: "flex",
        fontWeight: FontWeights.semibold,
        padding: "12px 12px 14px 24px",
      },
    ],
  });

  const iconButtonStyles = {
    root: {
      color: theme.palette.neutralPrimary,
      marginLeft: "auto",
      marginTop: "4px",
      marginRight: "2px",
    },
    rootHovered: {
      color: theme.palette.neutralDark,
    },
  };

//
const dataURLtoBlob = (dataurl:string) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
};


//
  const onSave =  async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setIsSaving(true);
      setHasError(false);
      setMessageError('');
      const editorInstance = imageEditor.current.getInstance();
      const file = editorInstance.toDataURL();
      const blob = dataURLtoBlob(file);
      await sp.web.getFileByServerRelativeUrl(props.imageUrl).setContentChunked(blob);
      setIsSaving(false);
      editorInstance.destroy();
      setIsOpen(false);
    } catch (error) {
      console.log(Error);
      setHasError(true);
      setMessageError(Error.toString());
      setIsSaving(false);
    }
  };




  return (
    <>
      {showPanel && (
        <>
        <div className={contentStyles.modaloverlay}></div>
        <div className={contentStyles.container} style={{zIndex: 9999}}>
          <div className={contentStyles.header}>
            <span>Edit Image - {props.fileName}</span>
            <IconButton
              styles={iconButtonStyles}
              iconProps={cancelIcon}
              disabled={isSaving  ? true : false}
              ariaLabel="Close popup modal"
              onClick={dismissPanel}
            />
          </div>
          <div className={contentStyles.imageContainer}>
            <ImageEditor
              includeUI={{
                loadImage: {
                  path: props.imageUrl,
                  name: "SampleImage",
                },
                menu: [
                  "crop",
                  "flip",
                  "rotate",
                  "draw",
                  "shape",
                  "text",
                  "filter",
                ],
                initMenu: "filter",
                uiSize: {
                  height: "70vh",
                  width: "100%",
                },
                menuBarPosition: "left",
              }}
              cssMaxHeight={500}
              cssMaxWidth={700}
              selectionStyle={{
                cornerSize: 20,
                rotatingPointOffset: 70,
              }}
              usageStatistics={true}
              ref={imageEditor}

            />
          </div>
          {
            hasError  && (
              <MessageBar style={{paddingTop: 5, paddingBottom: 5}} messageBarType={MessageBarType.error}>{messageError}</MessageBar>
            )
          }
          <DialogFooter>
            <PrimaryButton onClick={onSave}>{isSaving ? <div style={{width:'100%',display: 'flex', justifyContent:'center'}}><Spinner size={SpinnerSize.small}></Spinner></div> : 'Save' }</PrimaryButton>
            <DefaultButton onClick={dismissPanel} text="Cancel"   disabled={isSaving ? true : false} />
          </DialogFooter>
        </div>
        </>
      )
      }
    </>
  );
};
