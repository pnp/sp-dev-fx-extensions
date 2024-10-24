import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'MicrosoftClarityApplicationCustomizerStrings';

const LOG_SOURCE: string = 'MicrosoftClarityApplicationCustomizer';


export interface IMicrosoftClarityApplicationCustomizerProperties {
  clarityID: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MicrosoftClarityApplicationCustomizer
  extends BaseApplicationCustomizer<IMicrosoftClarityApplicationCustomizerProperties> {

 

  @override
  public onInit(): Promise<void> {

    var clarityID;
    clarityID = this.properties.clarityID;
    if (clarityID && clarityID != "") {debugger;
      (function(c:any,l:any,a:any,r:any,i:any,t:any,y:any){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", clarityID, { async: 1, src: "" }, { parentNode: { insertBefore: (arg0: any, arg1: any): void => {} } });
    }    
    return Promise.resolve();
  }
}
