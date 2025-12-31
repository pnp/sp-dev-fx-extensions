using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Azure.Messaging.ServiceBus;
using DocumentTranslationApp.Models;
using DocumentTranslationApp.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DocumentTranslationApp.Services;

public interface ITranslationService
{
    Task<TranslationResult> StartTranslationJobAsync(TranslationRequest request);
    Task ProcessTranslationJobAsync(ProcessingJob job);
    Task<string> SubmitBatchTranslationJobAsync(
        List<string> sourceBlobUrls,
        string targetContainerPath,
        List<string> targetLanguages,
        string? sourceLanguage = null,
        string displayName = ""
    );
    Task<DocumentTranslationJobStatus> GetTranslationJobStatusAsync(string jobId, CancellationToken cancellationToken = default);
}

public class TranslationService : ITranslationService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly ILogger<TranslationService> _logger;
    private readonly IBlobStorageService _blobStorageService;
    private readonly ISharePointService _sharePointService;
    private readonly IJobStatusService _jobStatusService;
    private readonly DocumentTranslationOptions _translationOptions;
    private readonly StorageOptions _storageOptions;
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly ServiceBusSender _serviceBusSender;

    public TranslationService(
        ILogger<TranslationService> logger,
        IBlobStorageService blobStorageService,
        ISharePointService sharePointService,
        IJobStatusService jobStatusService,
        IOptions<DocumentTranslationOptions> translationOptions,
        IOptions<StorageOptions> storageOptions,
        IHttpClientFactory httpClientFactory,
        ServiceBusSender serviceBusSender
    )
    {
        _logger = logger;
        _blobStorageService = blobStorageService;
        _sharePointService = sharePointService;
        _jobStatusService = jobStatusService;
        _translationOptions = translationOptions.Value;
        _storageOptions = storageOptions.Value;
        _serviceBusSender = serviceBusSender;

        _httpClient = httpClientFactory.CreateClient();
        _httpClient.DefaultRequestHeaders.Add(
            "Ocp-Apim-Subscription-Key",
            _translationOptions.SubscriptionKey
        );
        _httpClient.Timeout = TimeSpan.FromSeconds(_translationOptions.DefaultTimeout);

        _baseUrl = $"{_translationOptions.Endpoint.TrimEnd('/')}/translator/document";

        _logger.LogInformation(
            "TranslationService initialized with endpoint: {Endpoint}",
            _translationOptions.Endpoint
        );
    }

    public async Task<TranslationResult> StartTranslationJobAsync(TranslationRequest request)
    {
        var jobId = Guid.NewGuid().ToString();
        _logger.LogInformation(
            "Starting translation job {JobId} for {DocumentCount} documents from site: {SiteUrl}",
            jobId,
            request.Documents.Count,
            request.SiteUrl
        );

        try
        {
            // Validate that we have user access token for delegated permissions
            if (string.IsNullOrEmpty(request.UserAccessToken))
            {
                _logger.LogWarning(
                    "Job {JobId} failed: No user access token provided for delegated permissions",
                    jobId
                );
                return new TranslationResult
                {
                    Success = false,
                    JobId = jobId,
                    Message = "User access token is required for delegated permissions",
                    Errors = new List<string> { "No user access token provided" },
                };
            }

            // Validate that we have tenant ID for On-Behalf-Of flow
            if (string.IsNullOrEmpty(request.Context?.TenantId))
            {
                _logger.LogWarning(
                    "Job {JobId} failed: No tenant ID provided for On-Behalf-Of authentication",
                    jobId
                );
                return new TranslationResult
                {
                    Success = false,
                    JobId = jobId,
                    Message = "Tenant ID is required for On-Behalf-Of authentication",
                    Errors = new List<string> { "No tenant ID provided in context" },
                };
            }

            // Validate translation options
            if (request.Options?.TargetLanguages == null || !request.Options.TargetLanguages.Any())
            {
                _logger.LogWarning(
                    "Job {JobId} failed: No target languages specified",
                    jobId
                );
                return new TranslationResult
                {
                    Success = false,
                    JobId = jobId,
                    Message = "At least one target language must be specified",
                    Errors = new List<string> { "No target languages provided" },
                };
            }

            _logger.LogDebug(
                "Job {JobId} validation passed. TenantId: {TenantId}, TargetLanguages: {TargetLanguages}",
                jobId,
                request.Context.TenantId,
                string.Join(", ", request.Options.TargetLanguages)
            );

            // Filter supported documents
            var supportedDocuments = request
                .Documents.Where(d => d.IsSupported)
                .ToList();

            _logger.LogInformation(
                "Job {JobId} document filtering completed. Supported: {SupportedCount}/{OriginalCount}",
                jobId,
                supportedDocuments.Count,
                request.Documents.Count
            );

            if (!supportedDocuments.Any())
            {
                _logger.LogWarning(
                    "Job {JobId} failed: No supported documents found for processing",
                    jobId
                );
                return new TranslationResult
                {
                    Success = false,
                    JobId = jobId,
                    Message = "No supported documents found for processing",
                    Errors = new List<string>
                    {
                        "All selected documents are unsupported file types",
                    },
                };
            }

            // Create processing job
            var job = new ProcessingJob
            {
                JobId = jobId,
                SiteUrl = request.SiteUrl,
                Documents = supportedDocuments,
                Options = request.Options,
                Context = request.Context,
                UserAccessToken = request.UserAccessToken,
                Status = JobStatus.Pending,
                Progress = 0,
                Message = "Job queued for processing",
                CreatedAt = DateTime.UtcNow,
                RetryCount = 0,
                MaxRetries = _storageOptions.DefaultMaxRetries,
                TotalDocuments = supportedDocuments.Count,
            };

            // Save job status
            _logger.LogDebug("Job {JobId} saving initial job status", jobId);
            await _jobStatusService.UpdateJobStatusAsync(job);

            _logger.LogInformation("Job {JobId} status saved, now queuing for processing", jobId);

            // Queue job for processing via Service Bus
            await QueueJobForProcessingAsync(job);

            _logger.LogInformation(
                "Job {JobId} successfully created and queued. Processing {DocumentCount} documents from site: {SiteUrl}",
                jobId,
                supportedDocuments.Count,
                request.SiteUrl
            );

            return new TranslationResult
            {
                Success = true,
                JobId = jobId,
                Message =
                    $"Translation job started successfully. Processing {supportedDocuments.Count} documents.",
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error starting translation job {JobId}. Exception: {ExceptionType}, Message: {ExceptionMessage}",
                jobId,
                ex.GetType().Name,
                ex.Message
            );

            await _jobStatusService.UpdateJobStatusAsync(
                new ProcessingJob
                {
                    JobId = jobId,
                    SiteUrl = request.SiteUrl,
                    Documents = request.Documents,
                    Options = request.Options,
                    Context = request.Context,
                    UserAccessToken = request.UserAccessToken,
                    Status = JobStatus.Failed,
                    Progress = 0,
                    Message = "Failed to start job",
                    ErrorMessage = ex.Message,
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow,
                    RetryCount = 0,
                    MaxRetries = _storageOptions.DefaultMaxRetries,
                }
            );

            return new TranslationResult
            {
                Success = false,
                JobId = jobId,
                Message = "Failed to start translation job",
                Errors = new List<string> { ex.Message },
            };
        }
    }

    public async Task ProcessTranslationJobAsync(ProcessingJob job)
    {
        _logger.LogInformation("Processing translation job {JobId}", job.JobId);

        try
        {
            // Check if job is already completed or in progress
            var currentJobStatus = await _jobStatusService.GetJobStatusAsync(job.JobId);
            if (currentJobStatus != null && currentJobStatus.Status == JobStatus.Completed)
            {
                _logger.LogInformation(
                    "Job {JobId} is already completed. Skipping duplicate processing.",
                    job.JobId
                );
                return;
            }

            if (currentJobStatus != null && currentJobStatus.Status == JobStatus.Processing)
            {
                _logger.LogInformation(
                    "Job {JobId} is already being processed. Skipping duplicate processing.",
                    job.JobId
                );
                return;
            }

            // Mark job as processing
            job.Status = JobStatus.Processing;
            job.Progress = 0;
            job.Message = "Starting job processing...";
            await _jobStatusService.UpdateJobStatusAsync(job);

            // Validate job has required data
            if (string.IsNullOrEmpty(job.UserAccessToken))
            {
                throw new InvalidOperationException(
                    "Job missing user access token for delegated permissions"
                );
            }

            if (string.IsNullOrEmpty(job.Context?.TenantId))
            {
                throw new InvalidOperationException(
                    "Job missing tenant ID for On-Behalf-Of authentication"
                );
            }

            job.Progress = 20;
            job.Message = "Processing documents...";
            await _jobStatusService.UpdateJobStatusAsync(job);

            var blobUrls = new List<string>();
            var sourceFolderId = Guid.NewGuid().ToString();
            var folderPath = string.Empty;
            var translatedFileNames = new List<string>(); // Track translated file names for cleanup

            // Step 1: Download documents from SharePoint and upload to blob storage
            foreach (var document in job.Documents)
            {
                try
                {
                    _logger.LogInformation(
                        "Processing document {DocumentName} for job {JobId}",
                        document.Name,
                        job.JobId
                    );
                    folderPath = GetDirectoryPath(document.ServerRelativeUrl);

                    job.Progress = 30;
                    job.Message = "Downloading documents...";
                    await _jobStatusService.UpdateJobStatusAsync(job);

                    // Download document from SharePoint using user's delegated permissions
                    var documentContent = await _sharePointService.DownloadDocumentAsync(
                        job.SiteUrl,
                        job.Context.ListId,
                        document.ServerRelativeUrl,
                        job.Context.TenantId,
                        job.UserAccessToken
                    );

                    // Upload the document to blob storage
                    if (documentContent.Bytes != null)
                    {
                        var blobUrl = await _blobStorageService.UploadBlobAsync(
                            sourceFolderId,
                            _storageOptions.SourceContainer,
                            document.Name,
                            documentContent.Bytes
                        );
                        blobUrls.Add(blobUrl);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error processing document {DocumentName} for job {JobId}",
                        document.Name,
                        job.JobId
                    );

                    foreach (var targetLanguage in job.Options.TargetLanguages)
                    {
                        job.FailedDocuments.Add(new FailedDocument
                        {
                            Name = document.Name,
                            TargetLanguage = targetLanguage,
                            Error = ex.Message,
                        });
                    }
                }
            }

            // Step 2: Submit ONE batch translation job for ALL target languages
            var batchJobId = Guid.NewGuid().ToString();
            string? azureJobId = null;

            job.Progress = 40;
            job.Message = $"Submitting translation job for {job.Options.TargetLanguages.Count} languages...";
            await _jobStatusService.UpdateJobStatusAsync(job);

            try
            {
                azureJobId = await SubmitBatchTranslationJobAsync(
                    blobUrls,
                    string.Empty,
                    job.Options.TargetLanguages,
                    job.Options.SourceLanguage,
                    $"BatchTranslate_{batchJobId}"
                );

                // Track the translated file names that will be created for cleanup
                foreach (var blobUrl in blobUrls)
                {
                    var sourceUri = new Uri(blobUrl);
                    var sourceFileName = Uri.UnescapeDataString(sourceUri.Segments.Last());
                    var fileNameWithoutExt = Path.GetFileNameWithoutExtension(sourceFileName);
                    var fileExtension = Path.GetExtension(sourceFileName);

                    foreach (var lang in job.Options.TargetLanguages)
                    {
                        var translatedFileName = $"{fileNameWithoutExt}_{lang}{fileExtension}";
                        translatedFileNames.Add(translatedFileName);
                    }
                }

                _logger.LogInformation(
                    "Tracked {Count} translated file names for cleanup",
                    translatedFileNames.Count
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error submitting batch translation job for all languages"
                );

                foreach (var targetLanguage in job.Options.TargetLanguages)
                {
                    foreach (var doc in job.Documents)
                    {
                        job.FailedDocuments.Add(new FailedDocument
                        {
                            Name = doc.Name,
                            TargetLanguage = targetLanguage,
                            Error = $"Failed to submit translation job: {ex.Message}",
                        });
                    }
                }
            }

            // Step 3: Wait for the translation job to complete
            job.Progress = 50;
            job.Message = "Translating documents...";
            await _jobStatusService.UpdateJobStatusAsync(job);

            DocumentTranslationJobStatus? jobStatus = null;
            if (!string.IsNullOrEmpty(azureJobId))
            {
                try
                {
                    jobStatus = await WaitForJobCompletionAsync(azureJobId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error waiting for translation job {JobId}",
                        azureJobId
                    );
                }
            }

            // Step 4: Download translated documents and upload to SharePoint
            job.Progress = 60;
            job.Message = "Getting translated documents...";
            await _jobStatusService.UpdateJobStatusAsync(job);

            long totalCharacters = 0;

            if (jobStatus != null)
            {
                if (jobStatus.Status != "Succeeded")
                {
                    foreach (var targetLanguage in job.Options.TargetLanguages)
                    {
                        foreach (var doc in job.Documents)
                        {
                            job.FailedDocuments.Add(new FailedDocument
                            {
                                Name = doc.Name,
                                TargetLanguage = targetLanguage,
                                Error = $"Translation job failed: {jobStatus.Status}",
                            });
                        }
                    }
                }
                else
                {
                    totalCharacters = jobStatus.TotalCharacterCharged;

                    // Get translated document locations
                    var translatedLocations = jobStatus
                        .Results.Where(r => !string.IsNullOrEmpty(r.TranslatedDocumentLocation))
                        .Select(r => r.TranslatedDocumentLocation!)
                        .ToList();

                    if (translatedLocations.Count > 0)
                    {
                        var translatedContents = await _blobStorageService.DownloadFromUrlsBatchAsync(
                            translatedLocations
                        );

                        foreach (var contentKvp in translatedContents)
                        {
                            var translatedUrl = contentKvp.Key;
                            var translatedStream = contentKvp.Value;

                            if (translatedStream != null)
                            {
                                try
                                {
                                    job.Progress = 80;
                                    job.Message = "Uploading translated documents to SharePoint...";
                                    await _jobStatusService.UpdateJobStatusAsync(job);

                                    // Extract just the filename without the GUID folder path
                                    // URL format: .../guid/filename or .../guid%2Ffilename
                                    var urlParts = translatedUrl.Split('/');
                                    var lastPart = urlParts.Last();
                                    // Handle URL encoded path separators (guid%2Ffilename)
                                    var originalFileName = lastPart.Contains("%2F") || lastPart.Contains("%2f")
                                        ? Uri.UnescapeDataString(lastPart).Split('/').Last()
                                        : lastPart;

                                    // Try to determine target language from URL path or filename
                                    // Azure may include language code in path or we can track by matching source
                                    string targetLanguage = "unknown";
                                    
                                    // Try to extract language from URL path segments
                                    // Azure often puts translated files in language-specific paths
                                    foreach (var lang in job.Options.TargetLanguages)
                                    {
                                        if (translatedUrl.Contains($"/{lang}/", StringComparison.OrdinalIgnoreCase) ||
                                            translatedUrl.Contains($"_{lang}_", StringComparison.OrdinalIgnoreCase) ||
                                            translatedUrl.EndsWith($"_{lang}.{Path.GetExtension(originalFileName).TrimStart('.')}", StringComparison.OrdinalIgnoreCase))
                                        {
                                            targetLanguage = lang;
                                            break;
                                        }
                                    }
                                    
                                    var fileName = $"[TRANSLATED]_{originalFileName}";
									//$"[TRANSLATED_{targetLanguage.ToUpper()}]_{originalFileName}";

									await _sharePointService.UploadDocumentAsync(
                                        job.SiteUrl,
                                        job.Context?.ListId ?? "",
                                        folderPath,
                                        fileName,
                                        translatedStream,
                                        job.Context?.TenantId ?? "",
                                        job.UserAccessToken ?? ""
                                    );

                                    var translatedServerRelativeUrl = string.IsNullOrEmpty(folderPath)
                                        ? $"/{fileName}"
                                        : $"{folderPath}/{fileName}";

                                    job.CompletedDocuments.Add(new TranslatedDocument
                                    {
                                        OriginalName = originalFileName,
                                        TranslatedName = fileName,
                                        TargetLanguage = targetLanguage,
                                        ServerRelativeUrl = translatedServerRelativeUrl,
                                        CharacterCount = (int)translatedStream.Length,
                                    });
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogWarning(
                                        ex,
                                        "Failed to upload translated document: {TranslatedUrl}",
                                        translatedUrl
                                    );

                                    job.FailedDocuments.Add(new FailedDocument
                                    {
                                        Name = translatedUrl.Split('/').Last(),
                                        TargetLanguage = "unknown",
                                        Error = $"Failed to upload: {ex.Message}",
                                    });
                                }
                            }
                        }
                    }
                }
            }

            // Step 5: Clean up blob storage
            try
            {
                job.Progress = 90;
                job.Message = "Cleaning up...";
                await _jobStatusService.UpdateJobStatusAsync(job);

                // Clean up source files (uploaded from SharePoint)
                _logger.LogInformation(
                    "Cleaning up source files with folder prefix: {FolderId} in container: {Container}",
                    sourceFolderId,
                    _storageOptions.SourceContainer
                );
                await _blobStorageService.CleanupRedactionOutputAsync(
                    sourceFolderId,
                    _storageOptions.SourceContainer
                );

                // Clean up translated files in temp container
                _logger.LogInformation(
                    "Cleaning up {Count} translated files from temp container: {Container}",
                    translatedFileNames.Count,
                    _storageOptions.TempContainer
                );
                foreach (var fileName in translatedFileNames)
                {
                    try
                    {
                        await _blobStorageService.DeleteDocumentAsync(
                            _storageOptions.TempContainer,
                            fileName
                        );
                        _logger.LogDebug("Deleted translated file: {FileName}", fileName);
                    }
                    catch (Exception deleteEx)
                    {
                        _logger.LogWarning(
                            deleteEx,
                            "Failed to delete translated file: {FileName}",
                            fileName
                        );
                    }
                }

                _logger.LogInformation(
                    "Successfully cleaned up blob storage for job {JobId}",
                    job.JobId
                );
            }
            catch (Exception cleanupEx)
            {
                _logger.LogWarning(
                    cleanupEx,
                    "Failed to clean up blob storage for job {JobId}",
                    job.JobId
                );
            }

            // Complete the job
            job.Status = JobStatus.Completed;
            job.Progress = 100;
            job.CompletedAt = DateTime.UtcNow;
            job.TotalCharacterCharged = totalCharacters;

            if (job.FailedDocuments.Any())
            {
                job.Message =
                    $"Completed with {job.FailedDocuments.Count} failures. "
                    + $"Successfully translated {job.CompletedDocuments.Count} documents.";
            }
            else
            {
                job.Message =
                    $"Successfully translated all {job.CompletedDocuments.Count} documents.";
            }

            await _jobStatusService.UpdateJobStatusAsync(job);

            _logger.LogInformation(
                "Completed translation job {JobId}. Translated: {TranslatedCount}, Failed: {FailedCount}",
                job.JobId,
                job.CompletedDocuments.Count,
                job.FailedDocuments.Count
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing translation job {JobId}", job.JobId);

            job.Status = JobStatus.Failed;
            job.ErrorMessage = ex.Message;
            job.Message = "Job failed due to an unexpected error";
            job.CompletedAt = DateTime.UtcNow;

            await _jobStatusService.UpdateJobStatusAsync(job);
        }
    }

    public async Task<string> SubmitBatchTranslationJobAsync(
        List<string> sourceBlobUrls,
        string targetContainerPath,
        List<string> targetLanguages,
        string? sourceLanguage = null,
        string displayName = ""
    )
    {
        try
        {
            _logger.LogInformation(
                "Submitting batch translation job for {DocumentCount} documents to {LanguageCount} languages: {Languages}",
                sourceBlobUrls.Count,
                targetLanguages.Count,
                string.Join(", ", targetLanguages)
            );

            // Generate SAS URL for target container with write permissions
            var targetContainerWithSas = await _blobStorageService.GetContainerSasUrlAsync(
                _storageOptions.TempContainer,
                write: true
            );

            // Log authentication method and URLs for debugging
            _logger.LogInformation(
                "Using Managed Identity: {UseManagedIdentity}",
                _storageOptions.UseManagedIdentity
            );
            _logger.LogInformation(
                "Source blob URLs (first): {FirstSourceUrl}",
                sourceBlobUrls.FirstOrDefault() ?? "none"
            );
            _logger.LogInformation(
                "Target container URL: {TargetUrl}",
                targetContainerWithSas
            );

            // Build the request payload according to the documentation
            // For batch translation: ONE input per source document with MULTIPLE targets (one per language)
            var inputs = sourceBlobUrls
                .Select(sourceUrl =>
                {
                    // Extract the filename from the source URL
                    var sourceUri = new Uri(sourceUrl);
                    var sourceFileName = Uri.UnescapeDataString(sourceUri.Segments.Last());
                    var fileNameWithoutExt = Path.GetFileNameWithoutExtension(sourceFileName);
                    var fileExtension = Path.GetExtension(sourceFileName);

                    // Build source object
                    var source = new Dictionary<string, object>
                    {
                        { "sourceUrl", sourceUrl }
                    };

                    if (!string.IsNullOrEmpty(sourceLanguage))
                    {
                        source["language"] = sourceLanguage;
                    }

                    // For managed identity, don't include storageSource
                    if (!_storageOptions.UseManagedIdentity)
                    {
                        source["storageSource"] = "AzureBlob";
                    }

                    // Build targets array - one target per language with unique file paths
                    var targets = targetLanguages.Select(lang =>
                    {
                        // Create unique target file name: originalname_ru.pdf, originalname_ar.pdf
                        var targetFileName = $"{fileNameWithoutExt}_{lang}{fileExtension}";
                        var targetFileUrl = $"{targetContainerWithSas.TrimEnd('/')}/{targetFileName}";

                        var target = new Dictionary<string, object>
                        {
                            { "targetUrl", targetFileUrl },
                            { "language", lang }
                        };

                        // For managed identity, don't include storageSource
                        if (!_storageOptions.UseManagedIdentity)
                        {
                            target["storageSource"] = "AzureBlob";
                        }

                        return target;
                    }).ToArray();

                    return new 
                    { 
                        storageType = "File",
                        source,
                        targets
                    };
                })
                .ToArray();

            var payload = new { inputs };

            string jsonPayload = JsonSerializer.Serialize(payload, JsonOptions);

            _logger.LogDebug(
                "Translation request payload: {Payload}",
                jsonPayload
            );

            var requestUri = $"{_baseUrl}/batches?api-version=2024-05-01";
            using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(requestUri, content).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                // Extract job ID from operation-location header
                if (
                    response.Headers.TryGetValues(
                        "Operation-Location",
                        out var operationLocationValues
                    )
                )
                {
                    var operationLocation = operationLocationValues.FirstOrDefault();
                    if (!string.IsNullOrEmpty(operationLocation))
                    {
                        // Extract job ID from URL: .../batches/{jobId}
                        var uri = new Uri(operationLocation);
                        var pathSegments = uri.Segments;
                        var batchesIndex = Array.FindIndex(
                            pathSegments,
                            s => s.TrimEnd('/').Equals("batches", StringComparison.OrdinalIgnoreCase)
                        );

                        if (batchesIndex >= 0 && batchesIndex + 1 < pathSegments.Length)
                        {
                            var jobId = pathSegments[batchesIndex + 1].TrimEnd('/');
                            _logger.LogInformation(
                                "Translation batch job submitted successfully with ID: {JobId}",
                                jobId
                            );
                            return jobId;
                        }
                    }
                }

                _logger.LogWarning("Job submitted but no operation-location header or job ID found");
                return string.Empty;
            }

            string errorContent = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
            _logger.LogError(
                "Failed to submit translation batch job. Status: {StatusCode}, Error: {Error}, Request Payload: {Payload}",
                response.StatusCode,
                errorContent,
                jsonPayload
            );
            throw new InvalidOperationException(
                $"Failed to submit translation batch job: {response.StatusCode} - {errorContent}"
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting batch translation job");
            throw;
        }
    }

    public async Task<DocumentTranslationJobStatus> GetTranslationJobStatusAsync(string jobId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(jobId))
        {
            throw new ArgumentException("Job ID cannot be null or empty", nameof(jobId));
        }

        try
        {
            _logger.LogDebug("Checking status of translation job: {JobId}", jobId);

            var requestUri = $"{_baseUrl}/batches/{jobId}?api-version=2024-05-01";
            var response = await _httpClient.GetAsync(requestUri).ConfigureAwait(false);

            if (response.IsSuccessStatusCode)
            {
                string responseContent = await response
                    .Content.ReadAsStringAsync()
                    .ConfigureAwait(false);

                var responseData = JsonSerializer.Deserialize<JsonElement>(responseContent);

                var jobStatus = new DocumentTranslationJobStatus
                {
                    JobId = jobId,
                    Status = responseData.GetProperty("status").GetString() ?? "Unknown",
                    CreatedDateTime = responseData.GetProperty("createdDateTimeUtc").GetDateTime(),
                    LastUpdatedDateTime = responseData
                        .GetProperty("lastActionDateTimeUtc")
                        .GetDateTime(),
                };

				// Extract top-level error information (for ValidationFailed status)
				if (responseData.TryGetProperty("error", out var errorElement))
				{
					jobStatus.ErrorCode = errorElement.TryGetProperty("code", out var codeElement)
						? codeElement.GetString()
						: null;
					jobStatus.ErrorMessage = errorElement.TryGetProperty("message", out var messageElement)
						? messageElement.GetString()
						: null;
					jobStatus.ErrorTarget = errorElement.TryGetProperty("target", out var targetElement)
						? targetElement.GetString()
						: null;

					this._logger.LogWarning(
						"Job {JobId} has top-level error - Code: {ErrorCode}, Message: {ErrorMessage}, Target: {ErrorTarget}",
						jobId,
						jobStatus.ErrorCode,
						jobStatus.ErrorMessage,
						jobStatus.ErrorTarget
					);
				}

				// Extract summary
				if (responseData.TryGetProperty("summary", out var summaryElement))
                {
                    if (summaryElement.TryGetProperty("total", out var totalElement))
                    {
                        jobStatus.TasksTotal = totalElement.GetInt32();
                    }
                    if (summaryElement.TryGetProperty("success", out var successElement))
                    {
                        jobStatus.TasksCompleted = successElement.GetInt32();
                    }
                    if (summaryElement.TryGetProperty("failed", out var failedElement))
                    {
                        jobStatus.TasksFailed = failedElement.GetInt32();
                    }
                    if (summaryElement.TryGetProperty("inProgress", out var inProgressElement))
                    {
                        jobStatus.TasksInProgress = inProgressElement.GetInt32();
                    }
                    if (
                        summaryElement.TryGetProperty("totalCharacterCharged", out var charElement)
                    )
                    {
                        jobStatus.TotalCharacterCharged = charElement.GetInt64();
                    }
                }

				// Extract document results
				// For completed jobs, fetch document details
				if (jobStatus.Status == "Succeeded" || jobStatus.Status == "Failed" || jobStatus.Status == "ValidationFailed")
				{
					await this.FetchDocumentDetailsAsync(
						jobId,
						jobStatus,
                        cancellationToken
					);
				}

				return jobStatus;
            }

            string errorContent = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
            _logger.LogError(
                "Failed to get job status. Status: {StatusCode}, Error: {Error}",
                response.StatusCode,
                errorContent
            );
            throw new InvalidOperationException(
                $"Failed to get job status: {response.StatusCode} - {errorContent}"
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting translation job status");
            throw;
        }
    }

    private async Task<DocumentTranslationJobStatus> WaitForJobCompletionAsync(string jobId)
    {
        const int maxAttempts = 60; // 5 minutes
        const int delaySeconds = 5;

        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            var status = await GetTranslationJobStatusAsync(jobId);

            _logger.LogDebug(
                "Job {JobId} status check {Attempt}/{MaxAttempts}: Status={Status}, Tasks={Completed}/{Total} completed, {Failed} failed, {InProgress} in progress",
                jobId,
                attempt + 1,
                maxAttempts,
                status.Status,
                status.TasksCompleted,
                status.TasksTotal,
                status.TasksFailed,
                status.TasksInProgress
            );

            if (
                status.Status == "Succeeded"
                || status.Status == "Failed"
                || status.Status == "Cancelled"
				|| status.Status == "ValidationFailed"
			)
            {
                _logger.LogInformation(
                    "Job {JobId} completed with status {Status}. Final task summary: {Completed}/{Total} completed, {Failed} failed",
                    jobId,
                    status.Status,
                    status.TasksCompleted,
                    status.TasksTotal,
                    status.TasksFailed
                );
                return status;
            }

            if (attempt < maxAttempts - 1)
            {
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }

        throw new TimeoutException(
            $"Translation job {jobId} did not complete within the expected time"
        );
    }

    private async Task QueueJobForProcessingAsync(ProcessingJob job)
    {
        _logger.LogDebug("Queuing job {JobId} for processing via Service Bus...", job.JobId);

        try
        {
            var existingJob = await _jobStatusService.GetJobStatusAsync(job.JobId);
            if (
                existingJob != null
                && (
                    existingJob.Status == JobStatus.Processing
                    || existingJob.Status == JobStatus.Completed
                )
            )
            {
                _logger.LogWarning(
                    "Job {JobId} is already {Status}. Skipping duplicate queue operation.",
                    job.JobId,
                    existingJob.Status
                );
                return;
            }

            var jobJson = JsonSerializer.Serialize(
                job,
                new JsonSerializerOptions { WriteIndented = false }
            );

            var message = new ServiceBusMessage(jobJson)
            {
                MessageId = $"{job.JobId}-{Guid.NewGuid():N}",
                ContentType = "application/json",
                Subject = "TranslationJob",
                ApplicationProperties =
                {
                    ["JobId"] = job.JobId,
                    ["CreatedAt"] = job.CreatedAt.ToString("O"),
                    ["DocumentCount"] = job.Documents.Count,
                },
            };

            await _serviceBusSender.SendMessageAsync(message);

            _logger.LogInformation(
                "Queued job {JobId} for processing via Service Bus. MessageId: {MessageId}, Documents: {DocumentCount}",
                job.JobId,
                message.MessageId,
                job.Documents.Count
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error queuing job {JobId} for processing via Service Bus",
                job.JobId
            );
            throw;
        }
    }

    private string GetDirectoryPath(string serverRelativeUrl)
    {
        return Path.GetDirectoryName(serverRelativeUrl)?.Replace('\\', '/') ?? "";
    }

	/// <summary>
	/// Fetches detailed document information for a completed job.
	/// </summary>
	private async Task FetchDocumentDetailsAsync(
		string jobId,
		DocumentTranslationJobStatus jobStatus,
		CancellationToken cancellationToken
	)
	{
		try
		{
			var requestUri =
				$"{this._baseUrl}/batches/{jobId}/documents?api-version={this._translationOptions.ApiVersion}";
			var response = await this
				._httpClient.GetAsync(requestUri, cancellationToken)
				.ConfigureAwait(false);

			if (response.IsSuccessStatusCode)
			{
				string responseContent = await response
					.Content.ReadAsStringAsync(cancellationToken)
					.ConfigureAwait(false);

				var responseData = JsonSerializer.Deserialize<JsonElement>(responseContent);

				if (
					responseData.TryGetProperty("value", out var documentsElement)
					&& documentsElement.ValueKind == JsonValueKind.Array
				)
				{
					foreach (var document in documentsElement.EnumerateArray())
					{
						var result = new DocumentTranslationResult
						{
							DocumentId = document.GetProperty("id").GetString() ?? string.Empty,
							Status = document.GetProperty("status").GetString() ?? "Unknown",
						};

						// Get translated document location
						if (document.TryGetProperty("path", out var pathElement))
						{
							result.TranslatedDocumentLocation = pathElement.GetString();
						}

						jobStatus.Results.Add(result);

						this._logger.LogDebug(
							"Found document result for job {JobId}: DocumentId={DocumentId}, Status={Status}, TranslatedLocation={TranslatedLocation}",
							jobId,
							result.DocumentId,
							result.Status,
							result.TranslatedDocumentLocation ?? "None"
						);

						// Check for document-level errors
						if (document.TryGetProperty("error", out var errorElement))
						{
							jobStatus.Errors.Add(
								new DocumentTranslationError
								{
									Code =
										errorElement.GetProperty("code").GetString()
										?? string.Empty,
									Message =
										errorElement.GetProperty("message").GetString()
										?? string.Empty,
									Target = result.DocumentId,
								}
							);
						}
					}
				}
			}
		}
		catch (Exception ex)
		{
			this._logger.LogWarning(
				ex,
				"Failed to fetch document details for job {JobId}",
				jobId
			);
		}
	}
}
