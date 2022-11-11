import * as React from 'react';
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'MessageBannerApplicationCustomizerStrings';
import Banner from './components/Banner/Banner';
import { IBannerProps } from './components/Banner/IBannerProps';
import ClientSideComponentService from '../../services/ClientSideComponentService';
import { IMessageBannerProperties, DEFAULT_PROPERTIES } from '../../models/IMessageBannerProperties';

const LOG_SOURCE = 'MessageBannerApplicationCustomizer';

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MessageBannerApplicationCustomizer
  extends BaseApplicationCustomizer<IMessageBannerProperties> {

  private _topPlaceholder: PlaceholderContent;
  private _extensionProperties: IMessageBannerProperties;
  private _clientSideComponentService: ClientSideComponentService;

  @override
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Init services
    this._clientSideComponentService = new ClientSideComponentService(this.context);

    // Merge passed properties with default properties, overriding any defaults
    this._extensionProperties = { ...DEFAULT_PROPERTIES, ...this.properties };

    // Don't show banner if message is empty
    if (!this._extensionProperties.message) {
      Log.info(LOG_SOURCE, `Skip rendering. No banner message configured.`);
      return;
    }

    //Event handler to re-render banner on each page navigation
    this.context.application.navigatedEvent.add(this, this.onNavigated);
  }

  /**
   * Event handler that fires on every page load
   */
  private async onNavigated(): Promise<void> {
    this.renderBanner();
  }

  /**
   * Render the 'content viewable by external users' banner on the current page
   */
  private renderBanner(): void {
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);

      if (!this._topPlaceholder) {
        Log.error(LOG_SOURCE, new Error(`Unable to render Top placeholder`));
        return;
      }
    }

    //Render Banner React component
    const bannerProps: IBannerProps = {
      context: this.context,
      settings: this._extensionProperties,
      clientSideComponentService: this._clientSideComponentService
    };
    const bannerComponent = React.createElement(Banner, bannerProps);
    ReactDom.render(bannerComponent, this._topPlaceholder.domElement);
  }

  @override
  public onDispose(): void {
    if (this._topPlaceholder) {
      this._topPlaceholder.dispose();
    }
  }
}
