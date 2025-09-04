import * as React from "react";

import { Button, Caption1, Subtitle1 } from "@fluentui/react-components";

import { Dismiss24Regular } from "@fluentui/react-icons";
import { IRenderHeaderProps } from "./IRenderHeaderProps";
import { Icon } from "@iconify/react";
import { useRenderHeaderStyles } from "./useRenderHeaderStyles";

export const RenderHeader: React.FunctionComponent<IRenderHeaderProps> = (
  props: React.PropsWithChildren<IRenderHeaderProps>
) => {
  const { onDismiss, title, description, icon, showCloseButton = true } = props;
  const styles = useRenderHeaderStyles();

  return (
    <>
      <div id="RenderHedaermain" className={styles.renderHeaderContent}>
        <div className={styles.renderHeaderHeader}>
          <Button
            style={{ display: showCloseButton ? "block" : "none" }}
            appearance="subtle"
            className={styles.closeButton}
            onClick={(ev: React.MouseEvent<HTMLButtonElement>) => {
              ev.stopPropagation();
              ev.preventDefault();
              onDismiss(false);
            }}
            icon={<Dismiss24Regular />}
          />

          <div className={styles.renderHeaderTitleContainer}>
            {React.isValidElement(icon) ? icon : <Icon icon={icon as string} />}
            <div className={styles.dialogTitleAndDescriptionContainer}>
              {React.isValidElement(title) ? (
                title
              ) : (
                <Subtitle1 className={styles.renderHeaderTitle}>
                  {title}
                </Subtitle1>
              )}
              {React.isValidElement(description) ? (
                description
              ) : (
                <Caption1 className={styles.renderHeaderDescription}>
                  {description}
                </Caption1>
              )}
            </div>
          </div>
        </div>
        <div className={styles.divider} />
      </div>
    </>
  );
};
