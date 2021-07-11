import { List } from '@fluentui/react';
import { DriveItem, ListItem } from '@microsoft/microsoft-graph-types';
import { IActivity } from './IActivities';
export interface INotificationDetails {
    list: List;
    activity: IActivity;
    item: ListItem | DriveItem;
}
//# sourceMappingURL=INotificationDetails.d.ts.map