import * as React from "react";
import { ReactNode, useMemo } from "react";

import format from "date-fns/format";
import parseISO from "date-fns/parseISO";

import { ActivityItem, Link, Stack, Text } from "@fluentui/react";
import { DriveItem } from "@microsoft/microsoft-graph-types";
import { Guid } from "@microsoft/sp-core-library";

import { PHOTO_URL } from "../../common";
import { IActivity } from "../../models/IActivities";
import { IConfigurationListItem } from "../ConfigurationList";
import { RenderFileAction } from "./RenderFileAction";

export interface IRenderNotificationFileProps {
  list: IConfigurationListItem;
  activity: IActivity;
  item: DriveItem;
}

export const RenderNotificationFile: React.FunctionComponent<IRenderNotificationFileProps> = (
  props: React.PropsWithChildren<IRenderNotificationFileProps>
) => {
  const { list, site } = props.list;
  const { action, actor, times, driveItem } = props.activity;

  const activityDescription = useMemo((): ReactNode => {
    return (
      <>
        <Text key={Guid.newGuid().toString()} variant={"smallPlus"} styles={{ root: { fontWeight: 700 } }}>
          {actor.user.displayName}
        </Text>
        <Text variant={"smallPlus"} key={Guid.newGuid().toString()}>
          <RenderFileAction action={action} item={driveItem} />
        </Text>

        <Text variant={"smallPlus"}> in </Text>
        <Link
          key={Guid.newGuid().toString()}
          style={{ fontWeight: 700 }}
          href={site}
          target="_blank"
          data-interception="off"
        >
          {list}
        </Link>
      </>
    );
  }, [props]);

  return (
    <div key={Guid.newGuid().toString()}>
      <Stack>
        <ActivityItem
          key={Guid.newGuid().toString()}
          activityPersonas={[{ imageUrl: `${PHOTO_URL}${actor.user.email}` }]}
          activityDescription={activityDescription}
          timeStamp={format(parseISO(times.recordedDateTime), "PPpp")}
        ></ActivityItem>
      </Stack>
    </div>
  );
};
