import { IFieldInfo, IListInfo, IMappingFieldInfo, ISiteListInfo } from "../Models/IModel";

export interface ICommandHelper {
    getAllLists: (srcListId: string) => Promise<ISiteListInfo[]>;
    getListInfo: (listid?: string, listtitle?: string) => Promise<IListInfo>;
    getListFields: (listid?: string, listtitle?: string) => Promise<IFieldInfo[]>;
    getListItems: (fields: string[], listid?: string, listtitle?: string) => Promise<any[]>;
    getListItemsByIds: (fields: string[], itemids: string[], listid?: string, listtitle?: string) => Promise<any[]>;
    copyItems: (srcItems: any[], mappedFields: IMappingFieldInfo[], destListId: string, destEntType: string) => Promise<boolean>;
    moveItems: (srcItems: any[], srcListId: string, mappedFields: IMappingFieldInfo[], destListId: string, destEntType: string) => Promise<boolean>;
}
