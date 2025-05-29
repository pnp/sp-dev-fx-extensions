import {
  Button,
  FluentProvider,
  IdPrefixProvider,
  Tooltip,
} from "@fluentui/react-components";

import CommandBar from "../commandBar/CommandBar";
import { ErrorBoundary } from "react-error-boundary";
import { IHealthServices } from "../../models/IServiceHealthResults";
import { IRenderBottomExtensionProps } from "./IRenderBottomExtensionProps";
import { Icon } from "@iconify/react";
import { IssueDetails } from "../issueDetails/IssueDetails";
import React from "react";
import { RenderDrawer } from "../renderDrawer";
import { RenderHeader } from "../renderHeader";
import { ServiceHealth } from "../serviceHealth/ServiceHealth";
import ShowError from "../showError/ShowError";
import Stack from "../stack/Stack";
import TypographyControl from "../typographyControl/TypographyControl";
import strings from "M365ServiceHealthApplicationCustomizerStrings";
import { useRefreshTrigger } from "../../hooks/useRefreshTrigger";
import { useStyles } from "./useStyles";

export const RenderBottomExtension: React.FC<IRenderBottomExtensionProps> = ({
  graphClientFactory,
  theme,
  scope,
}) => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = React.useState(false);
  

  const [refreshCount, triggerRefresh] = useRefreshTrigger();
  const [showDetails, setShowDetails] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<IHealthServices>();

  const toggleOpen = React.useCallback((): void => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const onClick = React.useCallback((): void => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const onDismiss = React.useCallback((): void => {
    setIsOpen(false);
  }, []);

  const onSelected = React.useCallback((selected: IHealthServices): void => {
    setSelectedItem(selected);
    setShowDetails(true);
  }, []);

  const commandBarOptions = React.useMemo(() => {
    return [];
  }, []);

  const onRefresh = React.useCallback((): void => {
    triggerRefresh();
    setSelectedItem(undefined);
    setShowDetails(false);
  }, [triggerRefresh]);

  const commandBarFarItems = React.useMemo(() => {
    return [
      {
        label: strings.Refresh,
        icon: <Icon icon="fluent-mdl2:refresh" />,
        onClick: onRefresh,
      },
    ];
  }, [onRefresh]);

  const onDismissDetails = React.useCallback((): void => {
    setShowDetails(false);
    setSelectedItem(undefined);
  }, []);

  const footerActions = React.useMemo(() => {
    return (
      <Stack direction="horizontal" justifyContent="end" width={"100%"}>
        <Button
          appearance="secondary"
          onClick={onDismiss}
          id="cancelButton"
          className={styles.buttonCancel}
        >
          {strings.Cancel}
        </Button>
      </Stack>
    );
  }, [onDismiss]);

  const fallbackRender = React.useCallback(({ error, resetErrorBoundary }) => {
    console.error(`[ServiceHealth: ${error.message}`);
    return <ShowError message={error.message}>{null}</ShowError>;
  }, []);

  return (
    <>
      <IdPrefixProvider value="service-health">
        <FluentProvider theme={theme}>
          <ErrorBoundary fallbackRender={fallbackRender}>
            <Stack
              direction="horizontal"
              justifyContent="end"
              alignItems="center"
              rowGap={"10px"}
              columnGap="10px"
              className={styles.root}
              padding="10px"
            >
              <TypographyControl>{strings.ServiceHealth}</TypographyControl>
              <Tooltip
                content="Click to view Service Health"
                relationship={"label"}
              >
                <Button
                  aria-label="Service Health"
                  id="serviceHealthButton"
                  icon={
                    <Icon icon="fluent-mdl2:health" width={48} height={48} />
                  }
                  onClick={onClick}
                />
              </Tooltip>
            </Stack>
            {isOpen && (
              <RenderDrawer
                isOpen={isOpen}
                onOpenChange={toggleOpen}
                style={{ width: "750px" }}
                position="end"
                classNameHeader={styles.drawerHeader}
                footerActions={footerActions}
              >
                <RenderHeader
                  icon={
                    <Icon icon="fluent-mdl2:health" width={38} height={38} />
                  }
                  description={strings.Description}
                  title={strings.Title}
                  onDismiss={onDismiss}
                />
                <Stack rowGap="10px">
                  <CommandBar
                    options={commandBarOptions}
                    faritems={commandBarFarItems}
                    className={styles.drawerContent}
                  />
                  <ServiceHealth
                    graphClientFactory={graphClientFactory}
                    refresh={refreshCount}
                    onSelected={onSelected}
                    scope={scope}
                  />
                </Stack>
              </RenderDrawer>
            )}
            {showDetails && selectedItem && (
              <IssueDetails
                selectedItem={selectedItem}
                onDismiss={onDismissDetails}
                isOpen={showDetails}
              />
            )}
          </ErrorBoundary>
        </FluentProvider>
      </IdPrefixProvider>
    </>
  );
};
