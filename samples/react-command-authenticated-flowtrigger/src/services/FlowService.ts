import {
  AadHttpClient,
  HttpClientResponse,
  IHttpClientOptions,
} from "@microsoft/sp-http";
import { type AadHttpClientFactory } from "@microsoft/sp-http";
import { IFlowRequestBody } from "../models";
import { FlowConfig } from "../constants";

export interface IFlowResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export class FlowService {
  private static aadHttpClient: AadHttpClient;

  public static async init(aadHttpClientFactory: AadHttpClientFactory): Promise<void> {
    // Initialize AAD HTTP Client for authenticated calls to Power Automate
    FlowService.aadHttpClient = await aadHttpClientFactory.getClient(
      "https://service.flow.microsoft.com/"
    );
  }

  public static async triggerFlow(
    requestBody: IFlowRequestBody
  ): Promise<IFlowResponse> {
    const httpClientOptions: IHttpClientOptions = {
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response: HttpClientResponse = await FlowService.aadHttpClient.post(
        FlowConfig.flowUrl,
        AadHttpClient.configurations.v1,
        httpClientOptions
      );

      if (response.ok) {
        let data: unknown = null;
        try {
          data = await response.json();
        } catch {
          // Response might not be JSON
        }

        return {
          success: true,
          message: FlowConfig.successMessage,
          data,
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `${FlowConfig.errorMessage} (${response.status}: ${errorText})`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `${FlowConfig.errorMessage} ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
