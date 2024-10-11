// AlertItem.tsx

import * as React from "react";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { IAlertItem, IAlertType } from "../Alerts/IAlerts.types";
import styles from "./AlertItem.module.scss";

export interface IAlertItemProps {
  item: IAlertItem;
  remove: (id: number) => void;
  alertType: IAlertType;
}

const AlertItem: React.FC<IAlertItemProps> = ({ item, remove, alertType }) => {
  const [expanded, setExpanded] = React.useState(false);
  const ariaControlsId = `alert-description-${item.Id}`;

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const handleRemove = () => {
    remove(item.Id);
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: alertType.backgroundColor,
    color: alertType.textColor,
    ...parseAdditionalStyles(alertType.additionalStyles),
  };

  const descriptionClassName = expanded
    ? styles.alertDescriptionExp
    : styles.alertDescription;

  // Render the link associated with the alert
  const renderLink = () => {
    if (!item.link) return null;
    return (
      <div className={styles.alertLink}>
        <a href={item.link.Url} title={item.link.Description}>
          {item.link.Description}
        </a>
      </div>
    );
  };

  return (
    <div className={styles.alertItem}>
      <div className={styles.container} style={containerStyle}>
        {/* Icon Section */}
        <div className={styles.iconSection}>
          <Icon iconName={alertType.iconName} className={styles.alertIcon} />
        </div>

        {/* Text Section */}
        <div className={styles.textSection}>
          {item.title && <div className={styles.alertTitle}>{item.title}</div>}
          {item.description && (
            <div
              className={descriptionClassName}
              id={ariaControlsId}
              dangerouslySetInnerHTML={{ __html: item.description }}
            ></div>
          )}
        </div>

        {/* Action Section */}
        <div className={styles.actionSection}>
        {renderLink()}
          <Icon
            iconName={expanded ? "ChevronUp" : "ChevronDown"}
            className={styles.toggleButton}
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-controls={ariaControlsId}
            aria-label={expanded ? "Collapse Alert" : "Expand Alert"}
          />
          <Icon
            iconName="ChromeClose"
            className={styles.closeButton}
            onClick={handleRemove}
            aria-label="Close Alert"
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to parse additional styles
const parseAdditionalStyles = (
  stylesString?: string
): React.CSSProperties => {
  if (!stylesString) return {};
  const stylesArray = stylesString.split(";").filter((s) => s.trim() !== "");
  const styles: Record<string, string | number> = {}; // Define as Record to allow dynamic keys
  stylesArray.forEach((style) => {
    const [key, value] = style.split(":");
    if (key && value) {
      const camelCaseKey = key
        .trim()
        .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      styles[camelCaseKey] = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim());
    }
  });
  return styles as React.CSSProperties; // Cast to CSSProperties
};

export default AlertItem;
