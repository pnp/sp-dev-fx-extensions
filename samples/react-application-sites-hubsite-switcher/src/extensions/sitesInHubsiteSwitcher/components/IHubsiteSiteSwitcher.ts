import ApplicationCustomizerContext from "@microsoft/sp-application-base/lib/extensibility/ApplicationCustomizerContext";

export interface IHubsiteSiteSwitcherProps {
  context: ApplicationCustomizerContext;
}

export interface IHubsiteSiteSwitcherState {
    sitesInHubsite: ISiteInfo[];
}

export interface ISiteInfo {
    acronym: string;
    bannerImageUrl: string;
    bannerColor: string;
    contentTypeId: string;
    webTemplate: string;
    url: string;
    originalUrl: string;
    title: string;
    type: string;
    groupId?: string;
    webId: string;
    siteId: string;
}