import * as React from 'react';
import {
  ReactNode,
  useMemo,
} from 'react';

import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

import {
  ActivityItem,
  Link,
  Text,
} from '@fluentui/react';
import { Stack } from '@fluentui/react/lib/Stack';
import { ListItem } from '@microsoft/microsoft-graph-types';
import { Guid } from '@microsoft/sp-core-library';

import { PHOTO_URL } from '../../common';
import { IActivity } from '../../models/IActivities';
import { IConfigurationListItem } from '../ConfigurationList';
import { RenderItemAction } from './RenderItemAction';

export interface IRenderNotificationItemProps {
  list: IConfigurationListItem;
  activity: IActivity;
  item: ListItem;
}

export const RenderNotificationItem: React.FunctionComponent<IRenderNotificationItemProps> = (
  props: React.PropsWithChildren<IRenderNotificationItemProps>
) => {

  const { list, site } = props.list;
  const { action, actor, times, listItem } = props.activity;
  const { Title, id } = props.item?.fields as any || {};

  const activityDescription = useMemo((): ReactNode => {
    const itemDispFormUrl:string = props?.item?.webUrl.replace(`${id}_.000`,`dispForm.aspx?ID=${id}`);
    return  <>
      <Text key={Guid.newGuid().toString()} variant={"smallPlus"} styles={{ root: { fontWeight: 700 } }}>
        {actor.user.displayName}
      </Text>,
      <RenderItemAction action={action} item={props.item}></RenderItemAction>
      <Text variant={"smallPlus"}> in </Text>,
      <Link key={Guid.newGuid().toString()} style={{fontWeight:700}} href={site} target="_blank" data-interception="off">{list}</Link>,
   </>;
  }, [props]);

  return (
    <>
      <Stack>
        <ActivityItem
         key={Guid.newGuid().toString()}
          activityPersonas={[{ imageUrl: `${PHOTO_URL}${actor.user.email}`}]}
          activityDescription={activityDescription}
          timeStamp={format(parseISO(times.recordedDateTime), "PPpp")}
        ></ActivityItem>
      </Stack>
    </>
  );
};
