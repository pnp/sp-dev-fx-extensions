import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  Placeholder,
  PlaceholderCollection
} from '@microsoft/sp-application-base';

import * as strings from 'analyticsStrings';

const LOG_SOURCE: string = 'AnalyticsApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IAnalyticsApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class AnalyticsApplicationCustomizer
  extends BaseApplicationCustomizer<IAnalyticsApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    
    return Promise.resolve<void>();
  }

  @override
  public onRender(): void {
    let message: string = this.properties.testMessage;
    if (!message) {
      message = '(No properties were provided.)';
    }

    let html: string = '';
    html+= `
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-100712891-1', 'auto');
      ga('send', 'pageview');`;
    let head: any = document.getElementsByTagName("head")[0] || document.documentElement,
    script = document.createElement("script");
    script.type = "text/javascript";

    try {
        console.log('Append child');
        script.appendChild(document.createTextNode(html));
    } 
    catch (e) {
        console.log('Append child catch');
        script.text = html;
    }
    head.insertBefore(script, head.firstChild);
    head.removeChild(script);

    Log.info(LOG_SOURCE,`Hello from ${strings.Title}:\n\n${message}`);
  }
}
