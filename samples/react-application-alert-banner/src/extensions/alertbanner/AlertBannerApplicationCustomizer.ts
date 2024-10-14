// AlertBannerApplicationCustomizer.ts

import * as React from "react";
import * as ReactDOM from "react-dom";
import { override } from "@microsoft/decorators";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base";
import Alerts from "./Components/Alerts/Alerts";
import { IAlertsBannerApplicationCustomizerProperties, IAlertsProps } from "./Components/Alerts/IAlerts.types";
import { MSGraphClientV3 } from "@microsoft/sp-http";
export default class AlertsBannerApplicationCustomizer extends BaseApplicationCustomizer<IAlertsBannerApplicationCustomizerProperties> {
  private _topPlaceholderContent: PlaceholderContent | undefined;

  @override
  public async onInit(): Promise<void> {
    this.context.placeholderProvider.changedEvent.add(
      this,
      this._renderTopPlaceholder
    );

    await this._renderTopPlaceholder();
  }

  @override
  public onDispose(): void {
    this.context.placeholderProvider.changedEvent.remove(
      this,
      this._renderTopPlaceholder
    );
    this._disposeAlertsComponent();
    super.onDispose();
  }

  private async _renderTopPlaceholder(): Promise<void> {
    if (!this._topPlaceholderContent) {
      if (
        !this.context.placeholderProvider.placeholderNames.includes(
          PlaceholderName.Top
        )
      ) {
        console.warn("Top placeholder is not available.");
        return;
      }

      this._topPlaceholderContent = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: this._disposeAlertsComponent }
      );
    }

    if (this._topPlaceholderContent) {
      await this._renderAlertsComponent();
    }
  }

  private async _renderAlertsComponent(): Promise<void> {
    try {
      if (
        this._topPlaceholderContent &&
        this._topPlaceholderContent.domElement
      ) {
        const msGraphClient: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient("3") as MSGraphClientV3;
        const alertTypesJsonString = JSON.stringify(this.properties);

        console.log(alertTypesJsonString)
        // Get the current site ID
        const currentSiteId: string = this.context.pageContext.site.id.toString();

        // Get the hub site ID, if available
        const siteContext = this.context.pageContext as any; // Cast to any to access hubSiteId
        const hubSiteId: string = siteContext.site.hubSiteId
          ? siteContext.site.hubSiteId.toString()
          : "";

        // Get the SharePoint home site ID
        const homeSiteResponse = await msGraphClient
          .api("/sites/root")
          .select("id")
          .get();
        const homeSiteId: string = homeSiteResponse.id;

        // Prepare the array of site IDs, ensuring uniqueness
        const siteIds: string[] = [currentSiteId];

        if (
          hubSiteId &&
          hubSiteId !== "00000000-0000-0000-0000-000000000000" &&
          hubSiteId !== currentSiteId &&
          !siteIds.includes(hubSiteId)
        ) {
          siteIds.push(hubSiteId);
        }

        if (
          homeSiteId &&
          homeSiteId !== currentSiteId &&
          homeSiteId !== hubSiteId &&
          !siteIds.includes(homeSiteId)
        ) {
          siteIds.push(homeSiteId);
        }

        // Create the Alerts React element with the necessary props
        const alertsComponentElement: React.ReactElement<IAlertsProps> = React.createElement(
          Alerts,
          {
            siteIds: siteIds, // Pass the array of site IDs
            graphClient: msGraphClient, // Pass the Graph client to the Alerts component
            alertTypesJson: alertTypesJsonString, // Pass the alert types JSON from properties
          }
        );

        // Render the Alerts component into the top placeholder's DOM element
        ReactDOM.render(
          alertsComponentElement,
          this._topPlaceholderContent.domElement
        );
      }
    } catch (error) {
      console.error("Error rendering Alerts component:", error);
    }
  }

  // Dispose the React component when the customizer is disposed
  private _disposeAlertsComponent = (): void => {
    if (
      this._topPlaceholderContent &&
      this._topPlaceholderContent.domElement
    ) {
      ReactDOM.unmountComponentAtNode(this._topPlaceholderContent.domElement);
    }
  };
}
