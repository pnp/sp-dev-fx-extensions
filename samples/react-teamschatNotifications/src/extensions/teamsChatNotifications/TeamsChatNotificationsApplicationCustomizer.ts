import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as strings from 'TeamsChatNotificationsApplicationCustomizerStrings';
import  TeamsBadge  from '../../components/TeamsBadge/TeamsBadge';
const LOG_SOURCE: string = 'TeamsChatNotificationsApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ITeamsChatNotificationsApplicationCustomizerProperties {
  // Function App URL
  functionAppUrl: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class TeamsChatNotificationsApplicationCustomizer
  extends BaseApplicationCustomizer<ITeamsChatNotificationsApplicationCustomizerProperties> {
  private _headerPlaceholder: PlaceholderContent;
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    //Dialog.alert(`Hello from ${strings.Title}:\n\n${message}`);
    this._renderPlaceHolders();
    return Promise.resolve();
  }

  private _renderPlaceHolders(): void {

    // Check if the header placeholder is already set and if the header placeholder is available
    if (!this._headerPlaceholder && this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1) {
      this._headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
        onDispose: this._onDispose
      });
      // The extension should not assume that the expected placeholder is available.
      if (!this._headerPlaceholder) {
        console.error('The expected placeholder (PageHeader) was not found.');
        return;
      }

      if (this._headerPlaceholder.domElement) {
        const element: JSX.Element = React.createElement(
          TeamsBadge,
          {
            context: this.context,
            functionAppUrl: this.properties.functionAppUrl
          },
        );
        ReactDom.render(element, this._headerPlaceholder.domElement);
      }
    }
  }

  private _onDispose(): void {
    console.log('dispose TeamsChatNotifications');
  }

}
