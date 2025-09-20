import { Log } from "@microsoft/sp-core-library";
import { BaseApplicationCustomizer, PlaceholderContent, PlaceholderName } from "@microsoft/sp-application-base";
import * as React from "react";
import * as ReactDom from "react-dom";
import GraphService from "./service/GraphService";
import Constants from "./helpers/Constants";
import INewsTickerProps from "./components/INewsTickerProps";
import NewsTicker from "./components/NewsTicker";

const LOG_SOURCE: string = "NewsTickerApplicationCustomizer";

export interface INewsTickerApplicationCustomizerProperties {
  listTitle: string;
  bgColor?: string;
  textColor?: string;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  showDate?: boolean;
  dateFormat?: 'short' | 'medium' | 'long';
  maxItems?: number;
  respectMotionPreference?: boolean;
  refreshInterval?: number;
}

export default class NewsTickerApplicationCustomizer extends BaseApplicationCustomizer<INewsTickerApplicationCustomizerProperties> {
  private _topPlaceholder: PlaceholderContent | undefined;
  private _graphService: GraphService;

  protected onInit(): Promise<void> {
    return super.onInit().then(async () => {
      const graphClient = await this.context.msGraphClientFactory.getClient("3");
      const spHttpClient = this.context.spHttpClient;
      this._graphService = new GraphService(graphClient, spHttpClient);
      this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
    });
  }
  
  private _renderPlaceHolders = async (): Promise<void> => {
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this._onDispose });

      if (!this._topPlaceholder || !this._topPlaceholder.domElement) {
        Log.error(LOG_SOURCE, new Error("The expected placeholder (Top) was not found or failed to initialize."));
        return;
      }

      const { 
        listTitle, 
        bgColor, 
        textColor, 
        speed, 
        direction, 
        pauseOnHover, 
        showDate, 
        dateFormat, 
        maxItems, 
        respectMotionPreference
      } = this.properties;

      if (!listTitle) {
        Log.error(LOG_SOURCE, new Error("Required property listTitle is missing."));
        return;
      }

      try {
        const siteName = this.context.pageContext.site.absoluteUrl;
        const siteID = this.context.pageContext.site.id.toString();
        const newsItems = await this._graphService.getNewsItems(siteID,siteName, listTitle);

        if (!newsItems || newsItems.length === 0) {
          Log.info(LOG_SOURCE, "No news items to display.");
          return;
        }

        if (document.getElementById(Constants.ROOT_ID)) {
          Log.info(LOG_SOURCE, "NewsTicker already rendered.");
          return;
        }
        const element = React.createElement(NewsTicker, {
          items: newsItems,
          bgColor,
          textColor,
          speed,
          direction,
          pauseOnHover,
          showDate,
          dateFormat,
          maxItems,
          respectMotionPreference,
          locale: this.context.pageContext.cultureInfo.currentCultureName || navigator.language || 'en-US',
        } as INewsTickerProps);

        ReactDom.render(element, this._topPlaceholder.domElement);

      } catch (error) {
        Log.error(LOG_SOURCE, new Error(`Error rendering NewsTicker: ${error.message}`));
      }
    }
  };

  private _onDispose = (): void => {
    if (this._topPlaceholder?.domElement) {
      ReactDom.unmountComponentAtNode(this._topPlaceholder.domElement);
    }
    Log.info(LOG_SOURCE, "Disposed custom top placeholders.");
  };
}
