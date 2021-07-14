import * as React from "react";
import { useContext } from "react";

import strings from "MyListsNotificationsApplicationCustomizerStrings";

import { IconButton, IRenderFunction, Link } from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import { IPanelProps, Panel } from "@fluentui/react/lib/Panel";
import { Stack, StackItem } from "@fluentui/react/lib/Stack";
import { Text } from "@fluentui/react/lib/Text";
import Badge from "@material-ui/core/Badge";
import { FontIcon } from "@microsoft/office-ui-fabric-react-bundle";

import { ConfigurationList } from "../ConfigurationList";
import { EGlobalStateTypes, GlobalStateContext } from "../GlobalStateProvider";
import { RenderNotification } from "../RenderNotification/RenderNotification";
import { useBadgeStyles } from "./useBadgeStyles";

export interface INotificationBadgeProps {
  numberOfNotifications: number;
  iconName: string;
}

export const NotificationBadge: React.FunctionComponent<INotificationBadgeProps> = (
  props: React.PropsWithChildren<INotificationBadgeProps>
) => {
  const { numberOfNotifications, iconName } = props;
  const [isOpenPanel, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
  const [isShowSettings, { setTrue: showSettings, setFalse: dismissSettings }] = useBoolean(false);
  const { panelTitleStyles, iconTitleStyles } = useBadgeStyles();
  const { state, setGlobalState } = useContext(GlobalStateContext);

  const onRenderNavigationContent: IRenderFunction<IPanelProps> = React.useCallback(
    (_props, defaultRender) => (
      <>
        <Stack horizontal verticalAlign="center" horizontalAlign="start" styles={panelTitleStyles}>
          <StackItem grow={2}>
            <Text variant="xLarge">{strings.MyListsNotificationsLabel}</Text>
          </StackItem>

          <IconButton
            iconProps={{ iconName: "Settings", styles: { ...iconTitleStyles } }}
            title={strings.MySettingsLabel}
            onClick={(ev) => {
              showSettings();
            }}
          />
          <IconButton
            iconProps={{ iconName: "cancel", styles: { ...iconTitleStyles } }}
            title="Close"
            onClick={(ev) => {
              dismissPanel();
            }}
          />
        </Stack>
      </>
    ),
    []
  );

  return (
    <>
      <Stack horizontal verticalAlign="center" horizontalAlign={"end"} tokens={{ padding: 5 }} onClick={openPanel}>
        <Badge badgeContent={numberOfNotifications} color="error">
          <FontIcon iconName={iconName} style={{ fontSize: 20, width: 20, height: 20 }}></FontIcon>
        </Badge>
      </Stack>
      <Panel
        isBlocking
        isOpen={isOpenPanel}
        closeButtonAriaLabel="Close"
        onRenderNavigationContent={onRenderNavigationContent}
      >
        <Stack tokens={{ childrenGap: 10 }} styles={{ root: { paddingTop: 25, paddingBottom: 30 } }}>
          {numberOfNotifications && (
            <Stack horizontal horizontalAlign="end">
              <Link
                onClick={() => {
                  setGlobalState({
                    type: EGlobalStateTypes.SET_LIST_ACTIVITY,
                    payload: [],
                  });
                  setGlobalState({
                    type: EGlobalStateTypes.SET_NUMBER_OF_NOTIFICATIONS,
                    payload: 0,
                  });
                }}
              >
                {strings.ClearAllLabel}
              </Link>
            </Stack>
          )}
          <RenderNotification></RenderNotification>
        </Stack>
        <ConfigurationList isOpen={isShowSettings} onDismiss={dismissSettings} />
      </Panel>
    </>
  );
};
