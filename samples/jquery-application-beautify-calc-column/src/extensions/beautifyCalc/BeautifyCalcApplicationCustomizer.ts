import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Promise } from 'es6-promise';
import * as strings from 'beautifyCalcStrings';

export default class BeautifyCalcApplicationCustomizer
  extends BaseApplicationCustomizer<any> {

  @override
  public onRender(): void {
    this._loadJQuery();
  }

  private _loadJQuery(): Promise<string> {
    // Load Jquery 
    return new Promise<any>((resolve) => {
      this.loadScript('https://code.jquery.com/jquery-3.2.1.min.js', 'jquery').then(() => {
        // On success call _formatCalcMarkup function
        resolve(this._formatCalcMarkup());
      });
    });
  }

  private _formatCalcMarkup(): void {
    // The custom class name configured in the calculated column formula
		let customClassName = "beautifyCalcMarkup";
    // Tag to target in list view
    let tagToTarget = "div";
    // Class to target in list view
    let msClassToTarget = "ms-DetailsRow-cell";

    (window as any).$(tagToTarget+"."+msClassToTarget+":contains('"+customClassName+"')").each(function () {
      // Get the combined text contents of the matched element
      var textholder = (window as any).$(this).text();

      if(textholder)
      {
        // Set the HTML contents of the matched element
        (window as any).$(this).html(textholder);
      }
    });
  }

  private loadScript(url: string, globalObjectName: string): Promise<void> {

    return new Promise<void>((resolve) => {
      let isLoaded = true;
      if (globalObjectName.indexOf('.') !== -1) {
        const props = globalObjectName.split('.');
        let currObj: any = window;

        for (let i = 0, len = props.length; i < len; i++) {
          if (!currObj[props[i]]) {
            isLoaded = false;
            break;
          }

          currObj = currObj[props[i]];
        }
      }
      else {
        isLoaded = !!window[globalObjectName];
      }
      // checking if the script was previously added to the page
      if (isLoaded || document.head.querySelector('script[src="' + url + '"]')) {
        resolve();
        return;
      }

      // loading the script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = () => {
        resolve();
      };
      document.head.appendChild(script);
    });

  }

}
