import * as React from "react";
import { useCallback, useContext, useEffect, useState } from "react";

import { pullAllBy } from "lodash";

import { Spinner, SpinnerSize } from "@fluentui/react";
import { IconButton } from "@fluentui/react/lib/components/Button";
import { DocumentCard, DocumentCardDetails } from "@fluentui/react/lib/DocumentCard";
import { Stack } from "@fluentui/react/lib/Stack";
import { Text } from "@fluentui/react/lib/Text";
import { Guid } from "@microsoft/sp-core-library";

import { EItemType } from "../../common/EItemType";
import { useMsGraphAPI } from "../../hooks";
import { EGlobalStateTypes, GlobalStateContext } from "../GlobalStateProvider";
import { RenderNotificationFile } from "./RenderNotificationFile";
import { RenderNotificationItem } from "./RenderNotificationItem";
import { useRenderNotificationStyles } from "./useRenderNotificationStyles";

export interface IRenderNotificationProps {}

export const RenderNotification: React.FunctionComponent<IRenderNotificationProps> = (
  props: React.PropsWithChildren<IRenderNotificationProps>
) => {
  const [renderNotifications, setRenderNotifications] = useState<JSX.Element[]>([]);
  const { state, setGlobalState } = useContext(GlobalStateContext);
  const { documentCardStyles, itemContainerStyles } = useRenderNotificationStyles();
  const [, setIsLoading] = useState<boolean>(false);
  const { getListItem } = useMsGraphAPI();

  const { listActivities } = state;
  const _renderNoNotifications = useCallback(async (): Promise<JSX.Element[]> => {
    const wRender: JSX.Element[] = [];

    wRender.push(
      <DocumentCard styles={documentCardStyles} key={"noData"}>
        <DocumentCardDetails key={Guid.newGuid().toString()}>
          <Stack
            horizontal
            horizontalAlign="center"
            verticalAlign="center"
            tokens={{ padding: 20 }}
            key={Guid.newGuid().toString()}
          >
            <Text variant={"smallPlus"}>There is no notifications</Text>
          </Stack>
        </DocumentCardDetails>
      </DocumentCard>
    );

    return wRender;
  }, []);

  const _renderNotifications = useCallback(async (): Promise<JSX.Element[]> => {
    const wRender: JSX.Element[] = [];
    setIsLoading(true);
    for (const listActivity of listActivities) {
      const { listInfo, activitity } = listActivity;
      const { itemInfo, type } = await getListItem(listInfo?.siteId, listInfo?.key as string, activitity);
      wRender.push(
        <DocumentCard styles={documentCardStyles} key={Guid.newGuid().toString()}>
          <Stack horizontal horizontalAlign="end" key={Guid.newGuid().toString()}>
            <IconButton
              key={Guid.newGuid().toString()}
              iconProps={{ iconName: "cancel" }}
              style={{ fontSize: 10 }}
              onClick={async (ev) => {
                const newListActivities = pullAllBy(listActivities, [listActivity]);
                setRenderNotifications(
                  listActivities.length ? await _renderNotifications() : await _renderNoNotifications()
                );
                setGlobalState({
                  type: EGlobalStateTypes.SET_LIST_ACTIVITY,
                  payload: newListActivities,
                });
                setGlobalState({
                  type: EGlobalStateTypes.SET_NUMBER_OF_NOTIFICATIONS,
                  payload: newListActivities.length,
                });
              }}
            ></IconButton>
          </Stack>
          <DocumentCardDetails key={Guid.newGuid().toString()}>
            <Stack
              key={Guid.newGuid().toString()}
              horizontal
              horizontalAlign="start"
              verticalAlign="center"
              tokens={{ childrenGap: 12 }}
              styles={itemContainerStyles}
            >
              {type === EItemType.listItem ? (
                <RenderNotificationItem
                  list={listInfo}
                  activity={activitity}
                  item={itemInfo}
                  key={Guid.newGuid().toString()}
                />
              ) : (
                <RenderNotificationFile
                  list={listInfo}
                  activity={activitity}
                  item={itemInfo}
                  key={Guid.newGuid().toString()}
                />
              )}
            </Stack>
          </DocumentCardDetails>
        </DocumentCard>
      );
    }
    setIsLoading(false);
    return wRender;
  }, [listActivities]);

  useEffect(() => {
    (async () => {
      setRenderNotifications(listActivities.length ? await _renderNotifications() : await _renderNoNotifications());
    })();
  }, [listActivities]);

  return (
    <>
      <Stack tokens={{ childrenGap: 5 }}>
        {!renderNotifications.length ? (
          <>
            <Stack horizontalAlign="center" verticalAlign="center">
              <Spinner size={SpinnerSize.medium}></Spinner>
            </Stack>
          </>
        ) : (
          renderNotifications
        )}
      </Stack>
    </>
  );
};
