import { HttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { IFlowsServiceInput } from './IFlowsServiceInput';
import Constants from '../../model/Constants';
import { IFlowItem } from '../../model/listItem/IFlowItem';

export default class FlowsService {

    private httpClient: HttpClient = null;
    private tenantId: string = null;
    private token: any = null;

    constructor(input: IFlowsServiceInput) {
        this.httpClient = input.httpClient;
        this.tenantId = input.tenantId;
        this.token = input.token;
    }

    public async getFlowsData(): Promise<IFlowItem[]> {
        let result: IFlowItem[] = [];
        const url = Constants.activeFlowsUrl.replace('{tenantId}', this.tenantId);
        const response = await this.httpClient
            .get(url,
                HttpClient.configurations.v1,
                {
                    headers: {
                        authorization: `Bearer ${this.token}`,
                        accept: 'application/json'
                    },
                });
        const output = await response.json();

        result = output.value.map((item, index) => {
            return {
                key: index,
                id: item.name,
                tenantId: this.tenantId,
                name: item.properties.displayName,
                type: item.properties.definitionSummary.triggers[0].type,
                enabled: item.properties.state == 'Started'
            };
        });
        return result;
    }

    public getFlowDetails(flow: IFlowItem): Promise<HttpClientResponse> {
        const url = Constants.flowsRunsUrl.replace('{tenantId}', this.tenantId).replace('{flowId}', flow.id);
        return this.httpClient
            .get(url,
                HttpClient.configurations.v1,
                {
                    headers: {
                        authorization: `Bearer ${this.token}`,
                        accept: 'application/json'
                    },
                });
    }
}