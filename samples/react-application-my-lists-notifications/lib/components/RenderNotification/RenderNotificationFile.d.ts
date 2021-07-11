import * as React from "react";
import { DriveItem } from "@microsoft/microsoft-graph-types";
import { IActivity } from "../../models/IActivities";
import { IConfigurationListItem } from "../ConfigurationList";
export interface IRenderNotificationFileProps {
    list: IConfigurationListItem;
    activity: IActivity;
    item: DriveItem;
}
export declare const RenderNotificationFile: React.FunctionComponent<IRenderNotificationFileProps>;
//# sourceMappingURL=RenderNotificationFile.d.ts.map