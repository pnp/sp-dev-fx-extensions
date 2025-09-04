import * as React from "react";
import { logger } from '../Services/LoggerService';
import {
  IAlertType,
  IQuickAction
} from "../Alerts/IAlerts";
import { IAlertItem } from "../Services/SharePointAlertService";
import styles from "./AlertItem.module.scss";

// Import new components
import AlertHeader from "./AlertHeader";
import AlertContent from "./AlertContent";
import AlertActions from "./AlertActions";



// ===== UTILITY FUNCTIONS =====


const parseAdditionalStyles = (stylesString?: string): React.CSSProperties => {
  if (!stylesString) return {};
  
  const styleObj: Record<string, string | number> = {};
  const stylesArray = stylesString.split(";").filter(s => s.trim());
  
  stylesArray.forEach(style => {
    const [key, value] = style.split(":");
    if (key?.trim() && value?.trim()) {
      const camelCaseKey = key.trim().replace(/-([a-z])/g, (_, group1) => group1.toUpperCase());
      const trimmedValue = value.trim();
      styleObj[camelCaseKey] = isNaN(Number(trimmedValue)) ? trimmedValue : Number(trimmedValue);
    }
  });
  
  return styleObj as React.CSSProperties;
};



// ===== INTERFACES =====
export interface IAlertItemProps {
  item: IAlertItem;
  remove: (id: string) => void;
  hideForever: (id: string) => void;
  alertType: IAlertType;
  // Carousel props
  isCarousel?: boolean;
  currentIndex?: number;
  totalAlerts?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}






const AlertItem: React.FC<IAlertItemProps> = ({
  item,
  remove,
  hideForever,
  alertType,
  isCarousel = false,
  currentIndex = 1,
  totalAlerts = 1,
  onNext,
  onPrevious
}) => {
  // Component state
  const [expanded, setExpanded] = React.useState(false);

  // Accessibility IDs
  const ariaControlsId = `alert-description-${item.id}`;


  // Event handlers
  const handlers = React.useMemo(() => ({
    toggleExpanded: () => setExpanded(prev => !prev),
    remove: (id: string) => remove(id),
    hideForever: (id: string) => hideForever(id),
    stopPropagation: (e: React.MouseEvent) => e.stopPropagation(),
  }), [remove, hideForever]);

  const handleQuickAction = React.useCallback((action: IQuickAction) => {
    switch (action.actionType) {
      case "link":
        if (action.url) {
          window.open(action.url, "_blank", "noopener,noreferrer");
        }
        break;
      case "dismiss":
        handlers.remove(item.id); // Use handlers.remove with item.id
        break;
      case "acknowledge":
        logger.debug('AlertItem', `Alert ${item.id} acknowledged`);
        handlers.remove(item.id); // Use handlers.remove with item.id
        break;
      case "custom":
        // Define a map of safe, allowed actions to prevent arbitrary code execution
        const allowedCustomActions: { [key: string]: (item: IAlertItem) => void } = {
          "showDetails": (item) => {
            logger.debug('AlertItem', `Showing details for alert: ${item.id}`);
            // Add your safe custom action implementations here
          },
          "logInteraction": (item) => {
            logger.debug('AlertItem', `User interacted with alert: ${item.id}`);
            // Safe logging action
          },
          "markAsRead": (item) => {
            logger.debug('AlertItem', `Marking alert as read: ${item.id}`);
            handlers.remove(item.id);
          }
        };

        if (action.callback && typeof allowedCustomActions[action.callback] === "function") {
          allowedCustomActions[action.callback](item);
        } else {
          logger.warn('AlertItem', `Unknown or disallowed custom action: ${action.callback}. Allowed actions: ${Object.keys(allowedCustomActions).join(', ')}`);
        }
        break;
    }
  }, [handlers.remove, item]);

  


  const baseContainerStyle = React.useMemo<React.CSSProperties>(() => ({
    backgroundColor: alertType.backgroundColor || "#389899",
    color: alertType.textColor || "#ffffff",
    ...parseAdditionalStyles(alertType.additionalStyles)
  }), [alertType]);

  const priorityStyle = React.useMemo(
    () =>
      alertType.priorityStyles
        ? alertType.priorityStyles[item.priority as keyof typeof alertType.priorityStyles]
        : "",
    [alertType.priorityStyles, item.priority]
  );

  const containerStyle = React.useMemo<React.CSSProperties>(() => ({
    ...baseContainerStyle,
    ...parseAdditionalStyles(priorityStyle),
    ...(item.priority === "critical" && {
      boxShadow: '0 4px 12px rgba(232, 17, 35, 0.15)'
    })
  }), [baseContainerStyle, priorityStyle, item.priority]);

  const containerClassNames = [
    styles.container,
    styles.clickable,
    item.priority === "critical" ? styles.critical : '',
    item.priority === "high" ? styles.high : '',
    item.priority === "medium" ? styles.medium : '',
    item.priority === "low" ? styles.low : '',
    item.isPinned ? styles.pinned : ''
  ].filter(Boolean).join(' ');

  

  // Use native Fluent UI v9 dialog styling - no custom overrides needed

  return (
    <div className={styles.alertItem}>
      <div className={containerClassNames} style={containerStyle}>
        <div 
          className={styles.headerRow} 
          onClick={handlers.toggleExpanded} 
          role="button" 
          tabIndex={0} 
          aria-expanded={expanded} 
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handlers.toggleExpanded();
            }
          }}
        >
          <AlertHeader
            item={item}
            expanded={expanded}
            toggleExpanded={handlers.toggleExpanded}
            ariaControlsId={ariaControlsId}
          />
          <AlertActions
            item={item}
            isCarousel={isCarousel}
            currentIndex={currentIndex}
            totalAlerts={totalAlerts}
            onNext={onNext}
            onPrevious={onPrevious}
            expanded={expanded}
            toggleExpanded={handlers.toggleExpanded}
            remove={handlers.remove}
            hideForever={handlers.hideForever}
            stopPropagation={handlers.stopPropagation}
          />
        </div>
        <AlertContent
          item={item}
          expanded={expanded}
          stopPropagation={handlers.stopPropagation}
        />
      </div>
    </div>
  );
};

export default AlertItem;