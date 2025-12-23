using System.Text.Json;
using Azure.Data.Tables;
using Azure;
using DocumentTranslationApp.Models;
using DocumentTranslationApp.Options;
using DocumentTranslationApp.Storage;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DocumentTranslationApp.Services;

public interface IJobStatusService
{
    Task<TranslationJobStatus?> GetJobStatusAsync(string jobId);
    Task<ProcessingJob?> GetProcessingJobAsync(string jobId);
    Task CreateJobAsync(ProcessingJob job);
    Task UpdateJobStatusAsync(ProcessingJob job);
    Task<bool> CancelJobAsync(string jobId);
    Task DeleteJobAsync(string jobId);
}

public class JobStatusService : IJobStatusService
{
    private readonly ILogger<JobStatusService> _logger;
    private readonly TableClient _tableClient;

    public JobStatusService(
        ILogger<JobStatusService> logger,
        TableServiceClient tableServiceClient,
        IOptions<StorageOptions> options
    )
    {
        _logger = logger;
        var tableName = options.Value.JobStatusTableName ?? "translationjobs";
        _tableClient = tableServiceClient.GetTableClient(tableName);

        // Ensure table exists
        _ = Task.Run(async () =>
        {
            try
            {
                await _tableClient.CreateIfNotExistsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create table {TableName}", tableName);
            }
        });
    }

    public async Task<TranslationJobStatus?> GetJobStatusAsync(string jobId)
    {
        _logger.LogDebug("Getting job status for job: {JobId}", jobId);

        try
        {
            var response = await _tableClient.GetEntityIfExistsAsync<JobStatusEntity>("jobs", jobId);

            if (!response.HasValue)
            {
                _logger.LogDebug("Job status not found for job: {JobId}", jobId);
                return null;
            }

            var entity = response.Value;
            var status = new TranslationJobStatus
            {
                JobId = entity.JobId,
                Status = Enum.Parse<JobStatus>(entity.Status),
                Progress = entity.Progress,
                Message = entity.Message,
                CreatedAt = entity.CreatedAt,
                CompletedAt = entity.CompletedAt,
                TotalDocuments = entity.TotalDocuments,
                TotalCharacterCharged = entity.TotalCharacterCharged,
                CompletedDocuments = JsonSerializer.Deserialize<List<TranslatedDocument>>(entity.CompletedDocumentsJson) ?? new(),
                FailedDocuments = JsonSerializer.Deserialize<List<FailedDocument>>(entity.FailedDocumentsJson) ?? new()
            };

            _logger.LogInformation(
                "Successfully retrieved job status: {JobId}, Status: {Status}, Progress: {Progress}%",
                jobId,
                status.Status,
                status.Progress
            );

            return status;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting job status for job: {JobId}", jobId);
            throw;
        }
    }

    public async Task<ProcessingJob?> GetProcessingJobAsync(string jobId)
    {
        _logger.LogDebug("Getting processing job for job: {JobId}", jobId);

        try
        {
            var response = await _tableClient.GetEntityIfExistsAsync<JobStatusEntity>("jobs", jobId);

            if (!response.HasValue)
            {
                _logger.LogDebug("Processing job not found for job: {JobId}", jobId);
                return null;
            }

            var entity = response.Value;
            var job = new ProcessingJob
            {
                JobId = entity.JobId,
                SiteUrl = entity.SiteUrl,
                Status = Enum.Parse<JobStatus>(entity.Status),
                Progress = entity.Progress,
                Message = entity.Message,
                ErrorMessage = entity.ErrorMessage,
                CreatedAt = entity.CreatedAt,
                CompletedAt = entity.CompletedAt,
                RetryCount = entity.RetryCount,
                MaxRetries = entity.MaxRetries,
                UserAccessToken = entity.UserAccessToken,
                TotalDocuments = entity.TotalDocuments,
                TotalCharacterCharged = entity.TotalCharacterCharged,
                AzureTranslationJobId = entity.AzureTranslationJobId,
                Documents = JsonSerializer.Deserialize<List<DocumentInfo>>(entity.DocumentsJson) ?? new(),
                Options = JsonSerializer.Deserialize<TranslationOptions>(entity.OptionsJson) ?? new() { TargetLanguages = new() },
                Context = JsonSerializer.Deserialize<Models.RequestContext>(entity.ContextJson),
                CompletedDocuments = JsonSerializer.Deserialize<List<TranslatedDocument>>(entity.CompletedDocumentsJson) ?? new(),
                FailedDocuments = JsonSerializer.Deserialize<List<FailedDocument>>(entity.FailedDocumentsJson) ?? new()
            };

            return job;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting processing job for job: {JobId}", jobId);
            throw;
        }
    }

    public async Task CreateJobAsync(ProcessingJob job)
    {
        _logger.LogInformation("Creating new job: {JobId}", job.JobId);

        try
        {
            var entity = new JobStatusEntity
            {
                PartitionKey = "jobs",
                RowKey = job.JobId,
                JobId = job.JobId,
                Status = job.Status.ToString(),
                Progress = job.Progress,
                Message = job.Message ?? string.Empty,
                ErrorMessage = job.ErrorMessage,
                CreatedAt = job.CreatedAt,
                CompletedAt = job.CompletedAt,
                RetryCount = job.RetryCount,
                MaxRetries = job.MaxRetries,
                SiteUrl = job.SiteUrl ?? string.Empty,
                UserAccessToken = job.UserAccessToken ?? string.Empty,
                TotalDocuments = job.TotalDocuments,
                TotalCharacterCharged = job.TotalCharacterCharged,
                AzureTranslationJobId = job.AzureTranslationJobId,
                CompletedDocumentsJson = JsonSerializer.Serialize(job.CompletedDocuments ?? new()),
                FailedDocumentsJson = JsonSerializer.Serialize(job.FailedDocuments ?? new()),
                DocumentsJson = JsonSerializer.Serialize(job.Documents ?? new()),
                OptionsJson = JsonSerializer.Serialize(job.Options ?? new() { TargetLanguages = new List<string>() }),
                ContextJson = JsonSerializer.Serialize(job.Context)
            };

            await _tableClient.AddEntityAsync(entity);

            _logger.LogInformation("Successfully created job: {JobId}", job.JobId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating job: {JobId}", job.JobId);
            throw;
        }
    }

    public async Task UpdateJobStatusAsync(ProcessingJob job)
    {
        _logger.LogDebug(
            "Updating job status: {JobId}, Status: {Status}, Progress: {Progress}%",
            job.JobId,
            job.Status,
            job.Progress
        );

        // Retry logic for optimistic concurrency conflicts
        const int maxRetries = 3;
        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                // Get existing entity to preserve ETag for optimistic concurrency
                var existingResponse = await _tableClient.GetEntityIfExistsAsync<JobStatusEntity>("jobs", job.JobId);

                var entity = existingResponse.HasValue ? existingResponse.Value : new JobStatusEntity();

                // Update entity properties
                entity.PartitionKey = "jobs";
                entity.RowKey = job.JobId;
                entity.JobId = job.JobId;
                entity.Status = job.Status.ToString();
                entity.Progress = job.Progress;
                entity.Message = job.Message ?? string.Empty;
                entity.ErrorMessage = job.ErrorMessage;
                entity.CreatedAt = job.CreatedAt;
                entity.CompletedAt = job.CompletedAt;
                entity.RetryCount = job.RetryCount;
                entity.MaxRetries = job.MaxRetries;
                entity.SiteUrl = job.SiteUrl ?? string.Empty;
                entity.UserAccessToken = job.UserAccessToken ?? string.Empty;
                entity.TotalDocuments = job.TotalDocuments;
                entity.TotalCharacterCharged = job.TotalCharacterCharged;
                entity.AzureTranslationJobId = job.AzureTranslationJobId;

                // Serialize complex objects
                entity.CompletedDocumentsJson = JsonSerializer.Serialize(job.CompletedDocuments ?? new());
                entity.FailedDocumentsJson = JsonSerializer.Serialize(job.FailedDocuments ?? new());
                entity.DocumentsJson = JsonSerializer.Serialize(job.Documents ?? new());
                entity.OptionsJson = JsonSerializer.Serialize(job.Options ?? new() { TargetLanguages = new List<string>() });
                entity.ContextJson = JsonSerializer.Serialize(job.Context);

                // Use UpsertEntity with ETag for optimistic concurrency
                if (existingResponse.HasValue)
                {
                    await _tableClient.UpsertEntityAsync(entity, TableUpdateMode.Replace);
                }
                else
                {
                    await _tableClient.AddEntityAsync(entity);
                }

                _logger.LogInformation(
                    "Successfully updated job status: {JobId}, Status: {Status}, Progress: {Progress}%",
                    job.JobId,
                    job.Status,
                    job.Progress
                );
                return; // Success, exit retry loop
            }
            catch (RequestFailedException ex) when (ex.Status == 412 && attempt < maxRetries - 1)
            {
                _logger.LogWarning(
                    "Optimistic concurrency conflict updating job {JobId}, attempt {Attempt}/{MaxRetries}. Retrying...",
                    job.JobId,
                    attempt + 1,
                    maxRetries
                );

                await Task.Delay(100 * (attempt + 1));
                continue;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating job status for job: {JobId}", job.JobId);
                throw;
            }
        }

        throw new InvalidOperationException($"Failed to update job status for {job.JobId} after {maxRetries} attempts due to concurrency conflicts");
    }

    public async Task<bool> CancelJobAsync(string jobId)
    {
        _logger.LogInformation("Attempting to cancel job: {JobId}", jobId);

        try
        {
            var existingResponse = await _tableClient.GetEntityIfExistsAsync<JobStatusEntity>("jobs", jobId);

            if (!existingResponse.HasValue)
            {
                _logger.LogWarning("Cannot cancel job - job not found: {JobId}", jobId);
                return false;
            }

            var entity = existingResponse.Value;
            var currentStatus = Enum.Parse<JobStatus>(entity.Status);

            // Only allow cancellation of pending or running jobs
            if (currentStatus != JobStatus.Pending && currentStatus != JobStatus.Running)
            {
                _logger.LogWarning("Cannot cancel job in status {Status}: {JobId}", currentStatus, jobId);
                return false;
            }

            // Update status to cancelled
            entity.Status = JobStatus.Cancelled.ToString();
            entity.Message = "Job was cancelled by user request";
            entity.CompletedAt = DateTime.UtcNow;

            await _tableClient.UpsertEntityAsync(entity, TableUpdateMode.Replace);

            _logger.LogInformation("Successfully cancelled job: {JobId}", jobId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling job: {JobId}", jobId);
            throw;
        }
    }

    public async Task DeleteJobAsync(string jobId)
    {
        _logger.LogDebug("Deleting job: {JobId}", jobId);

        try
        {
            await _tableClient.DeleteEntityAsync("jobs", jobId);
            _logger.LogInformation("Successfully deleted job: {JobId}", jobId);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            _logger.LogWarning("Job not found for deletion: {JobId}", jobId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting job: {JobId}", jobId);
            throw;
        }
    }
}
