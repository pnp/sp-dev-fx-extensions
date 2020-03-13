import { Icon, Link } from "office-ui-fabric-react";
import styles from "./Attachment.module.scss";
import * as React from "react";
import { getTheme } from "office-ui-fabric-react/lib/Styling";

const theme = getTheme();
const { palette, fonts } = theme;

export const Attachment = (props: { fileUrl: string; name: string }) => {
  const _fileSplit = props.name.split(".");
  const _fileType = _fileSplit && _fileSplit.length > 0 ? _fileSplit[1] : null;
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
        padding: 10
      }}
    >
      {_isImage ? (
        <img src={props.fileUrl} width="100%" />
      ) : (
        <>
          <Icon
            iconName="Attach"
            styles={{
              root: {
                color: palette.themePrimary,
                fontSize: 22,
                marginRight: 7
              }
            }}
          ></Icon>
          <Link href={props.fileUrl}>
            <div className={styles.attchmentFileName}>{props.name}</div>
          </Link>
        </>
      )}
    </div>
  );
};
