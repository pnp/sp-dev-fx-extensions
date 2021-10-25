import { SPHttpClient } from '@microsoft/sp-http';

export interface ICommandInfo {
    List: IListInfo;
    Pages?: IPageInfo[];
}

export interface ISelPageInfo {
    ID: number;
    Title: string;
    Path: string;
    PageLayoutType: string;
    Author: string;
    Editor: string;
    Modified: string;
    Created: string;
    LayoutToUpdate?: string;
    Filename: string;
    CheckedOutBy: string;
}

export interface IPageInfo {
    Name: string;
    Path: string;
    ID: number;
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