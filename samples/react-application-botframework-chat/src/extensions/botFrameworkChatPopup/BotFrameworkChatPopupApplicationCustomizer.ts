import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {  
  BaseApplicationCustomizer,  
  PlaceholderContent,  
  PlaceholderName,
  PlaceholderProvider
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

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
  testMessage: string;
  Bottom: string;  
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class BotFrameworkChatPopupApplicationCustomizer
  extends BaseApplicationCustomizer<IBotFrameworkChatPopupApplicationCustomizerProperties> {

    private _bottomPlaceholder: PlaceholderContent | undefined;  

    @override
    public onInit(): Promise<void> {
      Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

      //this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);  
        
      // Call render method for generating the HTML elements.  
      this._renderPlaceHolders();  
/*
      let topPlaceholder: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
      let bottomPlaceholder: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Bottom); 
      if (bottomPlaceholder) { 
        bottomPlaceholder.domElement.innerHTML = '<div style="background-color: red;"><div style="text-align:center;" > This is to demo SPFx extension to customize app footer. </div> </div>';
        return Promise.resolve();
      }
       if (topPlaceholder) { 
           topPlaceholder.domElement.innerHTML = '<div><div style="text-align:center" > This is to demo SPFx extension to customize app header. </div> </div>';
      

        return Promise.resolve();
       }
       */
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
        const elem: React.ReactElement<IBotFrameworkChatPopupApplicationChatProps> = React.createElement(BotFrameworkChatPopupApplicationChat);  
        ReactDOM.render(elem, this._bottomPlaceholder.domElement);      
      }  
    }  

    private _onDispose(): void {  
      console.log('[ReactHeaderFooterApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');  
    }  

}
