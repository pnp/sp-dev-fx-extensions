import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import PersonalAssistant from './components/PersonalAssistant';

import * as strings from 'PersonalAssistantApplicationCustomizerStrings';
import { IPersonalAssistantProps } from './components/IPersonalAssistantProps';

const LOG_SOURCE: string = 'PersonalAssistantApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IPersonalAssistantApplicationCustomizerProperties {
  // This is an example; replace with your own property
  show: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class PersonalAssistantApplicationCustomizer
  extends BaseApplicationCustomizer<IPersonalAssistantApplicationCustomizerProperties> {

  /* public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    let message: string = this.properties.testMessage;
    if (!message) {
      message = '(No properties were provided.)';
    }

    Dialog.alert(`Hello from ${strings.Title}:\n\n${message}`).catch(() => {
    });

    return Promise.resolve();
  } */

  private _bottomPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    const show: boolean = this.properties.show;
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

    const element: React.ReactElement<IPersonalAssistantProps> = React.createElement(
      PersonalAssistant,
      {
        httpClient: this.context.httpClient,
        msGraphClientFactory: this.context.msGraphClientFactory,
        currentUserEmail: this.context.pageContext.user.email
      }
    );

    // eslint-disable-next-line @microsoft/spfx/pair-react-dom-render-unmount
    ReactDom.render(element, this._bottomPlaceholder.domElement);
  }
}
