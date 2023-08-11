import { ServiceScope } from "@microsoft/sp-core-library";
import { MSGraphClientFactory } from "@microsoft/sp-http";

export interface ITopCommandBarProps {
  currentSiteUrl: string;
  siteId: string;
  serviceScope: ServiceScope;
  msGraphClientFactory: MSGraphClientFactory;
  useGraph: boolean;
  useTeamsites: boolean;  
  useCommsites: boolean;
  useHubsites: boolean;
  useTeams: boolean;
  isSiteOwner: boolean;
}