import * as React from "react";
import * as ReactDom from "react-dom";
import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from "@microsoft/sp-application-base";
import * as strings from "SearchExtensionApplicationCustomizerStrings";
import { IQuery } from "../../data/IQuery";

import SearchExtension from "./component/searchExtensionComponent";
import { IDynamicDataController, IDynamicDataPropertyDefinition } from "@microsoft/sp-dynamic-data";

const LOG_SOURCE: string = "SearchExtensionApplicationCustomizer";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISearchExtensionApplicationCustomizerProperties {
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SearchExtensionApplicationCustomizer
  extends BaseApplicationCustomizer<ISearchExtensionApplicationCustomizerProperties> {
    private _headerPlaceholder: PlaceholderContent;
  /**
   * Currently selected text
   */
  private _selectedText: IQuery;

  /**
   * Event handler for selecting an text in the list
   */
  private _textSelected = (text: IQuery): void => {
    console.log(text.text);
    // store the currently selected event in the class variable. Required
    // so that connected component will be able to retrieve its value
    this._selectedText = text;
    // notify subscribers that the selected text has changed
    this.context.dynamicDataSourceManager.notifyPropertyChanged("text");

  }


  public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition> {
    return [
      {
        id: "text",
        title: "Text"
      }
    ];
  }

  /**
   * Return the current value of the specified dynamic data set
   * @param propertyId ID of the dynamic data set to retrieve the value for
   */
  public getPropertyValue(propertyId: string): IQuery  {
    switch (propertyId) {
      case "text":
        return this._selectedText;
    }

    throw new Error("Bad property id");
  }

  @override
  public onInit(): Promise<void> {
    this.context.dynamicDataSourceManager.initializeSource(this);
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    if (!this._headerPlaceholder && this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1) {
      this._headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
        onDispose: this._onDispose
      });
    }
    if (this._headerPlaceholder.domElement) {
      const element: React.ReactElement<any> = React.createElement(
        SearchExtension,
        {
          context: this.context,
          onchange : this._textSelected
        }
      );
      ReactDom.render(element, this._headerPlaceholder.domElement);
    }
    return Promise.resolve();
  }
  private _onDispose(): void {
    console.log("[SearchExtension._onDispose] Disposed breadcrumb.");
  }
}
