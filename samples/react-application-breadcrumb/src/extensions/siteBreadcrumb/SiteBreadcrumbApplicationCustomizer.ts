import * as React from "react";
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

import * as strings from 'siteBreadcrumbStrings';
import Placeholder from "@microsoft/sp-application-base/lib/extensibility/Placeholder";
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

const HeaderPlaceholderName = "PageHeader";

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SiteBreadcrumbApplicationCustomizer
  extends BaseApplicationCustomizer<ISiteBreadcrumbApplicationCustomizerProperties> {
  private _headerPlaceholder: Placeholder;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    return Promise.resolve<void>();
  }

  @override
  public onRender(): void {
    // Check if the header placeholder is already set and if the header placeholder is available
    if (!this._headerPlaceholder && this.context.placeholders.placeholderNames.indexOf(HeaderPlaceholderName) !== -1) {
      this._headerPlaceholder = this.context.placeholders.tryAttach(HeaderPlaceholderName, {
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
