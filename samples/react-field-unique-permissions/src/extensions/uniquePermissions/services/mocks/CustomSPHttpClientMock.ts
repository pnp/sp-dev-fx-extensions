import { ICustomSPHttpClient } from "../interfaces";

export class CustomSPHttpClientMock implements ICustomSPHttpClient {
    /* eslint-disable @typescript-eslint/no-explicit-any*/
    get(url: string): Promise<any> {
        return Promise.resolve({ value: true });
    }
    post(url: string, body: object): Promise<any> {
        return Promise.resolve({ value: true });
    }
}