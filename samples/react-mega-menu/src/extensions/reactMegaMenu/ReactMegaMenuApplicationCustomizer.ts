import * as React from "react";
import * as ReactDom from "react-dom";
import { Logger } from "@pnp/logging";
import { override } from "@microsoft/decorators";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from "@microsoft/sp-application-base";

import * as strings from "ReactMegaMenuApplicationCustomizerStrings";

import MegaMenuComponent from "./components/MegaMenuComponent";
import { IMegaMenuProps } from "./components/IMegaMenuProps";
import { IMenuProvider, MenuSPListProvider, MenuFakeProvider } from "./menuProvider/index";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IReactMegaMenuApplicationCustomizerProperties {

  /**
   * If isDebug=true then the customizer will use fake json data instead of
   * existing sharepoitn list.
   * Note: that property in the debug url queryString should be:
   *                  GOOD:{"isDebug":false}
   *                  WRONG: {"isDebug":"false"}
   */
  isDebug: boolean;

  /**
   * If rootWebOnly=true then the mega menu should collect menu data from
   *  the root site mega menu list only.
   * Note: that property in the debug url queryString should be:
   *                  GOOD:{"rootWebOnly":false}
   *                  WRONG: {"rootWebOnly":"false"}
   */
  rootWebOnly : boolean;

  /**
   * If enableSessionStorageCache=true then the menu items should be cached during
   * the browser session in the local session storage for quick access.
   * Note: that property in the debug url queryString should be:
   *                  GOOD:{"enableSessionStorageCache":false}
   *                  WRONG: {"enableSessionStorageCache":"false"}
   */
  enableSessionStorageCache: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class ReactMegaMenuApplicationCustomizer
  extends BaseApplicationCustomizer<IReactMegaMenuApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {

    let placeholder: PlaceholderContent;
    placeholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);

    // init the react mega menu component.
    const element: React.ReactElement<IMegaMenuProps> = React.createElement(
      MegaMenuComponent,
      {
        menuProvider: this.getMenuProvider()
      }
    );

    // render the react element in the top placeholder.
    ReactDom.render(element, placeholder.domElement);

    return Promise.resolve();
  }

  protected getMenuProvider(): IMenuProvider {

    if (this.properties.isDebug) {

      return new MenuFakeProvider();
    }

    // get the current web absolute url by default.
    let webUrl: string = this.context.pageContext.web.absoluteUrl;

    if (this.properties.rootWebOnly) {

      // if rootWebOnly property enabled then use
      // the SharePoint root web mega menu list.
      webUrl = this.context.pageContext.site.absoluteUrl;
    }

    return new MenuSPListProvider(webUrl, this.properties.enableSessionStorageCache);
  }
}
