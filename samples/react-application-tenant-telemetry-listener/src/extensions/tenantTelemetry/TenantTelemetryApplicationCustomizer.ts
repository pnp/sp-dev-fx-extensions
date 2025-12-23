import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

import { TelemetryService, ITelemetryPayload } from '../services/TelemetryService';

export interface ITenantTelemetryApplicationCustomizerProperties {
  mode: "appinsights" | "function";
  endpoint: string;
}

/** 
 * Sample payload that web parts can emit
 * 
 * window.dispatchEvent(
 *   new CustomEvent("spfx-telemetry", {
 *     detail: {
 *       eventName: "MyWebPart_Render",
 *       componentId: "1234-5678-90",
 *       componentName: "My Web Part",
 *       componentVersion: "1.0.0",
 *       action: "render",
 *       customData: { key: "value" }
 *     }
 *   })
 * );
 */
// const SAMPLE_PAYLOAD: ITelemetryPayload = {
//   eventName: "Sample_Event",
//   componentId: "sample-component-id",
//   componentName: "SampleComponent",
//   componentVersion: "0.0.1",
//   siteUrl: "",
//   pageUrl: "",
//   customData: "anything you want"
// };

/** A Custom Action which can be run during execution of a Client Side Application */
export default class TenantTelemetryApplicationCustomizer
  extends BaseApplicationCustomizer<ITenantTelemetryApplicationCustomizerProperties> {

  public onInit(): Promise<void> {
    Log.info('TenantTelemetryApplicationCustomizer', 'Initialized TenantTelemetryApplicationCustomizer');

    // Configure telemetry
    if (!this.context.isServedFromLocalhost) {
      TelemetryService.instance.configure(
        this.properties.mode,
        this.properties.endpoint
      );
    }

    // Listener for Web Parts or other extensions triggering telemetry
    window.addEventListener("spfx-telemetry", (e: CustomEvent<Partial<ITelemetryPayload>>) => {

      if (!e.detail || !e.detail.eventName) {
        console.warn("Telemetry event received without eventName");
        return;
      }

      // Enrich the event with page context
      const data: ITelemetryPayload = {
        ...e.detail,
        eventName: e.detail.eventName, 
        siteUrl: this.context.pageContext.web.absoluteUrl,
        pageUrl: window.location.href
        
      };

      //  TelemetryService.instance.track(data).catch((): void => {});
       TelemetryService.instance.track(data).catch((): void => { /* intentionally ignored */ });
    });

    return Promise.resolve();
  }
}
