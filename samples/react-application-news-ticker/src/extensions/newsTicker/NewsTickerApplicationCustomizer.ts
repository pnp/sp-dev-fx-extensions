import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base";
import * as React from 'react';
import * as ReactDom from 'react-dom';

import * as strings from "NewsTickerApplicationCustomizerStrings";
import NewsTicker from "./components/NewsTicker";

const LOG_SOURCE: string = "NewsTickerApplicationCustomizer";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface INewsTickerApplicationCustomizerProperties {
  // This is an example; replace with your own property
  listTitle: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class NewsTickerApplicationCustomizer extends BaseApplicationCustomizer<INewsTickerApplicationCustomizerProperties> {
  private _topPlaceholder: PlaceholderContent | undefined;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Wait for the placeholders to be created (or handle them being changed) and then
    // render.
    this.context.placeholderProvider.changedEvent.add(
      this,
      this._renderPlaceHolders
    );

    return Promise.resolve<void>();
  }

  private _renderPlaceHolders(): void {
    console.log("HelloWorldApplicationCustomizer._renderPlaceHolders()");
    console.log(
      "Available placeholders: ",
      this.context.placeholderProvider.placeholderNames
        .map((name) => PlaceholderName[name])
        .join(", ")
    );

    // Handling the top placeholder
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this._onDispose }
      );

      // The extension should not assume that the expected placeholder is available.
      if (!this._topPlaceholder) {
        console.error("The expected placeholder (Top) was not found.");
        return;
      }

      if (this.properties) {
        if (this._topPlaceholder.domElement) {
          const element = React.createElement(NewsTicker, {});
          ReactDom.render(element, this._topPlaceholder.domElement)
        }
      }
    }
  }

  private _onDispose(): void {
    console.log(
      "[HelloWorldApplicationCustomizer._onDispose] Disposed custom top placeholders."
    );
  }
}
