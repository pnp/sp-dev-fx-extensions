import { IActiveConnection } from "../../models/IActiveConnection";
import { IErrorInfo } from "../../models/IErrorInfo";
import { IListLastActivity } from "../../models/IListLastActivity";
import { IConfigurationListItem } from "../ConfigurationList";
export interface IGlobalState {
    errorInfo: IErrorInfo | undefined;
    lists: IConfigurationListItem[];
    listActivities: IListLastActivity[];
    numberOfNotifications: number;
    activeConnections?: IActiveConnection[];
}
//# sourceMappingURL=IGlobalState.d.ts.map