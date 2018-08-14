import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
   PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-webpart-base';

import * as strings from 'SearchWebPartWebPartStrings';
import SearchWebPart from './components/SearchWebPart';
import { ISearchWebPartProps } from './components/ISearchWebPartProps';
import { IQuery } from '../../data/IQuery';
import { IDynamicDataSource } from '@microsoft/sp-dynamic-data';

export interface ISearchWebPartWebPartProps {
  /**
   * The ID of the dynamic data to which the web part is subscribed
   */
  propertyId: string;
  /**
   * The dynamic data source ID to which the web part is subscribed
   */
  sourceId: string;
  description: string;
}



export default class SearchWebPartWebPart extends BaseClientSideWebPart<ISearchWebPartWebPartProps> {

  private _lastSourceId: string = undefined;
  private _lastPropertyId: string = undefined;
  private query: IQuery = undefined;
  private _onConfigure = (): void => {
    this.context.propertyPane.open();
  }
  protected onInit(): Promise<void> {
    // bind render method to the current instance so that it can be correctly
    // invoked when dynamic data change notification is triggered
    this.render = this.render.bind(this);

    return Promise.resolve();
  }

  public render(): void {
    const needsConfiguration: boolean = !this.properties.sourceId || !this.properties.propertyId;

    // subscribe to dynamic data changes notifications
    // do this only once the first time the web part is rendered and only,
    // if the dynamic data source ID and property ID are provided
    if (this.renderedOnce === false && !needsConfiguration) {
      try {
        this.context.dynamicDataProvider.registerPropertyChanged(this.properties.sourceId, this.properties.propertyId, this.render);
        // store current values for the dynamic data source ID and property ID
        // so that the web part can unsubscribe from notifications when the
        // web part configuration changes
        this._lastSourceId = this.properties.sourceId;
        this._lastPropertyId = this.properties.propertyId;
      }
      catch (e) {
        this.context.statusRenderer.renderError(this.domElement, `An error has occurred while connecting to the data source. Details: ${e}`);
        return;
      }
    }
    // retrieve the current value of dynamic data only if the dynamic data
    // source ID and property ID have been provided
    if (!needsConfiguration) {
      const source: IDynamicDataSource = this.context.dynamicDataProvider.tryGetSource(this.properties.sourceId);
     this.query = source ? source.getPropertyValue(this.properties.propertyId) : undefined;
    }

    const element: React.ReactElement<ISearchWebPartProps > = React.createElement(
      SearchWebPart,
      {
         context: this.context,
        query: this.query,
        description:""
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    // get all available dynamic data sources on the page
    const sourceOptions: IPropertyPaneDropdownOption[] =
      this.context.dynamicDataProvider.getAvailableSources().map(source => {
        return {
          key: source.id,
          text: source.metadata.title
        };
      });
    const selectedSource: string = this.properties.sourceId;

    let propertyOptions: IPropertyPaneDropdownOption[] = [];
    if (selectedSource) {
      const source: IDynamicDataSource = this.context.dynamicDataProvider.tryGetSource(selectedSource);
      if (source) {
        // get the list of all properties exposed by the currently selected
        // data source
        propertyOptions = source.getPropertyDefinitions().map(prop => {
          return {
            key: prop.id,
            text: prop.title
          };
        });
      }
    }

    return {
      pages: [
        {
          groups: [
            {
              groupFields: [
                PropertyPaneDropdown("sourceId", {
                  label: strings.SourceIdFieldLabel,
                  options: sourceOptions,
                  selectedKey: this.properties.sourceId
                }),
                PropertyPaneDropdown("propertyId", {
                  label: strings.PropertyIdFieldLabel,
                  options: propertyOptions,
                  selectedKey: this.properties.propertyId
                })
              ]
            }
          ]
        }
      ]
    };
  }

  protected onPropertyPaneFieldChanged(propertyPath: string): void {
    if (propertyPath === "sourceId") {
      // reset the selected property ID after selecting a different dynamic
      // data source
      this.properties.propertyId =
        this.context.dynamicDataProvider.tryGetSource(this.properties.sourceId).getPropertyDefinitions()[0].id;
    }

    if (this._lastSourceId && this._lastPropertyId) {
      // unsubscribe from the previously registered dynamic data changes
      // notifications
      this.context.dynamicDataProvider.unregisterPropertyChanged(this._lastSourceId, this._lastPropertyId, this.render);
    }

    // subscribe to the newly configured dynamic data changes notifications
    this.context.dynamicDataProvider.registerPropertyChanged(this.properties.sourceId, this.properties.propertyId, this.render);
    // store current values for the dynamic data source ID and property ID
    // so that the web part can unsubscribe from notifications when the
    // web part configuration changes
    this._lastSourceId = this.properties.sourceId;
    this._lastPropertyId = this.properties.propertyId;
  }
}
