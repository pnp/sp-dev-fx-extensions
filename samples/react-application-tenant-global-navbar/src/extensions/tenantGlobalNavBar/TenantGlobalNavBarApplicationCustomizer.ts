import * as React from "react";
import * as ReactDom from "react-dom";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base";
import * as SPTermStore from "./services/SPTermStoreService";
import * as strings from "TenantGlobalNavBarApplicationCustomizerStrings";
import TenantGlobalNavBar from "./components/TenantGlobalNavBar";
import TenantGlobalFooterBar from "./components/TenantGlobalFooterBar";
import pnp from "sp-pnp-js";
import { Log } from "@microsoft/sp-core-library";
import {
  DEFAULT_BOTTOM_MENU_TERM_SET,
  DEFAULT_TOP_MENU_TERM_SET,
} from "./constants/defaults";

export interface ITenantGlobalNavBarApplicationCustomizerProperties {
  TopMenuTermSet?: string;
  BottomMenuTermSet?: string;
}

const LOG_SOURCE: string = "TenantGlobalNavBarApplicationCustomizer";
const NAV_TERMS_KEY: string = "global-navigation-terms";

export default class TenantGlobalNavBarApplicationCustomizer extends BaseApplicationCustomizer<ITenantGlobalNavBarApplicationCustomizerProperties> {
  private topPlaceholder: PlaceholderContent | undefined;
  private bottomPlaceholder: PlaceholderContent | undefined;
  private topMenuItems: SPTermStore.ISPTermObject[];
  private bottomMenuItems: SPTermStore.ISPTermObject[];

  public onInit = async (): Promise<void> => {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Configure caching
    pnp.setup({
      defaultCachingStore: "session",
      defaultCachingTimeoutSeconds: 900, //15min
      globalCacheDisable: false, // true to disable caching in case of debugging/testing
    });

    // Retrieve the menu items from taxonomy
    const termStoreService: SPTermStore.SPTermStoreService =
      new SPTermStore.SPTermStoreService({
        spHttpClient: this.context.spHttpClient,
        siteAbsoluteUrl: this.context.pageContext.web.absoluteUrl,
      });

    // Check on Top Terms
    const cachedTerms = pnp.storage.session.get(NAV_TERMS_KEY);

    if (cachedTerms !== null) {
      this.topMenuItems = cachedTerms;
    } else {
      const topMenuTermSet =
        this.properties.TopMenuTermSet ?? DEFAULT_TOP_MENU_TERM_SET;

      this.topMenuItems = await termStoreService.getTermsFromTermSetAsync(
        topMenuTermSet,
        this.context.pageContext.web.language
      );
      pnp.storage.session.put(NAV_TERMS_KEY, this.topMenuItems);
    }

    // Check on Bottom Terms
    const bottomMenuTermSet =
      this.properties.BottomMenuTermSet ?? DEFAULT_BOTTOM_MENU_TERM_SET;

    this.bottomMenuItems = await termStoreService.getTermsFromTermSetAsync(
      bottomMenuTermSet,
      this.context.pageContext.web.language
    );

    this.context.placeholderProvider.changedEvent.add(
      this,
      this.renderPlaceHolders
    );

    return Promise.resolve();
  };

  public onDispose(): Promise<void> {
    if (this.topPlaceholder)
      ReactDom.unmountComponentAtNode(this.topPlaceholder.domElement);

    if (this.bottomPlaceholder)
      ReactDom.unmountComponentAtNode(this.bottomPlaceholder.domElement);

    this.context.placeholderProvider.changedEvent.remove(
      this,
      this.renderPlaceHolders
    );

    return Promise.resolve();
  }

  private renderPlaceHolders(): void {
    if (!this.topPlaceholder) {
      this.topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this.onDispose }
      );
    }

    if (this.topPlaceholder) {
      const element: React.ReactElement<{}> = React.createElement(
        TenantGlobalNavBar,
        {
          menuItems: this.topMenuItems,
        }
      );
      ReactDom.render(element, this.topPlaceholder.domElement);
    }

    if (!this.bottomPlaceholder) {
      this.bottomPlaceholder =
        this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Bottom,
          {
            onDispose: this.onDispose,
          }
        );
    }

    if (this.bottomPlaceholder) {
      const element: React.ReactElement<{}> = React.createElement(
        TenantGlobalFooterBar,
        {
          menuItems: this.bottomMenuItems,
        }
      );
      ReactDom.render(element, this.bottomPlaceholder.domElement);
    }
  }
}
