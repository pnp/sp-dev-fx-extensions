import { DriveItem, ListItem, Subscription } from "@microsoft/microsoft-graph-types";
import { IConfigurationListItem } from "../components";
import { IActivity } from "../models/IActivities";
export declare enum EListType {
    "file" = "file",
    "listItem" = "listItem"
}
export declare const useMsGraphAPI: () => {
    getSiteInfo: (siteId: string) => Promise<any>;
    getLists: (searchString: string) => Promise<any>;
    getListInfo: (siteId: string, listId: string) => Promise<any>;
    createAppFolder: (folderName: string) => Promise<void>;
    saveSettings: (settings: string) => Promise<void>;
    getSettings: () => Promise<IConfigurationListItem[]>;
    getListSockectIo: (siteId: string, listId: string) => Promise<Subscription>;
    getListActivities: (siteId: string, listId: string) => Promise<IActivity[]>;
    getListItem: (siteId: string, listId: string, activity: IActivity) => Promise<{
        itemInfo: ListItem | DriveItem;
        type: string;
    }>;
};
//# sourceMappingURL=useMsGraphAPI.d.ts.map