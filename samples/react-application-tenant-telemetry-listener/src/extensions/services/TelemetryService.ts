import { ApplicationInsights } from '@microsoft/applicationinsights-web';

export interface ITelemetryPayload {
  eventName: string;

  // Common fields we want
  tenantId?: string;
  siteUrl?: string;
  pageUrl?: string;
  componentId?: string;
  componentName?: string;
  componentVersion?: string;

  // Extra dynamic props
  [key: string]: string | number | boolean | undefined;
}

export class TelemetryService {
  private static _instance: TelemetryService;
  private _mode: "appinsights" | "function" = "appinsights";
  private _endpoint: string = "";
  private _appInsights: ApplicationInsights | undefined;

  public static get instance(): TelemetryService {
    if (!TelemetryService._instance) {
      TelemetryService._instance = new TelemetryService();
    }
    return TelemetryService._instance;
  }

  public configure(mode: "appinsights" | "function", endpoint: string):void {
    this._mode = mode;
    this._endpoint = endpoint;

    if (mode === "appinsights") {
      this._appInsights = new ApplicationInsights({
        config: {
          connectionString: endpoint,
          enableAutoRouteTracking: false
        }
      });
      this._appInsights.loadAppInsights();
    }
  }

  public async track(payload: ITelemetryPayload): Promise<void> {
    if (this._mode === "appinsights") {
      this._appInsights?.trackEvent({ name: payload.eventName }, payload);
      return;
    }

    // Azure Function mode
    try {
      await fetch(this._endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Never break the page
      console.warn("Telemetry failed", err);
    }
  }
}
