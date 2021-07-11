import * as React from 'react';
import { ListItem } from '@microsoft/microsoft-graph-types';
import { IActivity } from '../../models/IActivities';
import { IConfigurationListItem } from '../ConfigurationList';
export interface IRenderNotificationItemProps {
    list: IConfigurationListItem;
    activity: IActivity;
    item: ListItem;
}
export declare const RenderNotificationItem: React.FunctionComponent<IRenderNotificationItemProps>;
//# sourceMappingURL=RenderNotificationItem.d.ts.map