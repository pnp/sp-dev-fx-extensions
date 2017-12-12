import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import PageHeader from "./components/PageHeader";
import IPageHeaderProps from "./components/IPageHeaderProps";
import * as strings from 'GraphBotApplicationCustomizerStrings';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const LOG_SOURCE: string = 'GraphBotApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IGraphBotApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class GraphBotApplicationCustomizer
  extends BaseApplicationCustomizer<IGraphBotApplicationCustomizerProperties> {

  private _topPlaceHolder: PlaceholderContent;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    let message: string = this.properties.testMessage;
    if (!message) {
      message = '(No properties were provided.)';
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
        console.error('The expected placeholder (PageHeader) was not found.');
        return;
      }

      if (this._topPlaceHolder.domElement) {
        const element: React.ReactElement<IPageHeaderProps> = React.createElement(
          PageHeader,
          {
            context: this.context,
          }
        );
        ReactDOM.render(element, this._topPlaceHolder.domElement);
      }
    }
  }
}
