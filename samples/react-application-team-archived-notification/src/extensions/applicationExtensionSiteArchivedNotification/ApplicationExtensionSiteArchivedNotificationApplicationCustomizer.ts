import * as React from "react";
import * as ReactDOM from "react-dom";
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer, PlaceholderContent, PlaceholderName
} from '@microsoft/sp-application-base';
import * as strings from 'ApplicationExtensionSiteArchivedNotificationApplicationCustomizerStrings';
import { MSGraphClient } from "@microsoft/sp-http";
import { sp } from "@pnp/sp";
import SiteArchivedMessageBar from "./components/SiteArchivedMessageBar";
import { ISiteArchivedMessageBarProps } from './components/SiteArchivedMessageBar';

const LOG_SOURCE: string = 'ApplicationExtensionSiteArchivedNotificationApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IApplicationExtensionSiteArchivedNotificationApplicationCustomizerProperties {
  
  
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class ApplicationExtensionSiteArchivedNotificationApplicationCustomizer
  extends BaseApplicationCustomizer<IApplicationExtensionSiteArchivedNotificationApplicationCustomizerProperties> {

    private _headerPlaceholder: PlaceholderContent;
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    sp.setup({ spfxContext: this.context });

    var id: string = "";
    
    sp.web.select("AllProperties").expand("AllProperties").get().then(props => {
      
      if(props.AllProperties["GroupId"] != null)
      {
        id = props.AllProperties["GroupId"]; 
        this._renderPlaceHolders(id);
      }
    });
  

    
    return Promise.resolve();
  }

  private _renderPlaceHolders(id: string): void {

   
   
    if(!this._headerPlaceholder && this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1)
    {
      this._headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {onDispose: this._onDispose});
    }
    if(!this._headerPlaceholder.domElement)
    {
      console.error(PlaceholderName.Top+" was not found.");
    }
    if(this._headerPlaceholder.domElement)
    {
      this.context.msGraphClientFactory.getClient().then((graphClient: MSGraphClient): void => {  
        graphClient.api("teams/"+id).get((error, response: any, rawResponse?: any) => {
          console.log(response);
          if(response != null && response.isArchived != null)
          {
          if(response.isArchived == true)
          {
            const element: React.ReactElement<ISiteArchivedMessageBarProps> = React.createElement(SiteArchivedMessageBar, {context: this.context});
            ReactDOM.render(element, this._headerPlaceholder.domElement);
          }
        }
          
        });
      });

    }
  }


  private _onDispose(): void
  {

  }
}
