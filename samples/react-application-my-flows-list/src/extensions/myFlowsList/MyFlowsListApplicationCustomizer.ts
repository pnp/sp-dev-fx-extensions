import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import { IMyFlowsApplicationCustomizerProps } from './components/myFlowsApplicationCustomizer/IMyFlowsApplicationCustomizerProps';
import MyFlowsApplicationCustomizer from './components/myFlowsApplicationCustomizer/MyFlowsApplicationCustomizer';
import FlowsService from './services/flowsService/FlowsService';
import { IFlowsServiceInput } from './services/flowsService/IFlowsServiceInput';
import Constants from './model/Constants';
import { AadTokenProvider } from '@microsoft/sp-http';
import jwt_decode from 'jwt-decode';

const LOG_SOURCE: string = 'MyFlowsListApplicationCustomizer';

export interface IMyFlowsListApplicationCustomizerProperties {
  headerButtonRegion: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MyFlowsListApplicationCustomizer extends BaseApplicationCustomizer<IMyFlowsListApplicationCustomizerProperties> {
  private topPlaceholder: PlaceholderContent | undefined;
  private showInHeaderButtonRegion: boolean;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized MyFlowsListApplicationCustomizer`);

    this.showInHeaderButtonRegion = this.properties.headerButtonRegion;
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
    return Promise.resolve();
  }

  private async _renderPlaceHolders(): Promise<void> {
    if (!this.topPlaceholder) {
      this.topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, null);

      if (!this.topPlaceholder) {
        return;
      }

      if (this.properties) {
        if (this.topPlaceholder.domElement) {
          const provider: AadTokenProvider = await this.context.aadTokenProviderFactory.getTokenProvider();
          const token: any = await provider.getToken(Constants.flowService);
          const decodedToken: any = jwt_decode(token);
          const tenantId: string = decodedToken.tid;
          const input: IFlowsServiceInput = {
            httpClient: this.context.httpClient,
            tenantId: tenantId,
            token: token
          };
          const flowService: FlowsService = new FlowsService(input);

          const myFlowsApplicationCustomizer: React.ReactElement<IMyFlowsApplicationCustomizerProps> = React.createElement(MyFlowsApplicationCustomizer, {
            showInHeaderButtonRegion: this.showInHeaderButtonRegion,
            flowService
          });
          ReactDOM.render(myFlowsApplicationCustomizer, this.topPlaceholder.domElement);
        }
      }
    }
  }
}

