import * as React from "react";
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import * as strings from 'siteBreadcrumbStrings';
import SiteBreadcrumb from './components/SiteBreadcrumb';
import { ISiteBreadcrumbProps } from './components/ISiteBreadcrumb';

const LOG_SOURCE: string = 'SiteBreadcrumbApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISiteBreadcrumbApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SiteBreadcrumbApplicationCustomizer
  extends BaseApplicationCustomizer<ISiteBreadcrumbApplicationCustomizerProperties> {
  private _headerPlaceholder: PlaceholderContent;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Added to handle possible changes on the existence of placeholders
    this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);

    // Call render method for generating the needed html elements
    this._renderPlaceHolders();

    return Promise.resolve<void>();
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
        const element: React.ReactElement<ISiteBreadcrumbProps> = React.createElement(
          SiteBreadcrumb,
          {
            context: this.context
          }
        );
        ReactDom.render(element, this._headerPlaceholder.domElement);
      }
    }
  }

  private _onDispose(): void {
    console.log('[Breadcrumb._onDispose] Disposed breadcrumb.');
  }
}
