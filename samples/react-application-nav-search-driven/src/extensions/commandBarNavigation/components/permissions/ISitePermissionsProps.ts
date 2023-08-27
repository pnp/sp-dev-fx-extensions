import { ServiceScope } from "@microsoft/sp-core-library";

export interface ISitePermissionsProps {
  currentSiteUrl: string;
  serviceScope: ServiceScope;
  isSiteOwner: boolean;
}