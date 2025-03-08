import * as React from "react";
import {
  Icon,
  IIconProps,
  DefaultButton,
  IButtonProps,
  TooltipHost,
  Dialog,
  DialogType,
  IDialogContentProps,
  Text,
  FocusTrapZone,
  IContextualMenuProps,
  Stack,
  IStackTokens,
  FontWeights,
  ActionButton,
  IButtonStyles
} from "@fluentui/react";
import classNames from "classnames";
import {
  IAlertItem,
  IAlertType,
  AlertPriority,
  IQuickAction
} from "../Alerts/IAlerts";
import RichMediaAlert from "../Services/RichMediaAlert";
import styles from "./AlertItem.module.scss";
import richMediaStyles from "../Services/RichMediaAlert.module.scss";

// Helper function to parse additional styles
const parseAdditionalStyles = (stylesString?: string): React.CSSProperties => {
  if (!stylesString) return {};
  const stylesArray = stylesString.split(";").filter(s => s.trim() !== "");
  const styleObj: { [key: string]: string | number } = {};
  stylesArray.forEach(style => {
    const [key, value] = style.split(":");
    if (key && value) {
      const camelCaseKey = key
        .trim()
        .replace(/-([a-z])/g, (_, group1) => group1.toUpperCase());
      styleObj[camelCaseKey] = isNaN(Number(value.trim()))
        ? value.trim()
        : Number(value.trim());
    }
  });
  return styleObj as React.CSSProperties;
};

export interface IAlertItemProps {
  item: IAlertItem;
  remove: (id: number) => void;
  hideForever: (id: number) => void;
  alertType: IAlertType;
  richMediaEnabled?: boolean;
}

// Subcomponent to render the alert description
interface IDescriptionContentProps {
  description: string;
  stackTokens: IStackTokens;
  listStackTokens: IStackTokens;
}

const DescriptionContent: React.FC<IDescriptionContentProps> = React.memo(
  ({ description, stackTokens, listStackTokens }) => {
    // If description contains HTML tags, render it directly.
    if (/<[a-z][\s\S]*>/i.test(description)) {
      return (
        <div
          className={richMediaStyles.markdownContainer}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      );
    }

    const paragraphs = description.split("\n\n");
    return (
      <div className={richMediaStyles.markdownContainer}>
        <Stack tokens={stackTokens}>
          {paragraphs.map((paragraph, index) => {
            // Render lists if applicable
            if (paragraph.includes("\n- ") || paragraph.includes("\n* ")) {
              const [listTitle, ...listItems] = paragraph.split(/\n[-*]\s+/);
              return (
                <Stack key={`para-${index}`} tokens={listStackTokens}>
                  {listTitle.trim() && <Text block>{listTitle.trim()}</Text>}
                  {listItems.length > 0 && (
                    <Stack tokens={{ childrenGap: 4 }}>
                      {listItems.map((listItem, itemIndex) => (
                        <Stack
                          key={`list-item-${itemIndex}`}
                          horizontal
                          tokens={{ childrenGap: 8 }}
                          verticalAlign="start"
                        >
                          <Text>•</Text>
                          <Text block>{listItem.trim()}</Text>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Stack>
              );
            }

            // Render text with bold formatting if needed
            if (paragraph.includes("**") || paragraph.includes("__")) {
              const parts = paragraph.split(/(\*\*.*?\*\*|__.*?__)/g);
              return (
                <Text key={`para-${index}`} block>
                  {parts.map((part, partIndex) => {
                    if (
                      (part.startsWith("**") && part.endsWith("**")) ||
                      (part.startsWith("__") && part.endsWith("__"))
                    ) {
                      const boldText = part.slice(2, -2);
                      return (
                        <span
                          key={`part-${partIndex}`}
                          style={{ fontWeight: FontWeights.semibold }}
                        >
                          {boldText}
                        </span>
                      );
                    }
                    return part;
                  })}
                </Text>
              );
            }

            // Render as a simple paragraph
            return (
              <Text key={`para-${index}`} block>
                {paragraph}
              </Text>
            );
          })}
        </Stack>
      </div>
    );
  }
);

// Subcomponent for the alert link 
interface IAlertLinkProps {
  link?: {
    Url: string;
    Description: string;
  };
  isDialog?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement>) => void;
  containerStyle?: React.CSSProperties;
}

const AlertLinkButton: React.FC<IAlertLinkProps> = React.memo(
  ({ link, isDialog = false, onClick, containerStyle }) => {
    if (!link) return null;

    const buttonStyles: IButtonStyles = {
      root: {
        color: isDialog ? '#0078d4' : 'inherit',
        marginTop: isDialog ? 16 : 8,
        padding: isDialog ? '8px 12px' : '4px 8px',
        background: isDialog ? 'rgba(0, 120, 212, 0.08)' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        ...(containerStyle as any)
      },
      icon: {
        color: isDialog ? '#0078d4' : 'inherit',
        marginRight: 8
      },
      label: {
        fontWeight: isDialog ? 400 : 600
      }
    };

    return (
      <ActionButton
        iconProps={{ iconName: 'Link' }}
        text={link.Description}
        href={link.Url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={isDialog ? styles.dialogLink : styles.alertActionLink}
        styles={buttonStyles}
      />
    );
  }
);

const AlertItem: React.FC<IAlertItemProps> = ({
  item,
  remove,
  hideForever,
  alertType,
  richMediaEnabled = false
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Accessibility IDs
  const ariaControlsId = `alert-description-${item.Id}`;
  const dialogTitleId = `dialog-title-${item.Id}`;
  const dialogContentId = `dialog-content-${item.Id}`;

  // Stack tokens
  const stackTokens: IStackTokens = { childrenGap: 12 };
  const listStackTokens: IStackTokens = { childrenGap: 8 };

  // Placeholder for the contextual menu (fix TS error)
  const ContextualMenu = undefined as unknown as React.FunctionComponent<IContextualMenuProps>;

  const getPriorityIcon = React.useCallback(
    (priority: AlertPriority): string => {
      switch (priority) {
        case "critical":
          return "Warning";
        case "high":
          return "Important";
        case "medium":
          return "Info";
        case "low":
        default:
          return alertType.iconName;
      }
    },
    [alertType.iconName]
  );

  const toggleExpanded = React.useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const openReadMoreDialog = React.useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const closeDialog = React.useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleRemove = React.useCallback(() => {
    remove(item.Id);
  }, [item.Id, remove]);

  const handleHideForever = React.useCallback(() => {
    hideForever(item.Id);
  }, [item.Id, hideForever]);

  const handleActionClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  const handleQuickAction = React.useCallback(
    (action: IQuickAction) => {
      switch (action.actionType) {
        case "link":
          if (action.url) {
            window.open(action.url, "_blank");
          }
          break;
        case "dismiss":
          handleRemove();
          break;
        case "acknowledge":
          console.log(`Alert ${item.Id} acknowledged`);
          handleRemove();
          break;
        case "custom":
          if (action.callback && typeof (window as any)[action.callback] === "function") {
            (window as any)[action.callback](item);
          }
          break;
      }
    },
    [handleRemove, item.Id]
  );

  const renderQuickActions = React.useCallback(() => {
    if (!item.quickActions?.length) return null;
    return (
      <Stack
        horizontal
        wrap
        tokens={{ childrenGap: 8 }}
        className={styles.quickActions}
        onClick={handleActionClick}
      >
        {item.quickActions.map((action, index) => {
          const iconProps: IIconProps = {
            iconName: action.icon || "Link",
            className: styles.actionIcon
          };
          const buttonProps: IButtonProps = {
            iconProps,
            text: action.label,
            onClick: () => handleQuickAction(action),
            className: styles.actionButton
          };
          return <DefaultButton key={`${item.Id}-action-${index}`} {...buttonProps} />;
        })}
      </Stack>
    );
  }, [item.quickActions, handleActionClick, handleQuickAction, item.Id]);

  const renderDialogQuickActions = React.useCallback(() => {
    if (!item.quickActions?.length) return null;
    return (
      <Stack horizontal wrap tokens={{ childrenGap: 8 }} className={styles.dialogQuickActions}>
        {item.quickActions.map((action, index) => {
          if (action.actionType === "dismiss") return null;
          const iconProps: IIconProps = {
            iconName: action.icon || "Link",
            className: styles.actionIcon
          };
          const buttonProps: IButtonProps = {
            iconProps,
            text: action.label,
            onClick: () => {
              handleQuickAction(action);
              closeDialog();
            },
            className: styles.dialogActionButton
          };
          return <DefaultButton key={`dialog-${item.Id}-action-${index}`} {...buttonProps} />;
        })}
      </Stack>
    );
  }, [item.quickActions, handleQuickAction, closeDialog, item.Id]);

  const renderDialogFooter = React.useCallback(() => (
    <Stack
      horizontal
      horizontalAlign="space-between"
      verticalAlign="center"
      className={styles.dialogFooter}
      tokens={{ childrenGap: 10 }}
    >
      <Stack horizontal tokens={{ childrenGap: 8 }}>
        {renderDialogQuickActions()}
      </Stack>
    </Stack>
  ), [renderDialogQuickActions, closeDialog]);

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
      border: '2px solid #E81123',
      boxShadow: '0 0 10px rgba(232, 17, 35, 0.5)'
    })
  }), [baseContainerStyle, priorityStyle, item.priority]);

  const containerClassNames = classNames(
    styles.container,
    styles.clickable,
    {
      [styles.critical]: item.priority === "critical",
      [styles.high]: item.priority === "high",
      [styles.medium]: item.priority === "medium",
      [styles.low]: item.priority === "low",
      [styles.pinned]: item.isPinned
    }
  );

  const descriptionClassName = expanded ? styles.alertDescriptionExp : styles.alertDescription;

  const dialogContentProps: IDialogContentProps = React.useMemo(() => ({
    type: DialogType.normal,
    title: item.title,
    subText: "",
    titleId: dialogTitleId,
    closeButtonAriaLabel: "Close",
    showCloseButton: true,
    styles: {
      header: {
        backgroundColor: baseContainerStyle.backgroundColor,
        color: baseContainerStyle.color
      },
      title: {
        fontSize: "20px",
        fontWeight: 600,
        color: baseContainerStyle.color,
        paddingTop: "16px",
        paddingBottom: "16px"
      },
      inner: { padding: "0" },
      subText: { display: "none" }
    }
  }), [item.title, baseContainerStyle, dialogTitleId]);

  return (
    <div className={styles.alertItem}>
      <div
        className={containerClassNames}
        style={containerStyle}
        onClick={openReadMoreDialog}
        role="button"
        tabIndex={0}
        aria-expanded={isDialogOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openReadMoreDialog();
          }
        }}
      >
        <div className={styles.iconSection}>
          <TooltipHost content={`Priority: ${item.priority}`}>
            <Icon iconName={getPriorityIcon(item.priority)} className={styles.alertIcon} />
          </TooltipHost>
        </div>
        <div className={styles.textSection}>
          {item.title && (
            <Text className={styles.alertTitle} block variant="mediumPlus">
              {item.title}
            </Text>
          )}
          {item.description && (
            <div className={descriptionClassName} id={ariaControlsId}>
              {expanded ? (
                <DescriptionContent
                  description={item.description}
                  stackTokens={stackTokens}
                  listStackTokens={listStackTokens}
                />
              ) : (
                <div
                  className={styles.truncatedHtml}
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              )}
            </div>
          )}
          {item.richMedia && richMediaEnabled && (
            <div onClick={handleActionClick}>
              <RichMediaAlert media={item.richMedia} expanded={expanded} />
            </div>
          )}
          {expanded && (
            <Stack>
              {item.link && (
                <div onClick={handleActionClick}>
                  <AlertLinkButton 
                    link={item.link} 
                    onClick={handleActionClick}
                    containerStyle={{ color: baseContainerStyle.color }}
                  />
                </div>
              )}
              {renderQuickActions()}
            </Stack>
          )}
        </div>
        <div className={styles.actionSection} onClick={handleActionClick}>
          <TooltipHost content={expanded ? "Collapse" : "Expand"}>
            <Icon
              iconName={expanded ? "ChevronUp" : "ChevronDown"}
              className={styles.toggleButton}
              onClick={toggleExpanded}
              aria-expanded={expanded}
              aria-controls={ariaControlsId}
              aria-label={expanded ? "Collapse Alert" : "Expand Alert"}
            />
          </TooltipHost>
          <TooltipHost content="Dismiss">
            <Icon
              iconName="ChromeClose"
              className={styles.closeButton}
              onClick={handleRemove}
              aria-label="Dismiss Alert"
            />
          </TooltipHost>
          <TooltipHost content="Don't show again">
            <Icon
              iconName="Hide"
              className={styles.hideButton}
              onClick={handleHideForever}
              aria-label="Hide Alert Forever"
            />
          </TooltipHost>
        </div>
      </div>
      <Dialog
        hidden={!isDialogOpen}
        onDismiss={closeDialog}
        dialogContentProps={dialogContentProps}
        modalProps={{
          isBlocking: false,
          styles: {
            main: {
              maxWidth: 600,
              borderRadius: "4px",
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)"
            }
          },
          dragOptions: {
            moveMenuItemText: "Move",
            closeMenuItemText: "Close",
            menu: ContextualMenu
          },
          className: "alertDialogModal",
          layerProps: { eventBubblingEnabled: true }
        }}
      >
        <FocusTrapZone>
          <div
            className={styles.enhancedDialogContent}
            id={dialogContentId}
            role="region"
            aria-labelledby={dialogTitleId}
          >
            <Stack className={styles.dialogContent} tokens={stackTokens}>
              <div className={richMediaStyles.richMediaContainer}>
                <DescriptionContent
                  description={item.description}
                  stackTokens={stackTokens}
                  listStackTokens={listStackTokens}
                />
              </div>
              {item.richMedia && richMediaEnabled && (
                <div className={styles.dialogRichMedia}>
                  <RichMediaAlert media={item.richMedia} expanded={true} />
                </div>
              )}
              {item.link && (
                <AlertLinkButton link={item.link} isDialog={true} />
              )}
            </Stack>
            {renderDialogFooter()}
          </div>
        </FocusTrapZone>
      </Dialog>
    </div>
  );
};

export default AlertItem;