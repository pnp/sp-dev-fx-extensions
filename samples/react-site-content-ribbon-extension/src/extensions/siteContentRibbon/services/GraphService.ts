import { Drive } from '@microsoft/microsoft-graph-types';
import { MSGraphClientV3 } from '@microsoft/sp-http-msgraph';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

export class GraphService {
  private readonly context: ApplicationCustomizerContext;
  private client: MSGraphClientV3 | undefined;

  constructor(context: ApplicationCustomizerContext) {
    this.context = context;
  }

  private readonly getClient = async (): Promise<MSGraphClientV3> => {
    if (!this.client) {
      this.client = await this.context.msGraphClientFactory.getClient('3');
    }
    return this.client;
  };

  public getDriveDetails = async (docLibraryName: string): Promise<Drive> => {
    const client = await this.getClient();
    const request = client.api(`/sites/${this.context.pageContext.site.id}/lists/${docLibraryName}/drive`);
    const response = await request.get();
    return Promise.resolve(response);
  };
}
