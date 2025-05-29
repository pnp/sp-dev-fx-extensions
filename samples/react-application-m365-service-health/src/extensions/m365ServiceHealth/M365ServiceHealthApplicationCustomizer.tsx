import * as React from "react";
import * as ReactDOM from "react-dom";
import * as strings from "M365ServiceHealthApplicationCustomizerStrings";

import {
  BaseApplicationCustomizer,
  PlaceholderName,
} from "@microsoft/sp-application-base";
import { convertToV8Theme, isUserAdmin, loadTheme } from "./extensionHelper";

import { EScope } from "../../constants/EScope";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { Log } from "@microsoft/sp-core-library";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { RenderBottomExtension } from "../../components/renderBottomExtension/RenderBottomExtension";
import { Theme } from "@fluentui/react-components";
import { createV9Theme } from "@fluentui/react-migration-v8-v9";

const LOG_SOURCE = "M365ServiceHealthApplicationCustomizer";

export interface IM365ServiceHealthApplicationCustomizerProperties {
  scope:  EScope
}

export default class M365ServiceHealthApplicationCustomizer extends BaseApplicationCustomizer<IM365ServiceHealthApplicationCustomizerProperties> {
  private _bottomPlaceholderElement?: HTMLElement;
  private _graphClient?: MSGraphClientV3;
  private _themeVariant?: IReadonlyTheme;
  private _theme?: Theme;
  private _scope: EScope = EScope.ADMINS;

  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    try {
      this._graphClient = await this.context.msGraphClientFactory.getClient(
        "3"
      );
      this._themeVariant = loadTheme();

      if (this._themeVariant?.palette) {
        const v8Theme = convertToV8Theme(this._themeVariant);
        this._theme = createV9Theme(v8Theme);
      } else {
        Log.warn(LOG_SOURCE, "Theme palette is undefined.");
      }

      this._scope = this.properties.scope ? this.properties.scope : EScope.ADMINS;

      if (this._scope === EScope.ADMINS ) {
        const isAdmin = await isUserAdmin(this._graphClient);
        if (!isAdmin) {
          Log.warn(LOG_SOURCE, "User is not an admin. Skipping rendering.");
          return;
        }
      }

      const placeholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Bottom,
        {
          onDispose: () => this._dispose(),
        }
      );

      if (placeholder?.domElement) {
        this._bottomPlaceholderElement = placeholder.domElement;
        ReactDOM.render(
          <RenderBottomExtension
            graphClientFactory={this._graphClient}
            theme={this._theme}
            scope={this._scope}
          />,
          this._bottomPlaceholderElement
        );
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error);
    }
  }

  private _dispose(): void {
    if (this._bottomPlaceholderElement) {
      ReactDOM.unmountComponentAtNode(this._bottomPlaceholderElement);
      this._bottomPlaceholderElement = undefined;
    }
  }
}
