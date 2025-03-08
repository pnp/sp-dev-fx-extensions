import * as React from "react";
import { IAlertRichMedia } from "../Alerts/IAlerts";
import { Text } from "@fluentui/react";
import { marked } from "marked";
import styles from "./RichMediaAlert.module.scss";

export interface IRichMediaAlertProps {
  media: IAlertRichMedia;
  expanded: boolean;
}

const RichMediaAlert: React.FC<IRichMediaAlertProps> = ({ media, expanded }) => {
  // Don't render anything if not expanded
  if (!expanded) {
    return null;
  }

  const renderMedia = () => {
    switch (media.type) {
      case "image":
        return (
          <div className={styles.imageContainer}>
            <img 
              src={media.content} 
              alt={media.altText || "Alert image"} 
              className={styles.alertImage}
            />
          </div>
        );

      case "video":
        return (
          <div className={styles.videoContainer}>
            <video 
              controls 
              className={styles.alertVideo}
              aria-label={media.altText || "Alert video"}
            >
              <source src={media.content} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "html":
        return (
          <div className={styles.htmlContainer}>
            <Text
              dangerouslySetInnerHTML={{ __html: media.content }}
            />
          </div>
        );

      case "markdown":
        // Convert markdown to HTML
        const htmlContent = marked(media.content);

        return (
          <div className={styles.markdownContainer}>
            <Text
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.richMediaContainer}>
      {renderMedia()}
    </div>
  );
};

export default RichMediaAlert;