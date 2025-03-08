import * as React from "react";
import * as ReactDOM from "react-dom";
import { override } from "@microsoft/decorators";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base";
import { IAlertsBannerApplicationCustomizerProperties } from "./Components/Alerts/IAlerts";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { AlertsProvider } from "./Components/Context/AlertsContext";
import Alerts from "./Components/Alerts/Alerts";

export default class AlertsBannerApplicationCustomizer extends BaseApplicationCustomizer<IAlertsBannerApplicationCustomizerProperties> {
  private _topPlaceholderContent: PlaceholderContent | undefined;
  private _customProperties: IAlertsBannerApplicationCustomizerProperties;

  @override
  public async onInit(): Promise<void> {
    // Initialize default configuration
    this._initializeDefaultProperties();

    // Add listener for placeholder changes
    this.context.placeholderProvider.changedEvent.add(
      this,
      this._renderTopPlaceholder
    );

    await this._renderTopPlaceholder();
  }

  private _initializeDefaultProperties(): void {
    // Instead of modifying this.properties directly, create a local copy
    this._customProperties = { ...this.properties };
  
    // Set default alert types if none are provided
    if (!this._customProperties.alertTypesJson || this._customProperties.alertTypesJson === "[]") {
      const defaultAlertTypes = [
        {
          "name": "Info",
          "iconName": "Info",
          "backgroundColor": "#389899",
          "textColor": "#ffffff",
          "additionalStyles": "",
          "priorityStyles": {
            "critical": "border: 2px solid #E81123;",
            "high": "border: 1px solid #EA4300;",
            "medium": "",
            "low": ""
          }
        },
        {
          "name": "Warning",
          "iconName": "Warning",
          "backgroundColor": "#f1c40f",
          "textColor": "#000000",
          "additionalStyles": "",
          "priorityStyles": {
            "critical": "border: 2px solid #E81123;",
            "high": "border: 1px solid #EA4300;",
            "medium": "",
            "low": ""
          }
        },
        {
          "name": "Maintenance",
          "iconName": "ConstructionCone",
          "backgroundColor": "#afd6d6",
          "textColor": "#000000",
          "additionalStyles": "",
          "priorityStyles": {
            "critical": "border: 2px solid #E81123;",
            "high": "border: 1px solid #EA4300;",
            "medium": "",
            "low": ""
          }
        },
        {
          "name": "Interruption",
          "iconName": "Error",
          "backgroundColor": "#c54644",
          "textColor": "#ffffff",
          "additionalStyles": "",
          "priorityStyles": {
            "critical": "border: 2px solid #E81123;",
            "high": "border: 1px solid #EA4300;",
            "medium": "",
            "low": ""
          }
        }
      ];
      
      this._customProperties.alertTypesJson = JSON.stringify(defaultAlertTypes);
    }
  
    // Set defaults for any missing properties
    this._customProperties.userTargetingEnabled = 
      this._customProperties.userTargetingEnabled !== undefined ? 
      this._customProperties.userTargetingEnabled : true;
    
    this._customProperties.notificationsEnabled = 
      this._customProperties.notificationsEnabled !== undefined ? 
      this._customProperties.notificationsEnabled : true;
    
    this._customProperties.richMediaEnabled = 
      this._customProperties.richMediaEnabled !== undefined ? 
      this._customProperties.richMediaEnabled : true;
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
        // Try to get Graph client with version 3, with error handling
        let msGraphClient: MSGraphClientV3;
        try {
          msGraphClient = await this.context.msGraphClientFactory.getClient("3") as MSGraphClientV3;
        } catch (graphError) {
          console.error("Error getting Graph client v3:", graphError);
          throw graphError; // Re-throw to be caught by outer try/catch
        }
        
        // Get the current site ID
        const currentSiteId: string = this.context.pageContext.site.id.toString();
        let siteIds: string[] = [currentSiteId];

        try {
          // Get the hub site ID, if available
          const siteContext = this.context.pageContext as any; // Cast to any to access hubSiteId
          const hubSiteId: string = siteContext.site.hubSiteId
            ? siteContext.site.hubSiteId.toString()
            : "";

          if (
            hubSiteId &&
            hubSiteId !== "00000000-0000-0000-0000-000000000000" &&
            hubSiteId !== currentSiteId &&
            !siteIds.includes(hubSiteId)
          ) {
            siteIds.push(hubSiteId);
          }

          // Get the SharePoint home site ID
          try {
            const homeSiteResponse = await msGraphClient
              .api("/sites/root")
              .select("id")
              .get();
            const homeSiteId: string = homeSiteResponse.id;

            if (
              homeSiteId &&
              homeSiteId !== currentSiteId &&
              homeSiteId !== hubSiteId &&
              !siteIds.includes(homeSiteId)
            ) {
              siteIds.push(homeSiteId);
            }
          } catch (homeSiteError) {
            console.warn("Unable to fetch home site, continuing with local and hub sites only:", homeSiteError);
          }
        } catch (siteError) {
          console.warn("Error gathering site IDs, falling back to current site only:", siteError);
        }

        // Get alert types from our custom properties
        const alertTypesJsonString = this._customProperties.alertTypesJson || "[]";

        // Create the AlertsContext provider
        const alertsComponent = React.createElement(
          Alerts,
          {
            siteIds: siteIds,
            graphClient: msGraphClient,
            alertTypesJson: alertTypesJsonString,
            userTargetingEnabled: this._customProperties.userTargetingEnabled,
            notificationsEnabled: this._customProperties.notificationsEnabled,
            richMediaEnabled: this._customProperties.richMediaEnabled
          }
        );

        // Wrap with the AlertsProvider
        const alertsApp = React.createElement(
          AlertsProvider, 
          { children: alertsComponent }
        );

        // Render with error handling
        ReactDOM.render(
          alertsApp,
          this._topPlaceholderContent.domElement
        );
      }
    } catch (error) {
      console.error("Error rendering Alerts component:", error);
      
      // Render a minimal error message instead of failing completely
      if (this._topPlaceholderContent && this._topPlaceholderContent.domElement) {
        const errorElement = React.createElement(
          'div',
          { style: { padding: '10px', color: '#666', fontSize: '13px' } },
          'Unable to load alerts at this time. Please try refreshing the page.'
        );
        
        ReactDOM.render(
          errorElement,
          this._topPlaceholderContent.domElement
        );
      }
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