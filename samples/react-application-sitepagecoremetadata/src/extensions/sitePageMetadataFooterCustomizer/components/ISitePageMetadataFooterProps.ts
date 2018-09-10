import { Version } from '@microsoft/sp-core-library';
import { SPHttpClient } from '@microsoft/sp-http';

export default interface INavigationProps {
    SitePageItemId:any;
    spHttpClient:SPHttpClient;
    CurrentSiteUrl:string;
    SitePagesListId:any
}
