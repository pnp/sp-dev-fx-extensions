import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';

import * as React from 'react';
import * as ReactDom from "react-dom";

import * as strings from 'PageRelatedBingNewsApplicationCustomizerStrings';

import RelatedBingNews, { IRelatedBingNewsProps } from './components/RelatedBingNews';

const LOG_SOURCE: string = 'PageRelatedBingNewsApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IPageRelatedBingNewsApplicationCustomizerProperties {
  // This is an example; replace with your own property
  bingSearchApiKey: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class PageRelatedBingNewsApplicationCustomizer
  extends BaseApplicationCustomizer<IPageRelatedBingNewsApplicationCustomizerProperties> {

  private _headerPlaceholder: PlaceholderContent;

  private _headerPlaceholderAvailableAndNotCreatedYet(): boolean {
    // check if the header placeholder is already set and if the header placeholder is available
    return !this._headerPlaceholder
      && this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1;
  }

  private _onDispose(): void {
    console.log(`${LOG_SOURCE} Dispossed`);
  }

  private _renderPlaceHolders(): void {
    if (this._headerPlaceholderAvailableAndNotCreatedYet()) {

      this._headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
        onDispose: this._onDispose
      });

      // the extension should not assume that the expected placeholder is available.
      if (!this._headerPlaceholder) {
        console.error(`${LOG_SOURCE} The expected placeholder (PageHeader) was not found.`);
        return;
      }

      if (this._headerPlaceholder.domElement) {
        const element: React.ReactElement<IRelatedBingNewsProps> = React.createElement(
          RelatedBingNews,
          {
            context: this.context,
            bingSearchApiKey: this.properties.bingSearchApiKey
          }
        );
        ReactDom.render(element, this._headerPlaceholder.domElement);
      }
    }
  }

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // added to handle possible changes on the existence of placeholders
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);

    // call render method for generating the needed html elements
    this._renderPlaceHolders();

    return Promise.resolve();
  }
}
