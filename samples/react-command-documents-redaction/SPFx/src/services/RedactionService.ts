import {
  HttpClient,
  HttpClientResponse,
  IHttpClientOptions,
  AadTokenProvider,
} from "@microsoft/sp-http";
import { ExtensionContext } from "@microsoft/sp-extension-base";
import {
  RedactionResult,
  RedactionJobStatus,
  DocumentInfo,
  RedactionOptions,
} from "../models/RedactionModels";

export interface IRedactionServiceConfig {
  azureFunctionUrl: string;
  clientId?: string; // The Application ID URI or API scope for the Azure Function (e.g., "api://your-function-app-id/.default")
  functionKey?: string;
  timeoutMs?: number;
}

export class RedactionService {
  private context: ExtensionContext;
  private config: IRedactionServiceConfig;
  private readonly DEFAULT_TIMEOUT = 300000; // 5 minutes

  constructor(context: ExtensionContext, config: IRedactionServiceConfig) {
    this.context = context;
    this.config = {
      timeoutMs: this.DEFAULT_TIMEOUT,
      ...config,
    };
  }

  // Helper function to map server response with uppercase properties to RedactionResult
  private mapServerResult(serverResponse: any): RedactionResult {
    return {
      success: serverResponse.Success ?? serverResponse.success ?? false,
      jobId: serverResponse.JobId ?? serverResponse.jobId ?? "",
      message: serverResponse.Message ?? serverResponse.message ?? "",
      processedDocuments:
        serverResponse.ProcessedDocuments ?? serverResponse.processedDocuments,
      errors: serverResponse.Errors ?? serverResponse.errors,
    };
  }

  // Helper function to map server response with uppercase properties to RedactionJobStatus
  private mapServerStatus(serverResponse: any): RedactionJobStatus {
    const rawStatus = serverResponse.Status ?? serverResponse.status ?? 0;
    const mappedStatus = this.mapStatusEnumToString(rawStatus);

    console.log(`Status mapping: raw=${rawStatus} -> mapped=${mappedStatus}`);

    return {
      jobId: serverResponse.JobId ?? serverResponse.jobId ?? "",
      status: mappedStatus,
      progress: serverResponse.Progress ?? serverResponse.progress ?? 0,
      message: serverResponse.Message ?? serverResponse.message,
      completedDocuments:
        serverResponse.CompletedDocuments ??
        serverResponse.completedDocuments ??
        [],
      failedDocuments:
        serverResponse.FailedDocuments ?? serverResponse.failedDocuments ?? [],
    };
  }

  public async startRedactionJob(
    documents: DocumentInfo[],
    options: RedactionOptions
  ): Promise<RedactionResult> {
    try {
      // Validate configuration
      if (!this.config.clientId || !this.config.azureFunctionUrl) {
        return {
          success: false,
          jobId: "",
          message: "Function URL or Client ID not configured",
          errors: ["Function URL or Client ID not configured"],
        };
      }

      // Get AAD token for the configured client ID
      const aadTokenProvider: AadTokenProvider =
        await this.context.aadTokenProviderFactory.getTokenProvider();
      const accessToken: string = await aadTokenProvider.getToken(
        `api://${this.config.clientId}`
      );

      const requestBody = {
        siteUrl: this.context.pageContext.web.absoluteUrl,
        documents: documents.filter((doc) => doc.isSupported),
        options,
        context: {
          userId: this.context.pageContext.user.loginName,
          webId: this.context.pageContext.web.id.toString(),
          listId: this.context.pageContext.list?.id.toString(),
          tenantId: this.context.pageContext.aadInfo.tenantId.toString(),
        },
      };

      const requestOptions: IHttpClientOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      };

      // Use HttpClient with manual Bearer token
      const response: HttpClientResponse = await this.context.httpClient.post(
        `${this.config.azureFunctionUrl}/api/redaction/start?code=${this.config.functionKey}`,
        HttpClient.configurations.v1,
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Azure Function error response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        // Handle specific error cases
        if (response.status === 403) {
          throw new Error(
            `Access denied (403). Check if Function App allows your Azure AD app and user has permissions.`
          );
        } else if (response.status === 401) {
          throw new Error(
            `Authentication failed (401). Check Azure AD configuration and token validity.`
          );
        } else {
          throw new Error(
            `Azure Function call failed: ${response.status} - ${errorText}`
          );
        }
      }

      const serverResponse = await response.json();
      console.log("Raw Azure Function response:", serverResponse);

      const result = this.mapServerResult(serverResponse);
      console.log("Mapped result:", result);

      return result;
    } catch (error) {
      console.error("Error starting redaction job:", error);
      return {
        success: false,
        jobId: "",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  public async getJobStatus(
    jobId: string
  ): Promise<RedactionJobStatus | undefined> {
    try {
      if (this.config.clientId && this.config.azureFunctionUrl) {
        // Get AAD token for the configured client ID
        const aadTokenProvider: AadTokenProvider =
          await this.context.aadTokenProviderFactory.getTokenProvider();
        const accessToken: string = await aadTokenProvider.getToken(
          `api://${this.config.clientId}`
        );

        const requestOptions: IHttpClientOptions = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        };

        const response: HttpClientResponse = await this.context.httpClient.get(
          `${this.config.azureFunctionUrl}/api/redaction/status/${jobId}?code=${this.config.functionKey}`,
          HttpClient.configurations.v1,
          requestOptions
        );

        if (!response.ok) {
          if (response.status === 404) {
            return undefined; // Job not found
          }
          throw new Error(`Status check failed: ${response.status}`);
        }

        const serverResponse = await response.json();
        console.log("Raw server status response:", serverResponse);

        const status = this.mapServerStatus(serverResponse);
        console.log("Mapped status:", status);

        return status;
      }
    } catch (error) {
      console.error("Error checking job status:", error);
      return undefined;
    }
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    try {
      if (this.config.clientId && this.config.azureFunctionUrl) {
        // Get AAD token for the configured client
        const aadTokenProvider: AadTokenProvider =
          await this.context.aadTokenProviderFactory.getTokenProvider();
        const accessToken: string = await aadTokenProvider.getToken(
          `api://${this.config.clientId}`
        );

        const requestOptions: IHttpClientOptions = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        const response: HttpClientResponse = await this.context.httpClient.post(
          `${this.config.azureFunctionUrl}/api/redaction/cancel/${jobId}?code=${this.config.functionKey}`,
          HttpClient.configurations.v1,
          requestOptions
        );

        return response.ok;
      }
      return false;
    } catch (error) {
      console.error("Error canceling job:", error);
      return false;
    }
  }

  public async pollJobStatus(
    jobId: string,
    onStatusUpdate: (status: RedactionJobStatus) => void,
    pollingIntervalMs: number = 5000
  ): Promise<RedactionJobStatus> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const poll: () => Promise<void> = async () => {
        try {
          // Check timeout
          if (
            Date.now() - startTime >
            (this.config.timeoutMs || this.DEFAULT_TIMEOUT)
          ) {
            reject(new Error("Job polling timed out"));
            return;
          }

          const status = await this.getJobStatus(jobId);

          if (!status) {
            reject(new Error("Job not found"));
            return;
          }

          onStatusUpdate(status);

          if (status.status === "completed" || status.status === "failed") {
            resolve(status);
            return;
          }

          // Continue polling
          setTimeout(() => {
            // Explicitly ignore the returned promise
            poll().catch((e) => console.error("Polling error:", e));
          }, pollingIntervalMs);
        } catch (error) {
          reject(error);
        }
      };

      // Start polling
      poll().catch((e) => reject(e));
    });
  }

  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.azureFunctionUrl) {
      errors.push("Azure Function URL is required");
    } else {
      const url = this.config.azureFunctionUrl;
      if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
        errors.push("Azure Function URL is not valid");
      }
    }

    if (!this.config.clientId) {
      errors.push(
        "Azure AD Client ID/API scope is required for authentication"
      );
    } else if (
      typeof this.config.clientId !== "string" ||
      this.config.clientId.trim().length === 0
    ) {
      errors.push("Azure AD Client ID/API scope is not valid");
    }

    if (this.config.timeoutMs && this.config.timeoutMs < 10000) {
      errors.push("Timeout must be at least 10 seconds");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static getDefaultConfig(): Partial<IRedactionServiceConfig> {
    return {
      timeoutMs: 300000, // 5 minutes
      // azureFunctionUrl should be configured in tenant properties or web part properties
    };
  }

  // Map numeric enum values to string status
  private mapStatusEnumToString = (
    statusValue: any
  ): "pending" | "processing" | "completed" | "failed" => {
    // Handle both numeric and string values
    if (typeof statusValue === "number") {
      switch (statusValue) {
        case 0:
          return "pending";
        case 1:
          return "processing";
        case 2:
          return "completed";
        case 3:
          return "failed";
        case 4:
          return "failed"; // Cancelled maps to failed for UI purposes
        default:
          return "pending";
      }
    } else if (typeof statusValue === "string") {
      // Handle string values (case-insensitive)
      const lowerStatus = statusValue.toLowerCase();
      switch (lowerStatus) {
        case "pending":
          return "pending";
        case "processing":
          return "processing";
        case "completed":
          return "completed";
        case "failed":
          return "failed";
        case "cancelled":
          return "failed"; // Map cancelled to failed
        default:
          return "pending";
      }
    }
    return "pending"; // Default fallback
  };
}
