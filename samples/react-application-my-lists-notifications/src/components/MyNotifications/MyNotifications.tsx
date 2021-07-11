import * as React from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import find from "lodash/find";

import { IStackStyles } from "@fluentui/react";
import { Stack } from "@fluentui/react/lib/Stack";
import { Subscription } from "@microsoft/microsoft-graph-types";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

import { useMsGraphAPI } from "../../hooks";
import { IActivity } from "../../models/IActivities";
import { IListLastActivity } from "../../models/IListLastActivity";
import { NotificationBadge } from "../Badge/index";
import { IConfigurationListItem } from "../ConfigurationList";
import { EGlobalStateTypes, GlobalStateContext } from "../GlobalStateProvider";
import { IActiveConnection } from "../../models/IActiveConnection";
import { useSocketIO } from "../../hooks/useSocketIO";
import { INotification } from "../../models/INotification";
export interface IMyNotificationsProps {
  context: ApplicationCustomizerContext;
  right?: number;
}

export const MyNotifications: React.FunctionComponent<IMyNotificationsProps> = (props: IMyNotificationsProps) => {
  const { state, setGlobalState } = useContext(GlobalStateContext);
  const wLists = useRef<IConfigurationListItem[]>([]);
  const { getListSockectIo, getSettings, getListActivities, getSiteInfoByRelativeUrl } = useMsGraphAPI();
  const wNumberOfNotifications = useRef<number>(0);
  const wListActivities = useRef<IListLastActivity[]>([]);
  const { context, right } = props;
  const siteTemplate = context.pageContext.legacyPageContext.webTemplateConfiguration;
  const COMUNICATION_SITE_ICON_POSITION = 143;
  const TEAM_SITE_ICON_POSITION = 190;
  const rightPosition =
    right && right > 0
      ? right
      : siteTemplate === "SITEPAGEPUBLISHING#0"
      ? COMUNICATION_SITE_ICON_POSITION
      : TEAM_SITE_ICON_POSITION;
  const containerStyles: IStackStyles = {
    root: {
      width: 48,
      height: 48,
      color: "#FFFFFF",
      backgroundColor: "rgba(61,112,131,.6)",
      position: "fixed",
      overflow: "hidden",
      fontFamily: "inherit",
      top: 0,
      right: rightPosition,
      zIndex: 100000,
      ":hover": {
        color: "#FFFFFF",
        backgroundColor: "rgba(4,31,42,.6)",
        cursor: "pointer",
      },
    },
  };

  useEffect(() => {
    setGlobalState({
      type: EGlobalStateTypes.SET_NUMBER_OF_NOTIFICATIONS,
      payload: wNumberOfNotifications.current,
    });
  }, [wNumberOfNotifications.current]);

  useEffect(() => {
    (async () => {
      const _lists = await getSettings();
      setGlobalState({
        type: EGlobalStateTypes.SET_LISTS,
        payload: _lists,
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      wLists.current = state.lists;
    })();
  }, [state.lists]);

  const handleNotifications = useCallback(async (data: string): Promise<void> => {
    wNumberOfNotifications.current++;
    const notifications: INotification[] = JSON.parse(data).value;
    for (const notification of notifications) {
      // get siteID from lists
      const siteInfo = await getSiteInfoByRelativeUrl(notification.siteUrl);
      const listInfo = find(wLists.current, { key: notification.resource, siteId: siteInfo.id });
      if (!listInfo) continue;
      const { siteId, key } = listInfo || {};
      const activities: IActivity[] = await getListActivities(siteId, key as string);
      wListActivities.current.push({
        listInfo: listInfo,
        activitity: activities[0],
      });
    }

    const copyListActivities = state.listActivities;
    setGlobalState({
      type: EGlobalStateTypes.SET_LIST_ACTIVITY,
      payload: [...copyListActivities, ...wListActivities.current].reverse(),
    });
  }, []);

  const { connectToSocketListServer, closeActiveConnections } = useSocketIO(handleNotifications);

  useEffect(() => {
    (async () => {
      const listConnections: IActiveConnection[] = [];
      closeActiveConnections();
      for (const list of state.lists) {
        const listSubScription = await getListSockectIo(list.siteId, list.key as string);
        const listSocket = connectToSocketListServer(listSubScription.notificationUrl);
        listConnections.push({ socket: listSocket, listId: list.key });
      }
      setGlobalState({
        type: EGlobalStateTypes.SET_ACTIVE_CONNECTIONS,
        payload: listConnections,
      });
    })();
  }, [state.lists]);

  return (
    <>
      <Stack verticalAlign="center" horizontalAlign="center" styles={containerStyles}>
        <NotificationBadge numberOfNotifications={state.numberOfNotifications} iconName="ringer" />
      </Stack>
    </>
  );
};
