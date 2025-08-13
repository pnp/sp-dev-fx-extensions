import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer, PlaceholderName } from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CopyPageComponent, { ICopyPageComponentProps } from './components/CopyPageComponent';

const LOG_SOURCE: string = 'CopyPageApplicationCustomizer';

export interface ICopyPageApplicationCustomizerProperties {
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class CopyPageApplicationCustomizer
  extends BaseApplicationCustomizer<ICopyPageApplicationCustomizerProperties> {
  private _footerPlaceholder?: HTMLElement; // Reference to the placeholder DOM element

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${LOG_SOURCE}`);

    // Create the Bottom placeholder
    const footer = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Bottom);



    if (!footer) {
      const error = new Error('Could not find placeholder Bottom');
      Log.error(LOG_SOURCE, error);
      return Promise.reject(error);
    }
    this._footerPlaceholder = footer.domElement; // Store reference to the placeholder DOM element

    // Retrieve site URL and page details
    const siteUrl = this.context.pageContext.web.absoluteUrl;
    const serverRequestPath = this.context.pageContext.site.serverRequestPath;
    const pageName = serverRequestPath.substring(serverRequestPath.lastIndexOf('/') + 1);

    // Create the React element for the CopyPageComponent
    const elem: React.ReactElement<ICopyPageComponentProps> = React.createElement(CopyPageComponent, {
      context: this.context,
      siteUrl: siteUrl,
      pageName: pageName,
      pageUrl: serverRequestPath,
    });

    // Render the React element into the Bottom placeholder
    ReactDOM.render(elem, footer.domElement);

    return Promise.resolve();
  }
  public onDispose(): void {
    Log.info(LOG_SOURCE, `Disposed ${LOG_SOURCE}`);

    // Unmount the React component from the placeholder DOM element
    if (this._footerPlaceholder) {
      ReactDOM.unmountComponentAtNode(this._footerPlaceholder);
    }
  }
}