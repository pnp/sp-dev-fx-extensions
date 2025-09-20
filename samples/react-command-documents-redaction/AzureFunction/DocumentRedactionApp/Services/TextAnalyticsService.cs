using Azure.AI.TextAnalytics;
using Azure;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using DocumentRedactionApp.Models;
using DocumentRedactionApp.Options;

namespace DocumentRedactionApp.Services;

public interface ITextAnalyticsService
{
	/// <summary>
	/// Redacts PII entities from the provided text.
	/// </summary>
	/// <param name="content">The text content to redact PII from.</param>
	/// <param name="maskType">Optional mask type (e.g., "character", "tag").</param>
	/// <param name="maskCharacter">Optional character to use for masking when maskType is "character".</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>The redacted text with PII entities masked.</returns>
	Task<string> RedactPiiFromTextAsync(
		string content,
		string? maskType = null,
		string? maskCharacter = null,
		List<string> categories = null,
		CancellationToken cancellationToken = default
	);

	/// <summary>
	/// Initiates PII redaction for a document stored in blob storage.
	/// </summary>
	/// <param name="documentPath">The path to the source document in blob storage.</param>
	/// <param name="displayName">Display name for the redaction job.</param>
	/// <param name="maskType">Optional mask type (e.g., "character", "tag").</param>
	/// <param name="maskCharacter">Optional character to use for masking when maskType is "character".</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>The job ID for tracking the redaction operation.</returns>
	Task<string> RedactPiiFromBlobDocumentAsync(
		string documentPath,
		string displayName,
		string? maskType = null,
		string? maskCharacter = null,
		List<string> categories = null,
		CancellationToken cancellationToken = default
	);

	/// <summary>
	/// Initiates PII redaction for multiple documents stored in blob storage.
	/// </summary>
	/// <param name="documentPaths">The paths to the source documents in blob storage.</param>
	/// <param name="displayName">Display name for the redaction job.</param>
	/// <param name="maskType">Optional mask type (e.g., "character", "tag").</param>
	/// <param name="maskCharacter">Optional character to use for masking when maskType is "character".</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>The job ID for tracking the redaction operation.</returns>
	Task<string> RedactPiiFromBlobDocumentsBatchAsync(
		List<string> documentPaths,
		string displayName,
		string? maskType = null,
		string? maskCharacter = null,
		List<string> categories = null,
		CancellationToken cancellationToken = default
	);

	/// <summary>
	/// Gets the status of a document redaction job.
	/// </summary>
	/// <param name="jobId">The job ID returned from RedactPiiFromBlobDocumentAsync.</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>The job status and results.</returns>
	Task<DocumentRedactionJobStatus> GetRedactionJobStatusAsync(
		string jobId,
		CancellationToken cancellationToken = default
	);
}

public class TextAnalyticsService : ITextAnalyticsService
{
	private static readonly JsonSerializerOptions JsonOptions = new()
	{
		PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
	};

	private readonly ILogger<TextAnalyticsService> _logger;
	private readonly LanguageServiceOptions _options;
	private readonly StorageOptions _storageOptions;
	private readonly TextAnalyticsClient _client;
	private readonly HttpClient _httpClient;
	private readonly string _baseUrl;

	public TextAnalyticsService(
		ILogger<TextAnalyticsService> logger,
		IOptions<LanguageServiceOptions> options,
		IOptions<StorageOptions> storageOptions,
		IHttpClientFactory httpClientFactory
	)
	{
		this._logger = logger ?? throw new ArgumentNullException(nameof(logger));
		this._options = options?.Value ?? throw new ArgumentNullException(nameof(options));
		this._storageOptions = storageOptions?.Value
			?? throw new ArgumentNullException(nameof(storageOptions));
		if (string.IsNullOrWhiteSpace(this._options.Endpoint))
		{
			throw new InvalidOperationException("Language service Endpoint is not configured");
		}

		if (string.IsNullOrWhiteSpace(this._options.ApiKey))
		{
			throw new InvalidOperationException("Language service API Key is not configured");
		}

		var endpoint = new Uri(this._options.Endpoint);
		var credential = new AzureKeyCredential(this._options.ApiKey);
		this._client = new TextAnalyticsClient(endpoint, credential);

		this._httpClient = httpClientFactory.CreateClient();
		this._httpClient.DefaultRequestHeaders.Add(
			"Ocp-Apim-Subscription-Key",
			this._options.ApiKey
		);
		this._httpClient.Timeout = TimeSpan.FromSeconds(this._options.TimeoutSeconds);

		this._baseUrl = $"{this._options.Endpoint.TrimEnd('/')}/language";

		this._logger.LogInformation(
			"TextAnalyticsService initialized with endpoint: {Endpoint}",
			this._options.Endpoint
		);
	}

	/// <summary>
	/// Redacts PII entities from the provided text.
	/// </summary>
	/// <param name="content">The text content to redact PII from.</param>
	/// <param name="maskType">Optional mask type (e.g., "character", "tag").</param>
	/// <param name="maskCharacter">Optional character to use for masking when maskType is "character".</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>The redacted text with PII entities masked.</returns>
	public async Task<string> RedactPiiFromTextAsync(
		string content,
		string? maskType = null,
		string? maskCharacter = null,
		List<string>? categories = null,
		CancellationToken cancellationToken = default
	)
	{
		if (string.IsNullOrWhiteSpace(content))
		{
			return string.Empty;
		}

		try
		{
			this._logger.LogDebug(
				"Redacting PII from text content of length: {Length}",
				content.Length
			);

			Response<PiiEntityCollection> response = await this
				._client.RecognizePiiEntitiesAsync(content, cancellationToken: cancellationToken)
				.ConfigureAwait(false);

			PiiEntityCollection entities = response.Value;
			this._logger.LogDebug("Found {Count} PII entities in text", entities.Count);

			return entities.RedactedText;
		}
		catch (RequestFailedException ex)
		{
			this._logger.LogError(
				ex,
				"Azure Language Service request failed: {ErrorCode} - {Message}",
				ex.ErrorCode,
				ex.Message
			);
			throw new InvalidOperationException(
				$"Failed to redact PII from text: {ex.Message}",
				ex
			);
		}
		catch (Exception ex)
		{
			this._logger.LogError(ex, "Unexpected error occurred while redacting PII from text");
			throw;
		}
	}

	/// <summary>
	/// Initiates PII redaction for a document stored in blob storage.
	/// </summary>
	/// <param name="documentPath">The path to the source document in blob storage.</param>
	/// <param name="displayName">Display name for the redaction job.</param>
	/// <param name="maskType">Optional mask type (e.g., "character", "tag").</param>
	/// <param name="maskCharacter">Optional character to use for masking when maskType is "character".</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>The job ID for tracking the redaction operation.</returns>
	public async Task<string> RedactPiiFromBlobDocumentAsync(
		string documentPath,
		string displayName,
		string? maskType = null,
		string? maskCharacter = null,
		List<string>? categories = null,
		CancellationToken cancellationToken = default
	)
	{
		if (string.IsNullOrWhiteSpace(documentPath))
		{
			throw new ArgumentException(
				"Document path cannot be null or empty",
				nameof(documentPath)
			);
		}

		// Extract hostname and documentId from documentPath and construct targetPath
		string targetPath;
		try
		{
			var documentUri = new Uri(documentPath);
			var baseUrl = $"{documentUri.Scheme}://{documentUri.Host}";

			// Extract documentId from the source URL: chatmemory/chatmemory/{documentId}/filename
			var pathSegments = documentUri.AbsolutePath.Split(
				'/',
				StringSplitOptions.RemoveEmptyEntries
			);
			string documentId = string.Empty;

			// Look for the pattern: chatmemory/chatmemory/{documentId}
			for (int i = 0; i < pathSegments.Length - 1; i++)
			{
				if (
					pathSegments[i] == "chatmemory"
					&& i + 1 < pathSegments.Length
					&& pathSegments[i + 1] == "chatmemory"
					&& i + 2 < pathSegments.Length
				)
				{
					documentId = pathSegments[i + 2];
					break;
				}
			}

			if (!string.IsNullOrEmpty(documentId))
			{
				targetPath = $"{baseUrl}/{this._storageOptions.TempContainer}/{documentId}";
			}
			else
			{
				// Fallback to container only if documentId extraction fails
				targetPath = $"{baseUrl}/{this._storageOptions.TempContainer}";
			}

			this._logger.LogDebug(
				"Constructed target path: {TargetPath} from document path: {DocumentPath} (extracted documentId: {DocumentId})",
				targetPath,
				documentPath,
				documentId
			);
		}
		catch (UriFormatException ex)
		{
			this._logger.LogError(ex, "Invalid document path format: {DocumentPath}", documentPath);
			throw new ArgumentException(
				$"Invalid document path format: {documentPath}",
				nameof(documentPath),
				ex
			);
		}

		if (string.IsNullOrWhiteSpace(displayName))
		{
			throw new ArgumentException(
				"Display name cannot be null or empty",
				nameof(displayName)
			);
		}

		try
		{
			this._logger.LogInformation(
				"Starting PII redaction job for document: {DocumentPath}",
				documentPath
			);

			var payload = this.GetBlobDocumentRedactionPayload(
				displayName,
				documentPath,
				targetPath,
				maskType,
				maskCharacter,
				categories
			);
			string jsonPayload = JsonSerializer.Serialize(payload, JsonOptions);

			var requestUri =
				$"{this._baseUrl}/analyze-documents/jobs?api-version={this._options.ApiVersion}";
			using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

			var response = await this
				._httpClient.PostAsync(requestUri, content, cancellationToken)
				.ConfigureAwait(false);

			if (response.IsSuccessStatusCode)
			{
				// Extract job ID from operation-location header
				if (
					response.Headers.TryGetValues(
						"operation-location",
						out var operationLocationValues
					)
				)
				{
					var operationLocation = operationLocationValues.FirstOrDefault();
					if (!string.IsNullOrEmpty(operationLocation))
					{
						// Extract job ID from URL: .../jobs/{jobId}?...
						var uri = new Uri(operationLocation);
						var pathSegments = uri.Segments;
						var jobsIndex = Array.FindIndex(
							pathSegments,
							s => s.TrimEnd('/').Equals("jobs", StringComparison.OrdinalIgnoreCase)
						);

						if (jobsIndex >= 0 && jobsIndex + 1 < pathSegments.Length)
						{
							var jobId = pathSegments[jobsIndex + 1].TrimEnd('/');
							this._logger.LogInformation(
								"PII redaction job submitted successfully with ID: {JobId}",
								jobId
							);
							return jobId;
						}
					}
				}

				this._logger.LogWarning(
					"Job submitted but no operation-location header or job ID found"
				);
				return string.Empty;
			}

			string errorContent = await response
				.Content.ReadAsStringAsync(cancellationToken)
				.ConfigureAwait(false);
			this._logger.LogError(
				"Failed to submit PII redaction job. Status: {StatusCode}, Error: {Error}",
				response.StatusCode,
				errorContent
			);
			throw new InvalidOperationException(
				$"Failed to submit PII redaction job: {response.StatusCode} - {errorContent}"
			);
		}
		catch (HttpRequestException ex)
		{
			this._logger.LogError(ex, "HTTP request failed while submitting PII redaction job");
			throw new InvalidOperationException(
				"Failed to submit PII redaction job due to network error",
				ex
			);
		}
		catch (JsonException ex)
		{
			this._logger.LogError(ex, "Failed to parse response from PII redaction job submission");
			throw new InvalidOperationException(
				"Failed to parse response from language service",
				ex
			);
		}
		catch (Exception ex)
		{
			this._logger.LogError(
				ex,
				"Unexpected error occurred while submitting PII redaction job"
			);
			throw;
		}
	}

	/// <summary>
	/// Initiates PII redaction for multiple documents stored in blob storage.
	/// </summary>
	/// <param name="documentPaths">The paths to the source documents in blob storage.</param>
	/// <param name="displayName">Display name for the redaction job.</param>
	/// <param name="maskType">Optional mask type (e.g., "character", "tag").</param>
	/// <param name="maskCharacter">Optional character to use for masking when maskType is "character".</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>The job ID for tracking the redaction operation.</returns>
	public async Task<string> RedactPiiFromBlobDocumentsBatchAsync(
		List<string> documentPaths,
		string displayName,
		string? maskType = null,
		string? maskCharacter = null,
		List<string>? categories = null,
		CancellationToken cancellationToken = default
	)
	{
		if (documentPaths == null || documentPaths.Count == 0)
		{
			throw new ArgumentException(
				"Document paths cannot be null or empty",
				nameof(documentPaths)
			);
		}

		if (string.IsNullOrWhiteSpace(displayName))
		{
			throw new ArgumentException(
				"Display name cannot be null or empty",
				nameof(displayName)
			);
		}

		try
		{
			this._logger.LogInformation(
				"Starting batch PII redaction job for {DocumentCount} documents",
				documentPaths.Count
			);

			var payload = this.GetBatchBlobDocumentRedactionPayload(
				displayName,
				documentPaths,
				maskType,
				maskCharacter,
				categories
			);
			string jsonPayload = JsonSerializer.Serialize(payload, JsonOptions);

			var requestUri =
				$"{this._baseUrl}/analyze-documents/jobs?api-version={this._options.ApiVersion}";
			using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

			var response = await this
				._httpClient.PostAsync(requestUri, content, cancellationToken)
				.ConfigureAwait(false);

			if (response.IsSuccessStatusCode)
			{
				// Extract job ID from operation-location header
				if (
					response.Headers.TryGetValues(
						"operation-location",
						out var operationLocationValues
					)
				)
				{
					var operationLocation = operationLocationValues.FirstOrDefault();
					if (!string.IsNullOrEmpty(operationLocation))
					{
						// Extract job ID from URL: .../jobs/{jobId}?...
						var uri = new Uri(operationLocation);
						var pathSegments = uri.Segments;
						var jobsIndex = Array.FindIndex(
							pathSegments,
							s => s.TrimEnd('/').Equals("jobs", StringComparison.OrdinalIgnoreCase)
						);

						if (jobsIndex >= 0 && jobsIndex + 1 < pathSegments.Length)
						{
							var jobId = pathSegments[jobsIndex + 1].TrimEnd('/');
							this._logger.LogInformation(
								"Batch PII redaction job submitted successfully with ID: {JobId}",
								jobId
							);
							return jobId;
						}
					}
				}

				this._logger.LogWarning(
					"Batch job submitted but no operation-location header or job ID found"
				);
				return string.Empty;
			}

			string errorContent = await response
				.Content.ReadAsStringAsync(cancellationToken)
				.ConfigureAwait(false);
			this._logger.LogError(
				"Failed to submit batch PII redaction job. Status: {StatusCode}, Error: {Error}",
				response.StatusCode,
				errorContent
			);
			throw new InvalidOperationException(
				$"Failed to submit batch PII redaction job: {response.StatusCode} - {errorContent}"
			);
		}
		catch (HttpRequestException ex)
		{
			this._logger.LogError(
				ex,
				"HTTP request failed while submitting batch PII redaction job"
			);
			throw new InvalidOperationException(
				"Failed to submit batch PII redaction job due to network error",
				ex
			);
		}
		catch (JsonException ex)
		{
			this._logger.LogError(
				ex,
				"Failed to parse response from batch PII redaction job submission"
			);
			throw new InvalidOperationException(
				"Failed to parse response from language service",
				ex
			);
		}
		catch (Exception ex)
		{
			this._logger.LogError(
				ex,
				"Unexpected error occurred while submitting batch PII redaction job"
			);
			throw;
		}
	}

	/// <summary>
	/// Gets the status of a document redaction job.
	/// </summary>
	/// <param name="jobId">The job ID returned from RedactPiiFromBlobDocumentAsync.</param>
	/// <param name="cancellationToken">Cancellation token.</param>
	/// <returns>The job status and results.</returns>
	public async Task<DocumentRedactionJobStatus> GetRedactionJobStatusAsync(
		string jobId,
		CancellationToken cancellationToken = default
	)
	{
		if (string.IsNullOrWhiteSpace(jobId))
		{
			throw new ArgumentException("Job ID cannot be null or empty", nameof(jobId));
		}

		try
		{
			this._logger.LogDebug("Checking status of PII redaction job: {JobId}", jobId);

			var requestUri =
				$"{this._baseUrl}/analyze-documents/jobs/{jobId}?api-version={this._options.ApiVersion}";
			var response = await this
				._httpClient.GetAsync(requestUri, cancellationToken)
				.ConfigureAwait(false);

			if (response.IsSuccessStatusCode)
			{
				string responseContent = await response
					.Content.ReadAsStringAsync(cancellationToken)
					.ConfigureAwait(false);

				this._logger.LogDebug(
					"Raw response for job {JobId}: {ResponseContent}",
					jobId,
					responseContent
				);

				var responseData = JsonSerializer.Deserialize<JsonElement>(responseContent);

				var jobStatus = new DocumentRedactionJobStatus
				{
					JobId = jobId,
					Status = responseData.GetProperty("status").GetString() ?? "Unknown",
					CreatedDateTime = responseData.GetProperty("createdDateTime").GetDateTime(),
					LastUpdatedDateTime = responseData
						.GetProperty("lastUpdatedDateTime")
						.GetDateTime(),
				};

				if (responseData.TryGetProperty("expirationDateTime", out var expElement))
				{
					jobStatus.ExpirationDateTime = expElement.GetString();
				}

				// Extract task summary information
				if (responseData.TryGetProperty("tasks", out var tasksElement))
				{
					if (tasksElement.TryGetProperty("completed", out var completedElement))
					{
						jobStatus.TasksCompleted = completedElement.GetInt32();
					}

					if (tasksElement.TryGetProperty("failed", out var failedElement))
					{
						jobStatus.TasksFailed = failedElement.GetInt32();
					}

					if (tasksElement.TryGetProperty("inProgress", out var inProgressElement))
					{
						jobStatus.TasksInProgress = inProgressElement.GetInt32();
					}

					if (tasksElement.TryGetProperty("total", out var totalElement))
					{
						jobStatus.TasksTotal = totalElement.GetInt32();
					}

					this._logger.LogDebug(
						"Task summary for job {JobId}: Completed={Completed}, Failed={Failed}, InProgress={InProgress}, Total={Total}",
						jobId,
						jobStatus.TasksCompleted,
						jobStatus.TasksFailed,
						jobStatus.TasksInProgress,
						jobStatus.TasksTotal
					);
				}

				if (
					responseData.TryGetProperty("tasks", out var tasksElementForItems)
					&& tasksElementForItems.TryGetProperty("items", out var itemsElement)
					&& itemsElement.ValueKind == JsonValueKind.Array
				)
				{
					foreach (var item in itemsElement.EnumerateArray())
					{
						if (
							item.TryGetProperty("results", out var resultsElement)
							&& resultsElement.TryGetProperty("documents", out var documentsElement)
							&& documentsElement.ValueKind == JsonValueKind.Array
						)
						{
							foreach (var document in documentsElement.EnumerateArray())
							{
								var result = new DocumentRedactionResult
								{
									DocumentId =
										document.GetProperty("id").GetString() ?? string.Empty,
									Status = item.GetProperty("status").GetString() ?? "Unknown",
								};

								// Extract redacted document location from targets array
								if (
									document.TryGetProperty("targets", out var targetsElement)
									&& targetsElement.ValueKind == JsonValueKind.Array
								)
								{
									foreach (var target in targetsElement.EnumerateArray())
									{
										if (
											target.TryGetProperty(
												"location",
												out var locationElement
											)
										)
										{
											var location = locationElement.GetString();
											// Look for the redacted document (not the .json result file)
											if (
												!string.IsNullOrEmpty(location)
												&& !location.EndsWith(
													".json",
													StringComparison.OrdinalIgnoreCase
												)
											)
											{
												result.RedactedDocumentLocation = location;
												break;
											}
										}
									}
								}

								jobStatus.Results.Add(result);

								this._logger.LogDebug(
									"Found document result for job {JobId}: DocumentId={DocumentId}, Status={Status}, RedactedLocation={RedactedLocation}",
									jobId,
									result.DocumentId,
									result.Status,
									result.RedactedDocumentLocation ?? "None"
								);
							}
						}

						if (
							item.TryGetProperty("results", out var itemResultsElement)
							&& itemResultsElement.TryGetProperty("errors", out var errorsElement)
							&& errorsElement.ValueKind == JsonValueKind.Array
						)
						{
							foreach (var error in errorsElement.EnumerateArray())
							{
								jobStatus.Errors.Add(
									new DocumentRedactionError
									{
										Code =
											error.GetProperty("code").GetString() ?? string.Empty,
										Message =
											error.GetProperty("message").GetString()
											?? string.Empty,
										Target = error.TryGetProperty(
											"target",
											out var targetElement
										)
											? targetElement.GetString()
											: null,
									}
								);
							}
						}
					}
				}

				// Also check for top-level errors array
				if (
					responseData.TryGetProperty("errors", out var topLevelErrorsElement)
					&& topLevelErrorsElement.ValueKind == JsonValueKind.Array
				)
				{
					foreach (var error in topLevelErrorsElement.EnumerateArray())
					{
						jobStatus.Errors.Add(
							new DocumentRedactionError
							{
								Code = error.GetProperty("code").GetString() ?? string.Empty,
								Message = error.GetProperty("message").GetString() ?? string.Empty,
								Target = error.TryGetProperty("target", out var targetElement)
									? targetElement.GetString()
									: null,
							}
						);
					}
				}

				this._logger.LogDebug(
					"Job {JobId} status: {Status}, found {DocumentCount} documents and {ErrorCount} errors. Tasks: {Completed}/{Total} completed, {Failed} failed, {InProgress} in progress",
					jobId,
					jobStatus.Status,
					jobStatus.Results.Count,
					jobStatus.Errors.Count,
					jobStatus.TasksCompleted,
					jobStatus.TasksTotal,
					jobStatus.TasksFailed,
					jobStatus.TasksInProgress
				);
				return jobStatus;
			}

			string errorContent = await response
				.Content.ReadAsStringAsync(cancellationToken)
				.ConfigureAwait(false);
			this._logger.LogError(
				"Failed to get job status. Status: {StatusCode}, Error: {Error}",
				response.StatusCode,
				errorContent
			);
			throw new InvalidOperationException(
				$"Failed to get job status: {response.StatusCode} - {errorContent}"
			);
		}
		catch (HttpRequestException ex)
		{
			this._logger.LogError(ex, "HTTP request failed while getting job status");
			throw new InvalidOperationException(
				"Failed to get job status due to network error",
				ex
			);
		}
		catch (JsonException ex)
		{
			this._logger.LogError(ex, "Failed to parse job status response");
			throw new InvalidOperationException("Failed to parse job status response", ex);
		}
		catch (Exception ex)
		{
			this._logger.LogError(ex, "Unexpected error occurred while getting job status");
			throw;
		}
	}

	/// <summary>
	/// Creates the payload for blob document redaction requests.
	/// </summary>
	/// <param name="displayName">Display name for the redaction job.</param>
	/// <param name="sourceBlobPath">Path to the source blob document.</param>
	/// <param name="targetContainerPath">Path to the target container for redacted document.</param>
	/// <param name="maskType">Optional mask type (e.g., "character", "tag").</param>
	/// <param name="maskCharacter">Optional character to use for masking when maskType is "character".</param>
	/// <param name="language">Language of the document (optional).</param>
	/// <returns>Payload object for the redaction request.</returns>
	private object GetBlobDocumentRedactionPayload(
		string displayName,
		string sourceBlobPath,
		string targetContainerPath,
		string? maskType = null,
		string? maskCharacter = null,
		List<string> categories = null,
		string? language = null
	)
	{
		language ??= this._options.DefaultLanguage;

		var redactionPolicy = new
		{
			policyKind = maskType ?? this._options.RedactionPolicy,
			redactionCharacter = maskCharacter ?? this._options.RedactionCharacter,
		};

		object parameters;
		if (categories != null && categories.Count > 0)
		{
			parameters = new
			{
				redactionPolicy,
				piiCategories = categories,
				excludeExtractionData = this._options.ExcludeExtractionData,
			};
		}
		else if (this._options.PiiCategories.Count > 0)
		{
			parameters = new
			{
				redactionPolicy,
				piiCategories = this._options.PiiCategories.ToArray(),
				excludeExtractionData = this._options.ExcludeExtractionData,
			};
		}
		else
		{
			parameters = new
			{
				redactionPolicy,
				excludeExtractionData = this._options.ExcludeExtractionData,
			};
		}

		return new
		{
			displayName,
			analysisInput = new
			{
				documents = new[]
				{
					new
					{
						language,
						id = $"{Guid.NewGuid()}",
						source = new { location = sourceBlobPath },
						target = new { location = targetContainerPath },
					},
				},
			},
			tasks = new[]
			{
				new
				{
					kind = "PiiEntityRecognition",
					taskName = $"{Guid.NewGuid()}",
					parameters,
				},
			},
		};
	}

	private object GetBatchBlobDocumentRedactionPayload(
		string displayName,
		List<string> sourceBlobPaths,
		string? maskType = null,
		string? maskCharacter = null,
		List<string>? categories = null,
		string? language = null
	)
	{
		language ??= this._options.DefaultLanguage;

		var redactionPolicy = new
		{
			policyKind = maskType ?? this._options.RedactionPolicy,
			redactionCharacter = maskCharacter ?? this._options.RedactionCharacter,
		};

		object parameters;
		if (categories != null && categories.Count > 0)
		{
			parameters = new
			{
				redactionPolicy,
				piiCategories = categories,
				excludeExtractionData = this._options.ExcludeExtractionData,
			};
		}
		else if (this._options.PiiCategories.Count > 0)
		{
			parameters = new
			{
				redactionPolicy,
				piiCategories = this._options.PiiCategories.ToArray(),
				excludeExtractionData = this._options.ExcludeExtractionData,
			};
		}
		else
		{
			parameters = new
			{
				redactionPolicy,
				excludeExtractionData = this._options.ExcludeExtractionData,
			};
		}

		// Create documents array for batch processing
		var guid = Guid.NewGuid();
		var documents = sourceBlobPaths
			.Select(sourceBlobPath =>
			{
				// Extract hostname and documentId from source path to construct predictable targetPath
				string targetPath;
				try
				{
					var documentUri = new Uri(sourceBlobPath);
					var baseUrl = $"{documentUri.Scheme}://{documentUri.Host}";

					targetPath =
						$"{baseUrl}/{this._storageOptions.TempContainer}/{guid}";
				}
				catch (UriFormatException)
				{
					// If URI parsing fails, use a fallback target path with unique identifier
					var uniqueId = Guid.NewGuid().ToString("N")[..8];
					targetPath =
						$"https://defaulthost/{this._storageOptions.TempContainer}/{uniqueId}";
				}

				return new
				{
					language,
					id = $"{Guid.NewGuid()}",
					source = new { location = sourceBlobPath },
					target = new { location = targetPath },
				};
			})
			.ToArray();

		return new
		{
			displayName,
			analysisInput = new { documents },
			tasks = new[]
			{
				new
				{
					kind = "PiiEntityRecognition",
					taskName = $"{Guid.NewGuid()}",
					parameters,
				},
			},
		};
	}
}