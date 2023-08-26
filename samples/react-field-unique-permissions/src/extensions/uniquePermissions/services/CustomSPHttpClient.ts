import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { ICustomSPHttpClient } from "./interfaces";
import { SPHttpClient, ISPHttpClientOptions } from '@microsoft/sp-http';

export class CustomSPHttpClient implements ICustomSPHttpClient {
    /* eslint-disable @typescript-eslint/no-explicit-any*/
    public static readonly serviceKey: ServiceKey<ICustomSPHttpClient> = ServiceKey.create<ICustomSPHttpClient>('CustomSPHttpClient', CustomSPHttpClient);
    private spHttpClient: SPHttpClient;
    private readonly headers: Headers = new Headers({
        "Accept": "application/json",
        "Content-Type": "application/json;odata=nometadata"
    });

    constructor(serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this.spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);
        });
    }

    public async get(url: string): Promise<any> {
        const { spHttpClient } = this;

        const options: ISPHttpClientOptions = {
            headers: this.headers
        };

        const response = await spHttpClient.get(url, SPHttpClient.configurations.v1, options);
        return response.json();
    }

    public async post(url: string, body: any): Promise<any> {
        const { spHttpClient } = this;

        const options: ISPHttpClientOptions = {
            headers: this.headers,
            body: body
        };

        const response = await spHttpClient.post(url, SPHttpClient.configurations.v1, options);
        return response.json();
    }
}