import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface IEmailUrlComponentProps {
  siteUrl: string;
  listTitle: string;
  itemId: number;
  fileName: string;
  fileRelativePath: string;
  spHttpClient: SPHttpClient;
}