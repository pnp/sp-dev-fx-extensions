import { Guid } from "@microsoft/sp-core-library";

export interface ICommandInfo {
    List: IListInfo;
    Site: ISiteInfo;
    Web: ISiteInfo;
    User: IUserInfo;
    Fields?: any;
    ItemIds?: string[];
}

export interface IListInfo {
    Title: string;
    Url: string;
    Id: string;
}

export interface ISiteInfo {
    Id: string;
    AbsUrl: string;
    SerUrl: string;
}

export interface IUserInfo {
    DisplayName: string;
    Email: string;
    LoginName: string;
}