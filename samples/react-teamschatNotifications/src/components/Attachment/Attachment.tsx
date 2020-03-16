import { Icon, Link } from "office-ui-fabric-react";
import styles from "./Attachment.module.scss";
import * as React from "react";
import { getTheme } from "office-ui-fabric-react/lib/Styling";
import { FileTypeIcon, ApplicationType, IconType, ImageSize } from "@pnp/spfx-controls-react/lib/FileTypeIcon";

const theme = getTheme();
const { palette, fonts } = theme;

export const Attachment = (props: { fileUrl: string; name: string }) => {
  const _fileSplit = props.name.split(".");
  const _fileType = _fileSplit && _fileSplit.length > 0 ? _fileSplit[_fileSplit.length-1] : null;
  let _isImage: boolean = false;

  switch (_fileType) {
    case "jpg":
      _isImage = true;
      break;
    case "png":
      _isImage = true;
      break;
    case "jpeg":
      _isImage = true;
      break;
    case "gif":
      _isImage = true;
      break;
    case "svg":
      _isImage = true;
      break;
    default:
      break;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 10
      }}
    >
      {_isImage ? (
        <img src={props.fileUrl} width="100%" />
      ) : (
        <>
          <div style={{width:48}}>
          <FileTypeIcon path={props.fileUrl} size={ImageSize.medium} type={IconType.image}></FileTypeIcon>
          </div>
          <Link  href="#"  onClick={(event) => {window.open(`${props.fileUrl}?web=1`);}} >
            <div className={styles.attchmentFileName} title={props.name}>{props.name}</div>
          </Link>
        </>
      )}
    </div>
  );
};
