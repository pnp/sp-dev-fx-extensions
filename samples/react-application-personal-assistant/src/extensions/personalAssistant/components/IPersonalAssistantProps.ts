import { HttpClient, MSGraphClientFactory } from '@microsoft/sp-http';

export interface IPersonalAssistantProps {
  httpClient: HttpClient;
  msGraphClientFactory: MSGraphClientFactory;
  currentUserEmail: string;
}
