import { override } from '@microsoft/decorators';
import { Log, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import * as strings from 'GraphBotApplicationCustomizerStrings';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import IGraphBotProps from './components/IGraphBotProps';
import ITenantDataProvider from '../../dataProviders/ITenantDataProvider';
import MockTenantDataProvider from '../../dataProviders/MockTenantDataProvider';
import TenantDataProvider from '../../dataProviders/TenantDataProvider';
import GraphBot from './components/GraphBot';

const LOG_SOURCE: string = 'GraphBotApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IGraphBotApplicationCustomizerProperties {

}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class GraphBotApplicationCustomizer
  extends BaseApplicationCustomizer<IGraphBotApplicationCustomizerProperties> {

  private _topPlaceHolder: PlaceholderContent;
  private _tenantDataProvider: ITenantDataProvider;

  @override
  public onInit(): Promise<void> {

    if (Environment.type === EnvironmentType.Local) {
      this._tenantDataProvider = new MockTenantDataProvider();
    } else {
      this._tenantDataProvider = new TenantDataProvider(this.context);
    }

    this._renderPlaceHolders();

    return Promise.resolve();
  }

  private _renderPlaceHolders(): void {

    // Check if the header placeholder is already set and if the header placeholder is available
    if (!this._topPlaceHolder && this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1) {
      this._topPlaceHolder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
        onDispose: () => {}
      });

      // The extension should not assume that the expected placeholder is available.
      if (!this._topPlaceHolder) {
        console.error('The expected placeholder was not found.');
        return;
      }

      if (this._topPlaceHolder.domElement) {
        const element: React.ReactElement<IGraphBotProps> = React.createElement(
          GraphBot,
          {
            context: this.context,
            tenantDataProvider: this._tenantDataProvider,
          } as IGraphBotProps
        );

        ReactDOM.render(element, this._topPlaceHolder.domElement);
      }
    }
  }
}
