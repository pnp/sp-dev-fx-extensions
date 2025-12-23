namespace DocumentTranslationApp.Models;

public enum JobStatus
{
    Pending,
    Running,
    Processing,
    Completed,
    Failed,
    Cancelled,
}

public class TranslationRequest
{
    public required string SiteUrl { get; set; }
    public required List<DocumentInfo> Documents { get; set; }
    public required TranslationOptions Options { get; set; }
    public RequestContext? Context { get; set; }
    public string? UserAccessToken { get; set; } // Token from SPFx for On-Behalf-Of flow
}

public class DocumentInfo
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string ServerRelativeUrl { get; set; }
    public long Size { get; set; }
    public required string FileType { get; set; }
    public bool IsSupported { get; set; }
    public string? ErrorMessage { get; set; }
}

public class TranslationOptions
{
    public string? SourceLanguage { get; set; } // Optional for auto-detect
    public required List<string> TargetLanguages { get; set; }
}

public class RequestContext
{
    public required string UserId { get; set; }
    public required string WebId { get; set; }
    public required string TenantId { get; set; } // Required for On-Behalf-Of flow
    public required string ListId { get; set; }
}

public class TranslationResult
{
    public bool Success { get; set; }
    public required string JobId { get; set; }
    public required string Message { get; set; }
    public int EstimatedDocuments { get; set; }
    public List<string>? Errors { get; set; }
}

public class TranslatedDocument
{
    public required string OriginalName { get; set; }
    public required string TargetLanguage { get; set; }
    public required string TranslatedName { get; set; }
    public required string ServerRelativeUrl { get; set; }
    public int CharacterCount { get; set; }
}

public class FailedDocument
{
    public required string Name { get; set; }
    public required string TargetLanguage { get; set; }
    public required string Error { get; set; }
}

public class TranslationJobStatus
{
    public required string JobId { get; set; }
    public JobStatus Status { get; set; }
    public int Progress { get; set; }
    public string? Message { get; set; }
    public List<TranslatedDocument> CompletedDocuments { get; set; } = new();
    public List<FailedDocument> FailedDocuments { get; set; } = new();
    public int TotalDocuments { get; set; }
    public long TotalCharacterCharged { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class ProcessingJob
{
    public required string JobId { get; set; }
    public required string SiteUrl { get; set; }
    public required List<DocumentInfo> Documents { get; set; }
    public required TranslationOptions Options { get; set; }
    public RequestContext? Context { get; set; }
    public JobStatus Status { get; set; }
    public int Progress { get; set; }
    public string? Message { get; set; }
    public List<TranslatedDocument> CompletedDocuments { get; set; } = new();
    public List<FailedDocument> FailedDocuments { get; set; } = new();
    public int TotalDocuments { get; set; }
    public long TotalCharacterCharged { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string? UserAccessToken { get; set; } // Store user token for On-Behalf-Of flow
    public string? AzureTranslationJobId { get; set; } // Azure Document Translation API job ID
    public int RetryCount { get; set; } = 0;
    public int MaxRetries { get; set; } = 3;
}

public class DocumentContent
{
    public required string FileName { get; set; }
    public required byte[] Bytes { get; set; }
    public required string FileType { get; set; }
    public required string ContentType { get; set; }
}

// Azure Document Translation API Models
public class AzureTranslationBatchRequest
{
    public required List<AzureTranslationInput> Inputs { get; set; }
}

public class AzureTranslationInput
{
    public required AzureTranslationSource Source { get; set; }
    public required List<AzureTranslationTarget> Targets { get; set; }
}

public class AzureTranslationSource
{
    public required string SourceUrl { get; set; }
    public string? Language { get; set; } // Optional for auto-detect
    public string StorageSource { get; set; } = "AzureBlob";
}

public class AzureTranslationTarget
{
    public required string TargetUrl { get; set; }
    public required string Language { get; set; }
    public string StorageSource { get; set; } = "AzureBlob";
}

public class AzureTranslationBatchResponse
{
    public required string Id { get; set; }
    public required DateTime CreatedDateTimeUtc { get; set; }
    public required DateTime LastActionDateTimeUtc { get; set; }
    public required string Status { get; set; }
    public required AzureTranslationSummary Summary { get; set; }
}

public class AzureTranslationSummary
{
    public int Total { get; set; }
    public int Failed { get; set; }
    public int Success { get; set; }
    public int InProgress { get; set; }
    public int NotYetStarted { get; set; }
    public int Cancelled { get; set; }
    public long TotalCharacterCharged { get; set; }
}

public class AzureBlobItem
{
    public required string Name { get; set; }
    public required MemoryStream Stream { get; set; }
    public required string Url { get; set; }
}

public class DocumentTranslationJobStatus
{
	public string JobId { get; set; } = string.Empty;
	public string Status { get; set; } = string.Empty;
	public DateTime CreatedDateTime { get; set; }
	public DateTime LastUpdatedDateTime { get; set; }
	public string? ExpirationDateTime { get; set; }
	public List<DocumentTranslationResult> Results { get; set; } = new();
	public List<DocumentTranslationError> Errors { get; set; } = new();

	public long TotalCharacterCharged { get; set; }

	// Task summary information
	public int TasksCompleted { get; set; }
	public int TasksFailed { get; set; }
	public int TasksInProgress { get; set; }
	public int TasksTotal { get; set; }

	// Top-level error information (for ValidationFailed status)
	public string? ErrorCode { get; set; }
	public string? ErrorMessage { get; set; }
	public string? ErrorTarget { get; set; }

}

public class DocumentTranslationResult
{
    public required string DocumentId { get; set; }
    public required string Status { get; set; }
    public string? Path { get; set; }
	public string? TranslatedDocumentLocation { get; set; }
}

public class AppInfo
{
    public required string ClientId { get; set; }
    public required string ClientSecret { get; set; }
}

// Configuration Models
public class TranslationConfiguration
{
    public int MaxFileSizeBytes { get; set; } = 40 * 1024 * 1024; // 40MB (Azure limit)
    public int MaxDocumentsPerJob { get; set; } = 50;
    public int JobTimeoutMinutes { get; set; } = 60;
    public List<string> SupportedFileTypes { get; set; } = new()
    {
        ".docx", ".xlsx", ".pptx", ".pdf", ".html", ".htm",
        ".txt", ".md", ".msg", ".odt", ".ods", ".odp"
    };
    public string SourceContainerName { get; set; } = "translation-source";
    public string TargetContainerPrefix { get; set; } = "translation-target-";
    public bool DeleteBlobsAfterProcessing { get; set; } = true;
    public int BlobSasExpiryHours { get; set; } = 2;
    public int StatusPollingIntervalSeconds { get; set; } = 5;
}

/// <summary>
/// Represents an error that occurred during document translation.
/// </summary>
public class DocumentTranslationError
{
	public string Code { get; set; } = string.Empty;
	public string Message { get; set; } = string.Empty;
	public string? Target { get; set; }
}
