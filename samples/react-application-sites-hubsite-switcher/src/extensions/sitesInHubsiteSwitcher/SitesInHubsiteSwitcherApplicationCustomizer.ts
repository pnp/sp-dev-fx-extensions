import * as React from "react";
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'SitesInHubsiteSwitcherApplicationCustomizerStrings';
import { IHubsiteSiteSwitcherProps } from "./components/IHubsiteSiteSwitcher";
import HubsiteSiteSwitcher from "./components/HubsiteSiteSwitcher";

const LOG_SOURCE: string = 'SitesInHubsiteSwitcherApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISitesInHubsiteSwitcherApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SitesInHubsiteSwitcherApplicationCustomizer
  extends BaseApplicationCustomizer<ISitesInHubsiteSwitcherApplicationCustomizerProperties> {

    private _headerPlaceholder: PlaceholderContent;
    
  @override
  public onInit(): Promise<void> {
    console.log(`${LOG_SOURCE} Initialized ${strings.Title}. Property value: ${this.properties.testMessage}`);

    // Added to handle possible changes on the existence of placeholders
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);

    // Call render method for generating the needed html elements
    this._renderPlaceHolders();

    return Promise.resolve();
  }

  private _renderPlaceHolders(): void {    
    if (this._headerPlaceholderAvailableAndNotCreatedYet()) {

      this._headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
        onDispose: this._onDispose
      });

      // The extension should not assume that the expected placeholder is available.
      if (!this._headerPlaceholder) {
        console.error(`${LOG_SOURCE} The expected placeholder (PageHeader) was not found.`);
        return;
      }

      if (this._headerPlaceholder.domElement) {
        const element: React.ReactElement<IHubsiteSiteSwitcherProps> = React.createElement(
          HubsiteSiteSwitcher,
          {
            context: this.context
          }
        );
        ReactDom.render(element, this._headerPlaceholder.domElement);
      }

    }
  }

  private _headerPlaceholderAvailableAndNotCreatedYet(): boolean
  {
    // Check if the header placeholder is already set and if the header placeholder is available
    return !this._headerPlaceholder 
      && this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1;
  }

  private _onDispose(): void {
    console.log(`${LOG_SOURCE} Dispossed`);
  }
}
