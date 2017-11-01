import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { Web } from "sp-pnp-js";
import styles from './AppCustomizer.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';

import * as strings from 'WebhooksToastNotificationsApplicationCustomizerStrings';
import * as io from 'socket.io-client';
import * as moment from 'moment';

const LOG_SOURCE: string = 'WebhooksToastNotificationsApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IWebhooksToastNotificationsApplicationCustomizerProperties {
  Top: string;
  Url: string;
}

/*
  https://giuleon.sharepoint.com/sites/demo/Lists/FieldCustomizer/AllItems.aspx?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"c0c009bd-5299-4c13-9826-9068022ce804":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"Top":"Top area of the page"}}}
*/

/** A Custom Action which can be run during execution of a Client Side Application */
export default class WebhooksToastNotificationsApplicationCustomizer
  extends BaseApplicationCustomizer<IWebhooksToastNotificationsApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;
  private _lastQueryDate: moment.Moment;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // let message: string = this.properties.testMessage;
    // if (!message) {
    //   message = '(No properties were provided.)';
    // }

    // Dialog.alert(`Hello from ${strings.Title}:\n\n${message}`);
    this._lastQueryDate = moment();
    this._connectSocket("https://webhooksbroadcaster.azurewebsites.net");
    return Promise.resolve();
  }

  private _renderPlaceHolders(): void {

    console.log('WebhooksToastNotificationsApplicationCustomizer._renderPlaceHolders()');
    console.log('Available placeholders: ',
      this.context.placeholderProvider.placeholderNames.map(name => PlaceholderName[name]).join(', '));

    // Handling the top placeholder
    if (!this._topPlaceholder) {
      this._topPlaceholder =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Top,
          { onDispose: this._onDispose });

      // The extension should not assume that the expected placeholder is available.
      if (!this._topPlaceholder) {
        console.error('The expected placeholder (Top) was not found.');
        return;
      }

      if (this.properties) {
        let topString: string = this.properties.Top;
        let topUrl: string = this.properties.Url;
        if (!topString) {
          topString = '(Top property was not defined.)';
        }

        if (this._topPlaceholder.domElement) {
          this._topPlaceholder.domElement.innerHTML = `
                        <div class="${styles.app}">
                          <div class="ms-bgColor-themeDark ms-fontColor-white ${styles.top}">
                            <i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i>
                            ${escape(topString)}
                            </br>
                            <a href="${topUrl}">Click here for more detail</a>
                          </div>
                        </div>`;
        }
      }
    }
  }

  private _onDispose(): void {
    console.log('[HelloWorldApplicationCustomizer._onDispose] Disposed custom top and bottom placeholders.');
  }

  private _removePlaceHolders(): void {
    this._topPlaceholder.dispose();
  }

  private async _connectSocket(socketServerUrl: string) {
    // Connect to the server
    const socket = io(socketServerUrl);
    // Add the socket io listeners
    socket.on('list:changes', (data) => {
      console.log(JSON.stringify(data));
      this._getListChanges(data).then((changes: any) => {
        console.log(JSON.stringify(changes));
        if (changes != "") {
          let web = new Web(this.context.pageContext.web.absoluteUrl);
          // get a specific item by id
          web.lists.getById(changes[0].ListId).items.getById(changes[0].ItemId).get().then((item: any) => {
            console.log(item);
            this._lastQueryDate = moment();
            this.properties.Top = item.Title;
            this.properties.Url = item.SPFxThumbnail.Url;
            // Added to handle possible changes on the existence of placeholders
            this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
            // Call render method for generating the needed html elements
            this._renderPlaceHolders();
            
            // After x seconds the place holder is removed from the DOM
            let that = this;
            setTimeout(
              function(){ 
                that._removePlaceHolders(); 
              }, 10000);
          });

        }
      });
    });
  }

  private async _getListChanges(dataWebhooks: any): Promise<any> {
    let dataParsed = JSON.parse(dataWebhooks);
    let resource = dataParsed[0].resource;
    let changeToken = `1;3;${resource};${this.toTicks(this._lastQueryDate)};-1`;
    let web = new Web(this.context.pageContext.web.absoluteUrl);
    let changes = await web.lists.getByTitle("Events").getChanges(
      {
        Add: true,
        Item: true,
        ChangeTokenStart: { StringValue: changeToken }
      });
    console.log(changes);
    console.log(this._lastQueryDate);
    if (changes.length > 0) {
      // let newsFeedText = (changes.length == 1) ? changes.length + " new item" : changes.length + " new items";
      return Promise.resolve(changes);
    }
    else {
      return Promise.resolve("");
    }
  }
  private toTicks(date: moment.Moment): number {
    return (date.valueOf() * 10000) + 621355968000000000;
  }
}
