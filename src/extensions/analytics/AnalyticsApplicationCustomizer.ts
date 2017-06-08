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
    
    // document.getElementsByTagName("head")[0].innerHTML=`
    //   <script async src='https://www.google-analytics.com/analytics.js'></script>` + document.getElementsByTagName("head")[0].innerHTML;
    let head = document.getElementsByTagName("head")[0];
    let gaClassic = document.createElement("script");
    gaClassic.async = true;
    gaClassic.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    gaClassic.type = 'text/javascript';

    // let done = false;
    // gaClassic.onload = gaClassic.onreadystatechange = function () {
    //     if (!done && (!this.readyState
		// 			|| this.readyState == "loaded"
		// 			|| this.readyState == "complete")) {
    //         done = true;

    //         // Continue your code
    //         callback();

    //         // Handle memory leak in IE
    //         gaClassic.onload = gaClassic.onreadystatechange = null;
    //         head.removeChild(gaClassic);
    //     }
    // };

    head.appendChild(gaClassic);

    // let ga = document.createElement("script");
    // ga.innerHTML=
    //   `window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    //    ga('create', 'UA-55651096-1', 'auto');
    //    ga('send', 'pageview');`;
    // head.appendChild(ga);

    return Promise.resolve<void>();
  }

  @override
  public onRender(): void {
    let message: string = this.properties.testMessage;
    if (!message) {
      message = '(No properties were provided.)';
    }
    let head = document.getElementsByTagName("head")[0];
    let ga = document.createElement("script");
    ga.innerHTML=
      `var _gaq = _gaq || [];
       _gaq.push(['_setAccount', 'UA-100712891-1']);
       _gaq.push(['_trackPageview']);`;
    head.appendChild(ga);

    // var _gaq = _gaq || [];
    // _gaq.push(['_setAccount', 'UA-100712891-1']);
    // _gaq.push(['_trackPageview']);

    Log.info(LOG_SOURCE,`Hello from ${strings.Title}:\n\n${message}`);
  }
}
