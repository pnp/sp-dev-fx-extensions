import * as React from 'react';
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';


import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { SPService } from '../Common/Services/SPService';
import { IFollowedSitesProps } from './components/followedSites/IFollowedSitesProps';
import  FollowedSites   from './components/followedSites/FollowedSites';


import * as strings from 'MyFollowedSitesApplicationCustomizerStrings';

const LOG_SOURCE: string = 'MyFollowedSitesApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMyFollowedSitesApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MyFollowedSitesApplicationCustomizer
  extends BaseApplicationCustomizer<IMyFollowedSitesApplicationCustomizerProperties> {

    //Placeholder to hold react component 
    private _bottomPlaceholder: PlaceholderContent | undefined;
    //Common service which will interact with SharePoint
    private _spService: SPService | undefined;

    /**
     * @description - SharePoint Framework component init method
     */
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    this.context.placeholderProvider.changedEvent.add(this, this.renderPlaceholders);
    //Call render to generate HTML
    
    this.renderPlaceholders();

    return Promise.resolve();
  }

  /**
   * @description - Renders the target React component to Bottom placeholder.
   */
  private renderPlaceholders(): void {
    try {
      // console.log('Available placeholders: ',
      //   this.context.placeholderProvider.placeholderNames.map(name => PlaceholderName[name]).join(', '));
      this._spService = new SPService(this.context);

      //Handling the bottom placeholder
      if (!this._bottomPlaceholder) {
        this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Bottom, { onDispose: this._onDispose });
      }

      //the extension should not assume that the expected placeholder is availabe
      if (!this._bottomPlaceholder) {
        console.error('The expected placeholder {bottom} is not available.');
        return;
      }
      //Creating component
      if (this._bottomPlaceholder) {
       const myFollowedSiteControl:React.ReactElement<IFollowedSitesProps> = React.createElement(FollowedSites,
        {
          spService: this._spService,
          currentContext: this.context
          
       });
       ReactDom.render(myFollowedSiteControl, this._bottomPlaceholder.domElement);
      }


    } catch (error) {
      console.log("Exception in renderPlaceholders:" + JSON.stringify(error));
    }
  }

  /*
  *@description - Dispose method of Footer bottom placeholder
  */
 private _onDispose(): void {
  console.log('[MyFollowedSitesApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
}
}
