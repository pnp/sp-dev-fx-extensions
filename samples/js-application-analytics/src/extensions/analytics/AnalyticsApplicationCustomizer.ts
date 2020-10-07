import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

import * as strings from 'AnalyticsApplicationCustomizerStrings';

const LOG_SOURCE: string = 'AnalyticsApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IAnalyticsApplicationCustomizerProperties {
  // This is an example; replace with your own property
  trackingId: string;
  disableAsync: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class AnalyticsApplicationCustomizer
  extends BaseApplicationCustomizer<IAnalyticsApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Retrieve properties to configure the extension
    const { trackingId, disableAsync } = this.properties;

    // Check that we have the mandatory tracking ID
    if (!trackingId) {
      // If there was no Google Tracking ID provided, we can stop here
      Log.info(LOG_SOURCE, `No tracking ID provided`);
      return Promise.resolve();
    }

    let html: string = '';

    // Google supports an async and sync approach to calling Google Analytics
    // Async is more efficient, but isn't supported on -- ahem -- legacy browsers.

    // If your organization still supports legacy browsers (and, most likely, faxes) you can disable
    // async support in the extension's configuration, by passing disableAsync: true
    if (disableAsync === true) {
      // Using legacy mode
      html += `
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', '${trackingId}', 'auto');
        ga('send', 'pageview');`;
    } else {
      // Using modern browser async approach
      html = `window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
        ga('create', '${trackingId}', 'auto');
        ga('send', 'pageview');`;
    }

    // Create an element at the end of the document
    const body: HTMLElement = document.documentElement;
    const script: HTMLScriptElement = document.createElement("script");
    script.type = "text/javascript";

    try {
      script.appendChild(document.createTextNode(html));
      body.insertAdjacentElement("beforeend", script);
    }
    catch (e) {
      console.log('Error adding Google Analytics', e);
    }

    // If we're using the async method, we also want to refer to the Google Analytics JavaScript file
    // asynchronously -- of course
    if (disableAsync !== true) {
      // Create an async script link
      let scriptLink = document.createElement("script");
      scriptLink.type = "text/javascript";
      scriptLink.async = true;
      scriptLink.src = "https://www.google-analytics.com/analytics.js";
      body.insertAdjacentElement("beforeend", scriptLink);
    }

    return Promise.resolve();
  }
}
