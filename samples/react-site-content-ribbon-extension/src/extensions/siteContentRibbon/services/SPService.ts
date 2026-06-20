import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IAppDetails } from '../models/IAppDetails';

export class SPService {
  private readonly context: ApplicationCustomizerContext;

  constructor(context: ApplicationCustomizerContext) {
    this.context = context;
  }

  public readonly getAppTiles = async (): Promise<IAppDetails[]> => {
    const response: SPHttpClientResponse = await this.context.spHttpClient.get(
      `${this.context.pageContext.web.absoluteUrl}/_api/web/apptiles`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch app tiles: ${response.statusText} (${response.status})`);
    }

    const responseJSON = await response.json();
    return responseJSON.value || [];
  };
}
