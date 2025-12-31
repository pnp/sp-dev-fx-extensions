import {
  HttpClient,
  HttpClientResponse,
  IHttpClientOptions,
  AadTokenProvider,
} from "@microsoft/sp-http";
import { ExtensionContext } from "@microsoft/sp-extension-base";
import {
  TranslationResult,
  TranslationJobStatus,
  DocumentInfo,
  TranslationOptions,
} from "../models/TranslationModels";

export interface ITranslationServiceConfig {
  azureFunctionUrl: string;
  clientId?: string; // The Application ID URI or API scope for the Azure Function
  functionKey?: string;
  timeoutMs?: number;
}

export class TranslationService {
  private context: ExtensionContext;
  private config: ITranslationServiceConfig;
  private readonly DEFAULT_TIMEOUT = 600000; // 10 minutes (translation can take longer)

  constructor(context: ExtensionContext, config: ITranslationServiceConfig) {
    this.context = context;
    this.config = {
      timeoutMs: this.DEFAULT_TIMEOUT,
      ...config,
    };

    console.log("TranslationService initialized:", {
      azureFunctionUrl: config.azureFunctionUrl,
      hasClientId: !!config.clientId,
      hasFunctionKey: !!config.functionKey,
      timeoutMs: this.config.timeoutMs,
    });
  }

  // Helper function to map server response to TranslationResult
  private mapServerResult(serverResponse: any): TranslationResult {
    // Handle both PascalCase (C#) and camelCase (JavaScript) property names
    const success =
      serverResponse.Success ??
      serverResponse.success ??
      serverResponse.isSuccess ??
      false;

    const jobId =
      serverResponse.JobId ??
      serverResponse.jobId ??
      serverResponse.id ??
      "";

    const message =
      serverResponse.Message ??
      serverResponse.message ??
      (success ? "Translation job started successfully" : "Translation job failed");

    const estimatedDocuments =
      serverResponse.EstimatedDocuments ??
      serverResponse.estimatedDocuments ??
      serverResponse.documentCount;

    const errors =
      serverResponse.Errors ??
      serverResponse.errors ??
      (success ? undefined : ["Unknown error occurred"]);

    console.log("Mapping server result:", {
      rawResponse: serverResponse,
      mapped: { success, jobId, message, estimatedDocuments, errors },
    });

    return {
      success,
      jobId,
      message,
      estimatedDocuments,
      errors,
    };
  }

  // Helper function to map server response to TranslationJobStatus
  private mapServerStatus(serverResponse: any): TranslationJobStatus {
    console.log("Raw server status response (full object):", JSON.stringify(serverResponse, null, 2));

    const rawStatus = serverResponse.Status ?? serverResponse.status ?? "pending";
    let mappedStatus = this.mapStatusEnumToString(rawStatus);

    const jobId = serverResponse.JobId ?? serverResponse.jobId ?? "";
    const progress = serverResponse.Progress ?? serverResponse.progress ?? 0;
    const message = serverResponse.Message ?? serverResponse.message;

    // Map completed documents with proper property mapping
    const rawCompletedDocs = serverResponse.CompletedDocuments ?? serverResponse.completedDocuments ?? [];
    const completedDocuments = rawCompletedDocs.map((doc: any) => ({
      originalName: decodeURIComponent(doc.OriginalName ?? doc.originalName ?? ""),
      targetLanguage: doc.TargetLanguage ?? doc.targetLanguage ?? "",
      translatedName: decodeURIComponent(doc.TranslatedName ?? doc.translatedName ?? ""),
      serverRelativeUrl: doc.ServerRelativeUrl ?? doc.serverRelativeUrl ?? "",
      characterCount: doc.CharacterCount ?? doc.characterCount ?? 0,
    }));

    // Map failed documents with proper property mapping
    const rawFailedDocs = serverResponse.FailedDocuments ?? serverResponse.failedDocuments ?? [];
    const failedDocuments = rawFailedDocs.map((doc: any) => ({
      name: decodeURIComponent(doc.Name ?? doc.name ?? doc.OriginalName ?? doc.originalName ?? ""),
      targetLanguage: doc.TargetLanguage ?? doc.targetLanguage ?? "",
      error: doc.Error ?? doc.error ?? doc.ErrorMessage ?? doc.errorMessage ?? "Unknown error",
    }));

    const totalDocuments =
      serverResponse.TotalDocuments ??
      serverResponse.totalDocuments ??
      serverResponse.documentCount ??
      0;

    const totalCharacterCharged =
      serverResponse.TotalCharacterCharged ??
      serverResponse.totalCharacterCharged ??
      serverResponse.charactersCharged ??
      0;

    const completedAt = serverResponse.CompletedAt ?? serverResponse.completedAt;

    // Additional validation: if status is "completed" but CompletedAt is null or no documents are completed,
    // the job is likely still running
    if (mappedStatus === "completed") {
      if (!completedAt || (completedDocuments.length === 0 && failedDocuments.length === 0 && totalDocuments > 0)) {
        console.warn("Status indicates completed but job appears incomplete - treating as running", {
          completedAt,
          completedDocsCount: completedDocuments.length,
          failedDocsCount: failedDocuments.length,
          totalDocuments,
        });
        mappedStatus = "running";
      }
    }

    console.log("Translation status mapping:", {
      rawStatus,
      mappedStatus,
      jobId,
      progress,
      message,
      completedAt,
      completedCount: completedDocuments.length,
      failedCount: failedDocuments.length,
      totalDocuments,
      totalCharacterCharged,
      completedDocs: completedDocuments,
      failedDocs: failedDocuments,
    });

    return {
      jobId,
      status: mappedStatus,
      progress,
      message,
      completedDocuments,
      failedDocuments,
      totalDocuments,
      totalCharacterCharged,
    };
  }

  public async startTranslationJob(
    documents: DocumentInfo[],
    options: TranslationOptions
  ): Promise<TranslationResult> {
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

      // Validate target languages
      if (!options.targetLanguages || options.targetLanguages.length === 0) {
        return {
          success: false,
          jobId: "",
          message: "At least one target language must be selected",
          errors: ["No target languages selected"],
        };
      }

      // Get AAD token for the configured client ID
      let accessToken: string;
      try {
        const aadTokenProvider: AadTokenProvider =
          await this.context.aadTokenProviderFactory.getTokenProvider();
        accessToken = await aadTokenProvider.getToken(
          `api://${this.config.clientId}`
        );

        if (!accessToken) {
          throw new Error("Failed to acquire access token - token is empty");
        }

        console.log("Successfully acquired AAD token for translation service");
      } catch (tokenError) {
        console.error("Failed to acquire AAD token:", tokenError);
        return {
          success: false,
          jobId: "",
          message: "Failed to acquire authentication token",
          errors: [
            tokenError instanceof Error ? tokenError.message : "Token acquisition failed",
            `Client ID: api://${this.config.clientId}`,
            "Verify Azure AD app registration and API permissions",
          ],
        };
      }

      // Filter and prepare documents for translation
      const supportedDocuments = documents.filter((doc) => doc.isSupported);

      if (supportedDocuments.length === 0) {
        return {
          success: false,
          jobId: "",
          message: "No supported documents to translate",
          errors: ["All documents are unsupported file types"],
        };
      }

      const requestBody = {
        siteUrl: this.context.pageContext.web.absoluteUrl,
        documents: supportedDocuments,
        options,
        context: {
          userId: this.context.pageContext.user.loginName,
          webId: this.context.pageContext.web.id.toString(),
          listId: this.context.pageContext.list?.id.toString(),
          tenantId: this.context.pageContext.aadInfo.tenantId.toString(),
        },
      };

      console.log("Translation request payload:", {
        documentCount: supportedDocuments.length,
        targetLanguages: options.targetLanguages,
        sourceLanguage: options.sourceLanguage,
      });

      const requestOptions: IHttpClientOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      };

      // Use HttpClient with manual Bearer token
      // Note: If using AAD authentication, the function key may not be needed
      const url = this.config.functionKey
        ? `${this.config.azureFunctionUrl}/api/translation/start?code=${this.config.functionKey}`
        : `${this.config.azureFunctionUrl}/api/translation/start`;

      const response: HttpClientResponse = await this.context.httpClient.post(
        url,
        HttpClient.configurations.v1,
        requestOptions
      );

      if (!response.ok) {
        let errorText = "";
        let errorDetails = "";

        try {
          errorText = await response.text();
          // Try to parse as JSON for more details
          try {
            const errorJson = JSON.parse(errorText);
            errorDetails = errorJson.message || errorJson.error || errorText;
          } catch {
            errorDetails = errorText;
          }
        } catch {
          errorDetails = response.statusText;
        }

        console.error("Azure Function error response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        // Handle specific error cases
        if (response.status === 403) {
          return {
            success: false,
            jobId: "",
            message: "Access denied. Check Azure AD app permissions and user access.",
            errors: [
              `HTTP 403: ${errorDetails}`,
              "Verify Function App authentication settings",
              "Ensure user has proper permissions",
            ],
          };
        } else if (response.status === 401) {
          return {
            success: false,
            jobId: "",
            message: "Authentication failed. Check Azure AD configuration.",
            errors: [
              `HTTP 401: ${errorDetails}`,
              "Verify Client ID is correct",
              "Check token validity",
            ],
          };
        } else if (response.status === 400) {
          return {
            success: false,
            jobId: "",
            message: "Invalid request. Check document format and settings.",
            errors: [`HTTP 400: ${errorDetails}`],
          };
        } else {
          return {
            success: false,
            jobId: "",
            message: `Translation request failed with status ${response.status}`,
            errors: [
              `HTTP ${response.status}: ${errorDetails}`,
              response.statusText,
            ],
          };
        }
      }

      let serverResponse;
      try {
        serverResponse = await response.json();
        console.log("Raw Azure Function response:", serverResponse);
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        return {
          success: false,
          jobId: "",
          message: "Invalid response from translation service",
          errors: ["Response was not valid JSON"],
        };
      }

      const result = this.mapServerResult(serverResponse);
      console.log("Mapped translation result:", result);

      return result;
    } catch (error) {
      console.error("Error starting translation job:", error);
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
  ): Promise<TranslationJobStatus | undefined> {
    try {
      if (this.config.clientId && this.config.azureFunctionUrl) {
        // Get AAD token for the configured client ID
        let accessToken: string;
        try {
          const aadTokenProvider: AadTokenProvider =
            await this.context.aadTokenProviderFactory.getTokenProvider();
          accessToken = await aadTokenProvider.getToken(
            `api://${this.config.clientId}`
          );

          if (!accessToken) {
            console.error("Failed to acquire access token for status check");
            return undefined;
          }
        } catch (tokenError) {
          console.error("Error acquiring AAD token for status check:", tokenError);
          return undefined;
        }

        const requestOptions: IHttpClientOptions = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        };

        const url = this.config.functionKey
          ? `${this.config.azureFunctionUrl}/api/translation/status/${jobId}?code=${this.config.functionKey}`
          : `${this.config.azureFunctionUrl}/api/translation/status/${jobId}`;

        const response: HttpClientResponse = await this.context.httpClient.get(
          url,
          HttpClient.configurations.v1,
          requestOptions
        );

        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`Translation job ${jobId} not found (404)`);
            return undefined; // Job not found
          }

          const errorText = await response.text().catch(() => "");
          console.error("Status check failed:", {
            status: response.status,
            jobId,
            error: errorText,
          });

          // Return undefined for other errors to allow retry logic
          return undefined;
        }

        let serverResponse;
        try {
          serverResponse = await response.json();
          console.log("Raw server translation status response:", serverResponse);
        } catch (parseError) {
          console.error("Failed to parse status response JSON:", parseError);
          return undefined;
        }

        const status = this.mapServerStatus(serverResponse);
        console.log("Mapped translation status:", status);

        return status;
      }
    } catch (error) {
      console.error("Error checking translation job status:", error);
      return undefined;
    }
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    try {
      if (this.config.clientId && this.config.azureFunctionUrl) {
        // Get AAD token for the configured client
        let accessToken: string;
        try {
          const aadTokenProvider: AadTokenProvider =
            await this.context.aadTokenProviderFactory.getTokenProvider();
          accessToken = await aadTokenProvider.getToken(
            `api://${this.config.clientId}`
          );

          if (!accessToken) {
            console.error("Failed to acquire access token for cancel request");
            return false;
          }
        } catch (tokenError) {
          console.error("Error acquiring AAD token for cancel request:", tokenError);
          return false;
        }

        const requestOptions: IHttpClientOptions = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        const url = this.config.functionKey
          ? `${this.config.azureFunctionUrl}/api/translation/cancel/${jobId}?code=${this.config.functionKey}`
          : `${this.config.azureFunctionUrl}/api/translation/cancel/${jobId}`;

        const response: HttpClientResponse = await this.context.httpClient.post(
          url,
          HttpClient.configurations.v1,
          requestOptions
        );

        return response.ok;
      }
      return false;
    } catch (error) {
      console.error("Error canceling translation job:", error);
      return false;
    }
  }

  public async pollJobStatus(
    jobId: string,
    onStatusUpdate: (status: TranslationJobStatus) => void,
    pollingIntervalMs: number = 3000 // Poll every 3 seconds
  ): Promise<TranslationJobStatus> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let consecutiveFailures = 0;
      const MAX_CONSECUTIVE_FAILURES = 3;

      const poll: () => Promise<void> = async () => {
        try {
          // Check timeout
          if (
            Date.now() - startTime >
            (this.config.timeoutMs || this.DEFAULT_TIMEOUT)
          ) {
            console.error("Translation job polling timed out", {
              jobId,
              elapsedMs: Date.now() - startTime,
              timeoutMs: this.config.timeoutMs || this.DEFAULT_TIMEOUT,
            });
            reject(new Error("Translation job polling timed out"));
            return;
          }

          const status = await this.getJobStatus(jobId);

          if (!status) {
            consecutiveFailures++;
            console.warn(`Failed to get job status (attempt ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`, {
              jobId,
              elapsedMs: Date.now() - startTime,
            });

            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
              reject(new Error(`Translation job status check failed after ${MAX_CONSECUTIVE_FAILURES} attempts`));
              return;
            }

            // Retry after interval
            setTimeout(() => {
              poll().catch((e) => console.error("Polling error:", e));
            }, pollingIntervalMs);
            return;
          }

          // Reset failure counter on success
          consecutiveFailures = 0;

          console.log("Job status update:", {
            jobId,
            status: status.status,
            progress: status.progress,
            completed: status.completedDocuments.length,
            failed: status.failedDocuments.length,
            total: status.totalDocuments,
            elapsedMs: Date.now() - startTime,
          });

          onStatusUpdate(status);

          if (
            status.status === "completed" ||
            status.status === "failed" ||
            status.status === "cancelled"
          ) {
            console.log("Translation job reached terminal state:", {
              jobId,
              finalStatus: status.status,
              completed: status.completedDocuments.length,
              failed: status.failedDocuments.length,
              totalCharges: status.totalCharacterCharged,
              elapsedMs: Date.now() - startTime,
            });
            resolve(status);
            return;
          }

          // Continue polling
          setTimeout(() => {
            // Explicitly ignore the returned promise
            poll().catch((e) => console.error("Polling error:", e));
          }, pollingIntervalMs);
        } catch (error) {
          console.error("Unexpected error during polling:", error);
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

  public static getDefaultConfig(): Partial<ITranslationServiceConfig> {
    return {
      timeoutMs: 600000, // 10 minutes for translation jobs
    };
  }

  // Map numeric enum values to string status
  // Backend enum: Pending(0), Running(1), Processing(2), Completed(3), Failed(4), Cancelled(5)
  private mapStatusEnumToString = (
    statusValue: unknown
  ): "pending" | "running" | "completed" | "failed" | "cancelled" => {
    // Handle both numeric and string values
    if (typeof statusValue === "number") {
      switch (statusValue) {
        case 0:
          return "pending";
        case 1:
        case 2: // Processing - still running
          return "running";
        case 3:
          return "completed";
        case 4:
          return "failed";
        case 5:
          return "cancelled";
        default:
          console.warn(`Unknown numeric status value: ${statusValue}, defaulting to running`);
          return "running";
      }
    } else if (typeof statusValue === "string") {
      // Handle string values (case-insensitive)
      const lowerStatus = statusValue.toLowerCase().trim();
      switch (lowerStatus) {
        case "pending":
        case "notstarted":
        case "queued":
          return "pending";
        case "running":
        case "processing":
        case "inprogress":
          return "running";
        case "completed":
        case "succeeded":
        case "success":
          return "completed";
        case "failed":
        case "validationfailed":
        case "error":
          return "failed";
        case "cancelled":
        case "cancelling":
        case "canceled":
        case "canceling":
          return "cancelled";
        default:
          console.warn(`Unknown string status value: "${statusValue}", defaulting to running`);
          return "running";
      }
    }

    console.warn(`Unknown status value type: ${typeof statusValue}, value: ${statusValue}`);
    return "running"; // Default fallback - safer to keep polling
  };
}
