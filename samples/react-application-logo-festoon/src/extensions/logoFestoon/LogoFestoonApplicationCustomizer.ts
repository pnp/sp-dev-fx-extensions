import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer, PlaceholderContent, PlaceholderName } from '@microsoft/sp-application-base';
import { ILogoFestoonProps } from './components/ILogoFestoonProps';
import { LogoFestoon } from './components/LogoFestoon';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Log } from '@microsoft/sp-core-library';
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */

const LOG_SOURCE: string = 'LogoFestoonApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ILogoFestoonApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class LogoFestoonApplicationCustomizer
  extends BaseApplicationCustomizer<ILogoFestoonApplicationCustomizerProperties> {

    private _topPlaceholder: PlaceholderContent | undefined;
    constructor() {
      super();
      this._addFestoonContents = this._addFestoonContents.bind(this);
    }
    @override
    public onInit(): Promise<void> {
      
      this.context.placeholderProvider.changedEvent.add(this, this._addFestoonContents);
      this.context.application.navigatedEvent.add(this, this._addFestoonContents);
      this._addFestoonContents();
      return Promise.resolve();
    }
    private _onDispose(): void {
      if (this._topPlaceholder && this._topPlaceholder.domElement){
        ReactDom.unmountComponentAtNode(this._topPlaceholder.domElement);
      }
    }
    private _addFestoonContents = () => {
  
      if (!this._topPlaceholder) {
        this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this._onDispose });
      }
      if (this._topPlaceholder.domElement) {
          /* get active festival list item from list Festoon
          */
          const headers: Headers = new Headers();
          headers.append('accept', 'application/json;odata.metadata=none');
          this.context.spHttpClient
            .get(`${this.context.pageContext.web.absoluteUrl}/_api/lists/getByTitle('Festoon')/items?$filter=Active eq 1&select=Title,Image,Direction,Active`, SPHttpClient.configurations.v1, {
              headers: headers
            })
            .then((res: SPHttpClientResponse): Promise<{ value: any[] }> => {
              return res.json();
            },rejected=>{
              Log.info(LOG_SOURCE,`Error at retrieving the list item for Festoon:404`);
            })
            .then((res: { value: any[] }): void => {
              if (res.value) {
                const festiveItem: any = res.value.map(fest => {
                  return {
                    direction:fest.Direction,
                    imgUrl:fest.Image.Url?fest.Image.Url:"",
                    active:fest.Active
                  };
                });
                const logoElement: any = $("div[class^='logoCell']");
                /*wait until logo wrapper is rendered
                */
               if (this._topPlaceholder && this._topPlaceholder.domElement && logoElement.width()){
                var logoCellWidth = (logoElement.width()) ? parseFloat(logoElement.width()) : 0;
                const element: React.ReactElement<ILogoFestoonProps> = React.createElement(
                  LogoFestoon,
                  {
                    imageUrl: festiveItem[0]["imgUrl"],
                    widthval: logoCellWidth,
                    direction: festiveItem[0]["direction"],
                    alt:festiveItem[0]["Title"]
                  }
                );
                // render the Festoon logo decoration using a React component
                ReactDom.render(element, this._topPlaceholder.domElement);
                }else {
                  Log.info(LOG_SOURCE,`DOM element of the header is undefined. Start to re-render.`);
                  this._addFestoonContents();
                }
            }
        },rejected=>{
          Log.info(LOG_SOURCE,`Error at retrieving the value from Festoon response`);
        });
      }
    }
  }
  