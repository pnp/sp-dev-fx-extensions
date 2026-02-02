import { MSGraphClientFactory } from '@microsoft/sp-http';

export interface ISmartContextContainerProps {
  graphClientFactory: MSGraphClientFactory;
  currentPageUrl: string;
}
