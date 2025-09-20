using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Azure.AI.TextAnalytics;
using Azure.Messaging.ServiceBus;
using Azure.Storage.Queues;
using DocumentRedactionApp.Models;
using DocumentRedactionApp.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DocumentRedactionApp.Services;

public interface IRedactionService
{
    Task<RedactionResult> StartRedactionJobAsync(RedactionRequest request);
    Task ProcessRedactionJobAsync(ProcessingJob job);
}

public class RedactionService : IRedactionService
{
    private readonly ILogger<RedactionService> _logger;
    private readonly IBlobStorageService _blobStorageService;
    private readonly ISharePointService _sharePointService;
    private readonly IJobStatusService _jobStatusService;
    private readonly ITextAnalyticsService _textAnalyticsService;
    private readonly StorageOptions _storageOptions;
    private readonly LanguageServiceOptions _languageServiceOptions;
	private readonly ServiceBusSender _serviceBusSender;

	public RedactionService(
        ILogger<RedactionService> logger,
        IBlobStorageService blobStorageService,
        ISharePointService sharePointService,
        IJobStatusService jobStatusService,
        ITextAnalyticsService textAnalyticsService,
        IOptions<LanguageServiceOptions> languageServiceOptions,
        IOptions<StorageOptions> storageOptions,
		ServiceBusSender serviceBusSender
	)
    {
        _logger = logger;
        _blobStorageService = blobStorageService;
        _sharePointService = sharePointService;
        _jobStatusService = jobStatusService;
        _textAnalyticsService = textAnalyticsService;
        _storageOptions = storageOptions.Value;
        _languageServiceOptions = languageServiceOptions.Value;
		_serviceBusSender = serviceBusSender;
	}

    public async Task<RedactionResult> StartRedactionJobAsync(RedactionRequest request)
    {
        var jobId = Guid.NewGuid().ToString();
        _logger.LogInformation(
            "Starting redaction job {JobId} for {DocumentCount} documents from site: {SiteUrl}",
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
                return new RedactionResult
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
                return new RedactionResult
                {
                    Success = false,
                    JobId = jobId,
                    Message = "Tenant ID is required for On-Behalf-Of authentication",
                    Errors = new List<string> { "No tenant ID provided in context" },
                };
            }

            _logger.LogDebug(
                "Job {JobId} validation passed. TenantId: {TenantId}",
                jobId,
                request.Context.TenantId
            );

            // Filter supported documents
            _logger.LogDebug(
                "Job {JobId} filtering documents. Original count: {OriginalCount}, Supported file types: {SupportedTypes}",
                jobId,
                request.Documents.Count,
                string.Join(", ", _languageServiceOptions.SupportedFileTypes)
            );

            var supportedDocuments = request
                .Documents.Where(d =>
                    _languageServiceOptions.SupportedFileTypes.Contains(
                        d.FileType.ToLowerInvariant()
                    )
                )
                .Where(d => d.Size <= _languageServiceOptions.MaxFileSizeBytes)
                .Where(d => d.IsSupported)
                .ToList();

            _logger.LogInformation(
                "Job {JobId} document filtering completed. Supported: {SupportedCount}/{OriginalCount}, Max size: {MaxSize} bytes",
                jobId,
                supportedDocuments.Count,
                request.Documents.Count,
                _languageServiceOptions.MaxFileSizeBytes
            );

            if (request.Documents.Count > supportedDocuments.Count)
            {
                var unsupportedCount = request.Documents.Count - supportedDocuments.Count;
                _logger.LogWarning(
                    "Job {JobId} has {UnsupportedCount} unsupported documents that will be skipped",
                    jobId,
                    unsupportedCount
                );
            }

            if (!supportedDocuments.Any())
            {
                _logger.LogWarning(
                    "Job {JobId} failed: No supported documents found for processing",
                    jobId
                );
                return new RedactionResult
                {
                    Success = false,
                    JobId = jobId,
                    Message = "No supported documents found for processing",
                    Errors = new List<string>
                    {
                        "All selected documents are either unsupported file types or exceed size limits",
                    },
                };
            }

            // Check document count limit
            if (supportedDocuments.Count > _languageServiceOptions.MaxDocumentsPerJob)
            {
                _logger.LogWarning(
                    "Job {JobId} failed: Too many documents ({DocumentCount} > {MaxDocuments})",
                    jobId,
                    supportedDocuments.Count,
                    _languageServiceOptions.MaxDocumentsPerJob
                );
                return new RedactionResult
                {
                    Success = false,
                    JobId = jobId,
                    Message =
                        $"Too many documents selected. Maximum allowed: {_languageServiceOptions.MaxDocumentsPerJob}",
                    Errors = new List<string>
                    {
                        $"Selected {supportedDocuments.Count} documents, but maximum is {_languageServiceOptions.MaxDocumentsPerJob}",
                    },
                };
            }

            _logger.LogDebug(
                "Job {JobId} document validation passed. Processing {DocumentCount} documents",
                jobId,
                supportedDocuments.Count
            );

            // Create processing job
            _logger.LogDebug(
                "Job {JobId} creating ProcessingJob object with {RetryCount} max retries",
                jobId,
                _storageOptions.DefaultMaxRetries
            );
            var job = new ProcessingJob
            {
                JobId = jobId,
                SiteUrl = request.SiteUrl,
                Documents = supportedDocuments,
                Options = request.Options,
                Context = request.Context,
                UserAccessToken = request.UserAccessToken, // Store user token for delegated access
                Status = JobStatus.Pending,
                Progress = 0,
                Message = "Job queued for processing",
                CreatedAt = DateTime.UtcNow,
                RetryCount = 0,
                MaxRetries = _storageOptions.DefaultMaxRetries,
            };

            // Save job status
            _logger.LogDebug("Job {JobId} saving initial job status", jobId);
            await _jobStatusService.UpdateJobStatusAsync(job);

            _logger.LogInformation("Job {JobId} status saved, now queuing for processing", jobId);

            // Queue job for processing
            await QueueJobForProcessingAsync(job);

            _logger.LogInformation(
                "Job {JobId} successfully created and queued. Processing {DocumentCount} documents from site: {SiteUrl}",
                jobId,
                supportedDocuments.Count,
                request.SiteUrl
            );

            return new RedactionResult
            {
                Success = true,
                JobId = jobId,
                Message =
                    $"Redaction job started successfully. Processing {supportedDocuments.Count} documents.",
                ProcessedDocuments = supportedDocuments,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error starting redaction job {JobId}. Exception: {ExceptionType}, Message: {ExceptionMessage}",
                jobId,
                ex.GetType().Name,
                ex.Message
            );

            _logger.LogDebug("Job {JobId} updating status to failed due to startup error", jobId);

            await _jobStatusService.UpdateJobStatusAsync(
                new ProcessingJob
                {
                    JobId = jobId,
                    SiteUrl = request.SiteUrl,
                    Documents = request.Documents,
                    Options = request.Options,
                    Context = request.Context,
                    UserAccessToken = request.UserAccessToken, // Include user token
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

            _logger.LogInformation(
                "Job {JobId} status updated to failed after startup error",
                jobId
            );

            return new RedactionResult
            {
                Success = false,
                JobId = jobId,
                Message = "Failed to start redaction job",
                Errors = new List<string> { ex.Message },
            };
        }
    }

    public async Task ProcessRedactionJobAsync(ProcessingJob job)
    {
        _logger.LogInformation("Processing redaction job {JobId}", job.JobId);

        try
        {
            // Check if job is already completed or in progress to prevent duplicate processing
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

            // Mark job as processing immediately to prevent other instances from processing it
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

            // Update job status to processing
            job.Status = JobStatus.Processing;
            job.Progress = 20;
            job.Message = "Processing documents...";
            await _jobStatusService.UpdateJobStatusAsync(job);

            var totalDocuments = job.Documents.Count;
            var processedCount = 0;
            var blobUrls = new List<string>();
            var batchJobId = Guid.NewGuid().ToString();
            var sourceFolderId = Guid.NewGuid().ToString();
            var folderPath = string.Empty;
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
                    if (documentContent.OriginalBytes != null)
                    {
                        var blobUrl = await _blobStorageService.UploadBlobAsync(
                            sourceFolderId,
                            _storageOptions.SourceContainer,
                            document.Name,
                            documentContent.OriginalBytes
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

                    job.FailedDocuments.Add(
                        document.Name
                    );

                    // Continue processing other documents
                    processedCount++;
                    job.Progress = (int)((double)processedCount / totalDocuments * 100);
                    await _jobStatusService.UpdateJobStatusAsync(job);
                }
            }

            // Create redacted document
            job.Progress = 40;
			job.Message = "Redacting documents...";
			await _jobStatusService.UpdateJobStatusAsync(job);
			var jobId = await this._textAnalyticsService.RedactPiiFromBlobDocumentsBatchAsync(
                blobUrls,
                $"BatchRedact_{batchJobId}",
                job.Options.MaskType.ToString(),
                job.Options.MaskCharacter,
                job.Options.SelectedCategories ?? new List<string>()
            );

            job.Progress = 50;
			job.Message = "Redacting documents...";
			await _jobStatusService.UpdateJobStatusAsync(job);
			var jobStatus = await this.WaitForJobCompletionAsync(jobId);

            if (jobStatus.Status != "succeeded")
            {
                var errors = string.Join(", ", jobStatus.Errors.Select(e => e.Message));
                var taskInfo =
                    $"Tasks: {jobStatus.TasksCompleted}/{jobStatus.TasksTotal} completed, {jobStatus.TasksFailed} failed";
                job.Status = JobStatus.Failed;
                job.Progress = 100;
                job.ErrorMessage = $"Redaction job failed: {errors}";
                throw new InvalidOperationException(
                    $"Batch redaction job failed: {errors}. {taskInfo}"
                );
            }
            
            // Get redacted documents
            job.Progress = 60;
			job.Message = "Getting redacted documents...";
			await _jobStatusService.UpdateJobStatusAsync(job);
			var redactedDocumentLocations = jobStatus
                .Results.Where(r => !string.IsNullOrEmpty(r.RedactedDocumentLocation))
                .Select(r => r.RedactedDocumentLocation!)
                .ToList();

            if (redactedDocumentLocations.Count > 0)
            {
                // Step 5: Batch download redacted documents
                var redactedContents = await this._blobStorageService.DownloadFromUrlsBatchAsync(
                    redactedDocumentLocations
                );

                // upload redacted documents to SharePoint
                foreach (var kvp in redactedContents)
                {
                    var redactedDocumentUrl = kvp.Key;
                    var redactedStream = kvp.Value;

                    if (redactedStream != null)
                    {
                        try
                        {
                            job.Progress = 80;
							job.Message = "Uploading redacted documents to SharePoint...";
							await _jobStatusService.UpdateJobStatusAsync(job);
							var fileName = $"[REDACTED]_{kvp.Key.Split('/').Last()}";
                            await this._sharePointService.UploadDocumentAsync(
                                job.SiteUrl,
                                job.Context?.ListId ?? "",
                                folderPath,
                                fileName,
                                redactedStream,
                                job.Context?.TenantId ?? "",
                                job.UserAccessToken ?? ""
                            );
                        }
                        catch (UriFormatException ex)
                        {
                            this._logger.LogWarning(
                                ex,
                                "Failed to parse redacted document URL: {RedactedUrl}",
                                redactedDocumentUrl
                            );
                        }
                    }
                }

                // Step 10: Clean up containers
                // Clean up source files uploaded with sourceFolderId
                try
                {
					job.Progress = 80;
					job.Message = "Clean up...";
					await _jobStatusService.UpdateJobStatusAsync(job);
					await this._blobStorageService.CleanupRedactionOutputAsync(
                        sourceFolderId,
                        this._storageOptions.SourceContainer
                    );
                    this._logger.LogInformation(
                        "Successfully cleaned up source files for sourceFolderId: {SourceFolderId}",
                        sourceFolderId
                    );
                }
                catch (Exception cleanupEx)
                {
                    this._logger.LogWarning(
                        cleanupEx,
                        "Failed to clean up source files for sourceFolderId: {SourceFolderId}",
                        sourceFolderId
                    );
                }

                // For batch redaction, we need to clean up the actual redacted document locations
                // since they use random GUIDs instead of the job ID
                foreach (var redactedLocation in redactedDocumentLocations)
                {
                    try
                    {
                        // Extract the container path from the redacted document URL
                        var uri = new Uri(redactedLocation);
                        var pathSegments = uri.AbsolutePath.TrimStart('/').Split('/');

                        // Path structure: document-redaction/{documentId}/filename
                        // We want to clean up the entire {documentId} folder
                        if (
                            pathSegments.Length >= 2
                            && pathSegments[0] == this._storageOptions.TempContainer.TrimStart('/')
                        )
                        {
                            var documentIdFolder = pathSegments[1]; // DocumentId folder
                            await this._blobStorageService.CleanupRedactionOutputAsync(
                                documentIdFolder,
                                this._storageOptions.TempContainer
                            );
                        }
                    }
                    catch (Exception cleanupEx)
                    {
                        this._logger.LogWarning(
                            cleanupEx,
                            "Failed to clean up redacted document location: {RedactedLocation}",
                            redactedLocation
                        );
                    }
                }
            }

            // Complete the job
            job.Status = JobStatus.Completed;
            job.Progress = 100;
            job.CompletedAt = DateTime.UtcNow;

            job.CompletedDocuments = jobStatus.Results.Where(r => r.Status == "succeeded").Select(r => r.RedactedDocumentLocation.Split('/').Last()).ToList();
            job.FailedDocuments = jobStatus.Results.Where(r => r.Status != "succeeded").Select(r => r.RedactedDocumentLocation.Split('/').Last()).ToList();

			if (jobStatus.TasksFailed > 0)
            {
                job.Message =
                    $"Completed with {jobStatus.TasksFailed} failures. "
                    + $"Successfully processed {jobStatus.TasksCompleted} documents.";
            }
            else
            {
                job.Message =
                    $"Successfully processed all {jobStatus.TasksCompleted} documents.";
            }

            await _jobStatusService.UpdateJobStatusAsync(job);

            _logger.LogInformation(
                "Completed redaction job {JobId}. Processed: {ProcessedCount}, Failed: {FailedCount}",
                job.JobId,
                job.CompletedDocuments.Count,
                job.FailedDocuments.Count
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing redaction job {JobId}", job.JobId);

            job.Status = JobStatus.Failed;
            job.ErrorMessage = ex.Message;
            job.Message = "Job failed due to an unexpected error";
            job.CompletedAt = DateTime.UtcNow;

            await _jobStatusService.UpdateJobStatusAsync(job);
        }
    }

    private async Task<DocumentRedactionJobStatus> WaitForJobCompletionAsync(string jobId)
    {
        const int maxAttempts = 60; // (5 seconds * 60)
        const int delaySeconds = 5;

        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            var status = await this._textAnalyticsService.GetRedactionJobStatusAsync(jobId);

            this._logger.LogDebug(
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
                status.Status == "succeeded"
                || status.Status == "failed"
                || status.Status == "cancelled"
            )
            {
                this._logger.LogInformation(
                    "Job {JobId} completed with status {Status}. Final task summary: {Completed}/{Total} completed, {Failed} failed",
                    jobId,
                    status.Status,
                    status.TasksCompleted,
                    status.TasksTotal,
                    status.TasksFailed
                );
                return status;
            }

            if (attempt < maxAttempts - 1) // Don't delay on the last attempt
            {
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }

        throw new TimeoutException(
            $"Redaction job {jobId} did not complete within the expected time"
        );
    }

	private async Task QueueJobForProcessingAsync(ProcessingJob job)
	{
		_logger.LogDebug("Queuing job {JobId} for processing via Service Bus...", job.JobId);

		try
		{
			// Check if job is already queued or being processed to prevent duplicates
			var existingJob = await _jobStatusService.GetJobStatusAsync(job.JobId);
			if (existingJob != null && (
				existingJob.Status == JobStatus.Processing ||
				existingJob.Status == JobStatus.Completed))
			{
				_logger.LogWarning(
					"Job {JobId} is already {Status}. Skipping duplicate queue operation.",
					job.JobId,
					existingJob.Status
				);
				return;
			}

			var jobJson = JsonSerializer.Serialize(job, new JsonSerializerOptions { WriteIndented = false });

			_logger.LogDebug(
				"Job {JobId} serialized to JSON, length: {JsonLength} chars",
				job.JobId,
				jobJson.Length
			);

			// Create Service Bus message
			var message = new ServiceBusMessage(jobJson)
			{
				MessageId = $"{job.JobId}-{Guid.NewGuid():N}", // Unique message ID
				ContentType = "application/json",
				Subject = "RedactionJob",
				ApplicationProperties =
				{
					["JobId"] = job.JobId,
					["CreatedAt"] = job.CreatedAt.ToString("O"),
					["DocumentCount"] = job.Documents.Count
				}
			};

			// Send message to Service Bus queue
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
				"Error queuing job {JobId} for processing via Service Bus. Exception: {ExceptionType}, Message: {ExceptionMessage}",
				job.JobId,
				ex.GetType().Name,
				ex.Message
			);
			throw;
		}
	}
	private string GetDirectoryPath(string serverRelativeUrl)
    {
        return Path.GetDirectoryName(serverRelativeUrl)?.Replace('\\', '/') ?? "";
    }
}
