export interface ICustomSPHttpClient {
    /* eslint-disable @typescript-eslint/no-explicit-any*/
    get(url: string): Promise<any>;
    post(url: string, body: object): Promise<any>;
}