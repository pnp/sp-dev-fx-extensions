import * as React from "react";
import { tokens, Button } from "@fluentui/react-components";
import { Link24Regular } from "@fluentui/react-icons";
import { IAlertItem } from "../Services/SharePointAlertService";
import DescriptionContent from "./DescriptionContent";
import styles from "./AlertItem.module.scss";

interface IAlertContentProps {
  item: IAlertItem;
  expanded: boolean;
  stopPropagation: (e: React.MouseEvent) => void;
}

const AlertContent: React.FC<IAlertContentProps> = React.memo(({ item, expanded, stopPropagation }) => {

  if (!expanded) return null;

  return (
    <div 
      className={styles.alertContentContainer}
      onClick={stopPropagation}
    >
      {/* Enhanced description content */}
      {item.description && (
        <div>
          <DescriptionContent description={item.description} />
        </div>
      )}
      
    </div>
  );
});

export default AlertContent;
