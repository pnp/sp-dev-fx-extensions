import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {  
  BaseApplicationCustomizer,  
  PlaceholderContent,  
  PlaceholderName
} from '@microsoft/sp-application-base';
import * as strings from 'BotFrameworkChatPopupApplicationCustomizerStrings';
import * as React from "react";  
import * as ReactDOM from "react-dom";  
import BotFrameworkChatPopupApplicationChat from "./components/BotFrameworkChatPopupApplicationChat";
import { IBotFrameworkChatPopupApplicationChatProps } from "./components/IBotFrameworkChatPopupApplicationChatProps";

const LOG_SOURCE: string = 'BotFrameworkChatPopupApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IBotFrameworkChatPopupApplicationCustomizerProperties {
  // This is an example; replace with your own property
  directLineSecret: string;
  allowedSites: string[];
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class BotFrameworkChatPopupApplicationCustomizer
  extends BaseApplicationCustomizer<IBotFrameworkChatPopupApplicationCustomizerProperties> {
    private _bottomPlaceholder: PlaceholderContent | undefined;  

    @override
    public onInit(): Promise<void> {
      const absoluteUri = this.context.pageContext.web.absoluteUrl;
      console.log(LOG_SOURCE, `Configured sites: ${this.properties.directLineSecret}`);
      // clean up allowed sites
      const allowedSites = this.properties.allowedSites && this.properties.allowedSites.length
          ? this.properties.allowedSites.filter(item => !!item)
          : [];
      //Log.info(LOG_SOURCE, allowedSites.toString());
      console.log(LOG_SOURCE, `Allowed sites: ${allowedSites}`);
      console.log(LOG_SOURCE, `URL: ${absoluteUri}`);
      // return early if there are allowed sites specified and the current site is not allowed
      if (allowedSites.length && allowedSites.indexOf(absoluteUri) == -1) {
        console.log(LOG_SOURCE, "Not allowed!");
        return;
      }
      Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
      // Call render method for generating the HTML elements.  
      this._renderPlaceHolders();  
      return Promise.resolve();
    }

    private _renderPlaceHolders(): void {  
      console.log('Available placeholders: ',  
      this.context.placeholderProvider.placeholderNames.map(name => PlaceholderName[name]).join(', '));  
      // Handling the bottom placeholder  
      if (!this._bottomPlaceholder) {  
        this._bottomPlaceholder =  
          this.context.placeholderProvider.tryCreateContent(  
            PlaceholderName.Bottom,  
            { onDispose: this._onDispose });  
        // The extension should not assume that the expected placeholder is available.  
        if (!this._bottomPlaceholder) {  
          console.error('The expected placeholder (Bottom) was not found.');  
          return;  
        }  
        this._bottomPlaceholder.domElement.innerHTML = `<div id="customShareTeamsBTN" class="teams-share-button" data-href="${document.location.href}"></div>`;
        const elem: React.ReactElement<IBotFrameworkChatPopupApplicationChatProps> = React.createElement(BotFrameworkChatPopupApplicationChat, {
          directLineSecret: this.properties.directLineSecret});  
        ReactDOM.render(elem, this._bottomPlaceholder.domElement);      
      }  
    }  

    private _onDispose(): void {  
      console.log('[ReactHeaderFooterApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');  
    }  
}