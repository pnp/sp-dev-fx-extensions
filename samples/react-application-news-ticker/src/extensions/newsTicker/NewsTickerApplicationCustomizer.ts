import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base";
import * as React from "react";
import * as ReactDom from "react-dom";
import { sp } from "@pnp/sp/presets/all";

import * as strings from "NewsTickerApplicationCustomizerStrings";
import NewsTicker from "./components/NewsTicker";
import SpService from "./service/SpService";
import INewsTickerProps from "./components/INewsTickerProps";
import Constants from "./helpers/Constants";

const LOG_SOURCE: string = "NewsTickerApplicationCustomizer";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface INewsTickerApplicationCustomizerProperties {
  listTitle: string;
  listViewTitle: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class NewsTickerApplicationCustomizer extends BaseApplicationCustomizer<INewsTickerApplicationCustomizerProperties> {
  private _topPlaceholder: PlaceholderContent | undefined;
  private _spService = new SpService();

  @override
  public async onInit(): Promise<void> {
    return super.onInit().then((_) => {
      Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

      sp.setup({
        spfxContext: this.context,
      });

      // Wait for the placeholders to be created (or handle them being changed) and then
      // render.
      this.context.placeholderProvider.changedEvent.add(
        this,
        this._renderPlaceHolders
      );
    });
  }

  private async _renderPlaceHolders(): Promise<void> {
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

      if (!this.properties || !this.properties.listTitle || !this.properties.listViewTitle) {
        console.error("listTitle or listViewTitle properties value was not found or empty");
      }

      if (this._topPlaceholder.domElement) {
        // Get news items
        const newsItems = await this._spService.getNewsItems(
          this.properties.listTitle,
          this.properties.listViewTitle
        );

        // Doesn't need to show news ticker if there is no news for now
        if (!newsItems || newsItems.length == 0) return;

        // Find existing element
        const existingElement = document.getElementById(Constants.ROOT_ID);
        
        // Stop if another news ticker found
        if (document.body.contains(existingElement)) return;

        const element = React.createElement(NewsTicker, <INewsTickerProps>{
          items: newsItems,
        });
        ReactDom.render(element, this._topPlaceholder.domElement);
      }
    }
  }

  private _onDispose(): void {
    console.log(
      "[HelloWorldApplicationCustomizer._onDispose] Disposed custom top placeholders."
    );
  }
}
