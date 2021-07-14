import * as React from "react";
import * as ReactDom from "react-dom";

import { override } from "@microsoft/decorators";
import { BaseApplicationCustomizer, PlaceholderContent, PlaceholderName } from "@microsoft/sp-application-base";
import { Log } from "@microsoft/sp-core-library";

import { AppContext } from "../../common";
import { GlobalStateProvider } from "../../components";
import { MyNotifications } from "../../components/MyNotifications/MyNotifications";

const LOG_SOURCE: string = "MyListsNotificationsApplicationCustomizer";
const theme = window.__themeState__.theme;

export interface IMyListsNotificationsApplicationCustomizerProperties {
  // right property to position the extension incon (start from Right)
  right: number;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MyListsNotificationsApplicationCustomizer extends BaseApplicationCustomizer<
  IMyListsNotificationsApplicationCustomizerProperties
> {
  private _headerPlaceholder: PlaceholderContent;
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${"teste"}`);

    this._renderPlaceHolders();
    return Promise.resolve();
  }

  private _renderPlaceHolders(): void {
    // Check if the header placeholder is already set and if the header placeholder is available
    if (
      !this._headerPlaceholder &&
      this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1
    ) {
      this._headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
        onDispose: this._onDispose,
      });
      // The extension should not assume that the expected placeholder is available.
      if (!this._headerPlaceholder) {
        console.error("The expected placeholder (PageHeader) was not found.");
        return;
      }

      if (this._headerPlaceholder.domElement) {
        const appContext = React.createElement(
          AppContext.Provider,
          {
            value: { context: this.context, theme: theme },
          },
          React.createElement(MyNotifications, {
            context: this.context,
            right: this.properties.right
          })
        );
        const elementProvider = React.createElement(GlobalStateProvider, {
          children: appContext,
        });
        ReactDom.render(elementProvider, this._headerPlaceholder.domElement);
      }
    }
  }

  private _onDispose(): void {
    console.log("dispose TeamsChatNotifications");
  }
}
