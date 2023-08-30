import { ServiceScope } from "@microsoft/sp-core-library";

export interface ISharingLinksProps {
    currentSiteUrl: string;
    siteId: string;
    serviceScope: ServiceScope;
    isSiteOwner: boolean;
  }