import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { AadTokenProviderFactory } from "@microsoft/sp-http";
import { MSGraphClientFactory } from "@microsoft/sp-http-msgraph";

export interface IUserService {
  getUserToken(resourceEndpoint?: string): Promise<string>;
  getUserTokenDecoded(resourceEndpoint?: string): Promise<string>;
  getUserData(): Promise<any>;
}

export class UserService implements IUserService {

  private aadTokenProviderFactory: AadTokenProviderFactory;
  private msGraphClientFactory: MSGraphClientFactory;

  public static readonly serviceKey: ServiceKey<IUserService> =
    ServiceKey.create<IUserService>('CompanyTemplates.UserService', UserService);

  constructor(serviceScope: ServiceScope) {
    serviceScope.whenFinished(() => {
      this.aadTokenProviderFactory = serviceScope.consume(AadTokenProviderFactory.serviceKey);
      this.msGraphClientFactory = serviceScope.consume(MSGraphClientFactory.serviceKey);
    })
  }

  public async getUserToken(resourceEndpoint: string = 'https://graph.microsoft.com'): Promise<string> {
    return await this.aadTokenProviderFactory.getTokenProvider().then(async (tokenProvider) => {
      const token = await tokenProvider.getToken(resourceEndpoint);
      return token;
    })
  }

  public async getUserTokenDecoded(resourceEndpoint: string = 'https://graph.microsoft.com'): Promise<string> {
    const token = await this.getUserToken(resourceEndpoint);
    return this.decodeUserToken(token);
  }

  private decodeUserToken(token: string): string {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  }

  public async getUserData(): Promise<any> {
    return this.msGraphClientFactory.getClient("3").then(async client => {
      const data = await client.api('/me').get();
      return data;
    });
  }

}