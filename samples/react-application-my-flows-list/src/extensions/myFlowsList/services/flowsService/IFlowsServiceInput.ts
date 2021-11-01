import { HttpClient } from '@microsoft/sp-http';

export interface IFlowsServiceInput {
    httpClient: HttpClient;
    tenantId: string;
    token: any;
}