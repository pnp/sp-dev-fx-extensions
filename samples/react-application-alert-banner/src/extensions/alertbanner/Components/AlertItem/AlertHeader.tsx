import * as React from "react";
import { Button, Text } from "@fluentui/react-components";
import { ChevronDown24Regular, ChevronUp24Regular } from "@fluentui/react-icons";
import { IAlertItem } from "../Services/SharePointAlertService";
import { htmlSanitizer } from "../Utils/HtmlSanitizer";
import { getPriorityIcon } from "./utils"; // getPriorityIcon is exported from utils.tsx
import styles from "./AlertItem.module.scss";

interface IAlertHeaderProps {
  item: IAlertItem;
  expanded: boolean;
  toggleExpanded: () => void;
  ariaControlsId: string;
}

const AlertHeader: React.FC<IAlertHeaderProps> = React.memo(({ item, expanded, toggleExpanded, ariaControlsId }) => {
  return (
    <>
      <div className={styles.iconSection}>
        <div className={styles.alertIcon} title={`Priority: ${item.priority}`}>
          {getPriorityIcon(item.priority)}
        </div>
      </div>
      <div className={styles.textSection}>
        {item.title && (
          <Text className={styles.alertTitle} size={500} weight="semibold">
            {item.title}
          </Text>
        )}
        {!expanded && item.description && (
          <div className={styles.alertDescription} id={ariaControlsId}>
            <div
              className={styles.truncatedHtml}
              dangerouslySetInnerHTML={{ 
                __html: React.useMemo(() => 
                  htmlSanitizer.sanitizePreviewContent(item.description), 
                  [item.description]
                )
              }}
            />
          </div>
        )}
      </div>
      <div className={styles.actionSection}>
        <Button
          appearance="subtle"
          icon={expanded ? <ChevronUp24Regular /> : <ChevronDown24Regular />}
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-controls={ariaControlsId}
          aria-label={expanded ? "Collapse Alert" : "Expand Alert"}
          size="small"
        />
      </div>
    </>
  );
});

export default AlertHeader;
