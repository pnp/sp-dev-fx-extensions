import { SPHttpClient } from '@microsoft/sp-http';

export interface INotificationAdminProps {
  client: SPHttpClient;
  rootUrl: string;
}
