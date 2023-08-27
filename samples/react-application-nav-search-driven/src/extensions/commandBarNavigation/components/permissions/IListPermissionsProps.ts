import { ServiceScope } from "@microsoft/sp-core-library";

export interface IListPermissionsProps {
    currentSiteUrl: string;
    serviceScope: ServiceScope;
    isSiteOwner: boolean;
  }