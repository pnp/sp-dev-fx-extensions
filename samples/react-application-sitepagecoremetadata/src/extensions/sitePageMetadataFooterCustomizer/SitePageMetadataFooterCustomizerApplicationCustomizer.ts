import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'SitePageMetadataFooterCustomizerApplicationCustomizerStrings';

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import SitePageMetadataFooter from './components/SitePageMetadataComponent';
import ISitePageMetadataFooterProps from './components/ISitePageMetadataFooterProps';
import { SPHttpClient } from '@microsoft/sp-http';


const LOG_SOURCE: string = 'SitePageMetadataFooterCustomizerApplicationCustomizer';



export interface ISitePageMetadataFooterCustomizerApplicationCustomizerProperties {
  
  
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SitePageMetadataFooterCustomizerApplicationCustomizer extends BaseApplicationCustomizer<ISitePageMetadataFooterCustomizerApplicationCustomizerProperties> {

  private _footerPlaceHolder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {

    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    let currentPageUrl:string = document.URL;
    let sitePagesLibraryPath = this.context.pageContext.web.serverRelativeUrl + "/SitePages";

    // Display the application customizer only if the current page is site page.
    if(sitePagesLibraryPath.toLowerCase() === this.context.pageContext.list.serverRelativeUrl.toLowerCase())
    {
      this.context.placeholderProvider.changedEvent.add(this, this.RenderPlaceHolders);
    }
    
    return Promise.resolve();
  }

  private RenderPlaceHolders():void{

    if (!this._footerPlaceHolder) {
      this._footerPlaceHolder =
          this.context.placeholderProvider.tryCreateContent(
              PlaceholderName.Bottom,
              { onDispose: this._onDispose });

      if (!this._footerPlaceHolder) {
          console.error('The expected placeholder (Bottom) was not found.');
          return;
      }

      // Create and Render the react element that displays page metadata in the footer.
      const element: React.ReactElement<ISitePageMetadataFooterProps> = React.createElement(SitePageMetadataFooter, 
        { 
          SitePageItemId : this.context.pageContext.listItem.id,
          spHttpClient : this.context.spHttpClient,
          CurrentSiteUrl : this.context.pageContext.web.absoluteUrl,
          SitePagesListId : this.context.pageContext.list.id
        });
      ReactDOM.render(element, this._footerPlaceHolder.domElement);
    }
  }

  private _onDispose(): void {
    console.log('[SitePageMetadataFooterExtension._onDispose] Disposed custom footer placeholders.');
  }
}
