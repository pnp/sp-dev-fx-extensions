import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'TfLStatusApplicationCustomizerStrings';
import { ITfLStatusChatWindowProps } from './components/ITfLStatusChatWindowProps';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import TfLStatusChatWindow from './components/TfLStatusChatWindow';

const LOG_SOURCE: string = 'TfLStatusApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ITfLStatusApplicationCustomizerProperties {
  show: boolean;
  stream: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class TfLStatusApplicationCustomizer
  extends BaseApplicationCustomizer<ITfLStatusApplicationCustomizerProperties> {

  private _bottomPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    let show = this.properties.show;

    if (show) {
      this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
    }

    return Promise.resolve();
  }

  private _renderPlaceHolders(): void {
    console.log('Available placeholders: ', this.context.placeholderProvider.placeholderNames.map(name => PlaceholderName[name]).join(', '));

    if (!this._bottomPlaceholder) {
      this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Bottom);
    }

    const element: React.ReactElement<ITfLStatusChatWindowProps> = React.createElement(
      TfLStatusChatWindow,
      {
        httpClient: this.context.httpClient,
        stream: this.properties.stream
      }
    );

    ReactDom.render(element, this._bottomPlaceholder.domElement);
  }
}
