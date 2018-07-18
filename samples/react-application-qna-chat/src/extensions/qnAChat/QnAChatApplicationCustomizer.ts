import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as strings from 'QnAChatApplicationCustomizerStrings';
import { IFooterChatProps } from './components/IFooterChatProps';
import FooterChat from './components/FooterChat';
import { CognitiveService } from '../../services/cognitiveservices';

const LOG_SOURCE: string = 'QnAChatApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IQnAChatApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class QnAChatApplicationCustomizer
  extends BaseApplicationCustomizer<IQnAChatApplicationCustomizerProperties> {
  private _bottomPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {
    // Call render method for generating the needed html elements
    this._renderFooter();

    return Promise.resolve();
  }

  private _renderFooter(): void {
    // Instantiate cognitive service
    const cognitiveService = new CognitiveService({
      context: this.context,
    });

    // Handling the bottom placeholder
    if (!this._bottomPlaceholder) {
      this._bottomPlaceholder =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Bottom,
          { onDispose: this._onDispose });

      // The extension should not assume that the expected placeholder is available.
      if (!this._bottomPlaceholder) {
        console.error('The expected placeholder (Bottom) was not found.');
        return;
      }

      const element: React.ReactElement<IFooterChatProps> = React.createElement(
        FooterChat,
        {
          cognitiveService: cognitiveService
        });

      ReactDom.render(element, this._bottomPlaceholder.domElement);
    }
  }

  private _onDispose(): void {
    console.log('Disposed custom bottom placeholders.');
  }
}
