namespace DocumentRedactionApp.Models;

public enum MaskType
{
    EntityMask,
    CharacterMask,
}

public enum JobStatus
{
    Pending,
    Processing,
    Completed,
    Failed,
    Cancelled,
}

public class RedactionRequest
{
    public required string SiteUrl { get; set; }
    public required List<DocumentInfo> Documents { get; set; }
    public required RedactionOptionsData Options { get; set; }
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

public class RedactionOptionsData
{
    public MaskType MaskType { get; set; }
    public string? MaskCharacter { get; set; }
    public List<string>? SelectedCategories { get; set; }
    public bool IncludeAllCategories { get; set; }
}

public class RequestContext
{
    public required string UserId { get; set; }
    public required string WebId { get; set; }
    public required string TenantId { get; set; } // Required for On-Behalf-Of flow
    public required string ListId { get; set; }
}

public class RedactionResult
{
    public bool Success { get; set; }
    public required string JobId { get; set; }
    public required string Message { get; set; }
    public List<DocumentInfo>? ProcessedDocuments { get; set; }
    public List<string>? Errors { get; set; }
}

public class RedactionJobStatus
{
    public required string JobId { get; set; }
    public JobStatus Status { get; set; }
    public int Progress { get; set; }
    public string? Message { get; set; }
    public List<string> CompletedDocuments { get; set; } = new();
    public List<string> FailedDocuments { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class ProcessingJob
{
    public required string JobId { get; set; }
    public required string SiteUrl { get; set; }
    public required List<DocumentInfo> Documents { get; set; }
    public required RedactionOptionsData Options { get; set; }
    public RequestContext? Context { get; set; }
    public JobStatus Status { get; set; }
    public int Progress { get; set; }
    public string? Message { get; set; }
    public List<string> CompletedDocuments { get; set; } = new();
    public List<string> FailedDocuments { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string? UserAccessToken { get; set; } // Store user token for On-Behalf-Of flow
    public int RetryCount { get; set; } = 0; // Track number of retry attempts
    public int MaxRetries { get; set; } = 3; // Maximum number of retry attempts allowed
}

public class DocumentContent
{
    public required string FileName { get; set; }
    public required string Content { get; set; }
    public required string FileType { get; set; }
    public byte[]? OriginalBytes { get; set; }
}

public class RedactedEntity
{
    public required string Text { get; set; }
    public required string Category { get; set; }
    public int Offset { get; set; }
    public int Length { get; set; }
    public double ConfidenceScore { get; set; }
}

// Configuration Models
public class RedactionOptions
{
    public int MaxFileSizeBytes { get; set; } = 50 * 1024 * 1024; // 50MB
    public int MaxDocumentsPerJob { get; set; } = 20;
    public int JobTimeoutMinutes { get; set; } = 30;
    public List<string> SupportedFileTypes { get; set; } = new() { ".txt", ".pdf", ".docx" };
    public string TempContainerName { get; set; } = "redaction-temp";
    public bool DeleteTempFilesAfterProcessing { get; set; } = true;
}

/// <summary>
/// Represents the status of a document redaction job.
/// </summary>
public class DocumentRedactionJobStatus
{
    public string JobId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedDateTime { get; set; }
    public DateTime LastUpdatedDateTime { get; set; }
    public string? ExpirationDateTime { get; set; }
    public List<DocumentRedactionResult> Results { get; set; } = new();
    public List<DocumentRedactionError> Errors { get; set; } = new();

    // Task summary information
    public int TasksCompleted { get; set; }
    public int TasksFailed { get; set; }
    public int TasksInProgress { get; set; }
    public int TasksTotal { get; set; }
}

/// <summary>
/// Represents the result of a document redaction operation.
/// </summary>
public class DocumentRedactionResult
{
    public string DocumentId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? RedactedDocumentLocation { get; set; }
}

/// <summary>
/// Represents an error that occurred during document redaction.
/// </summary>
public class DocumentRedactionError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Target { get; set; }
}

public class AzureBlobItem
{
    public required string Name { get; set; }
    public required MemoryStream Stream { get; set; }
    public required string Url { get; set; }
}

public class AppInfo
{
    public required string ClientId { get; set; }
    public required string ClientSecret { get; set; }
}

public class CompletedDocument
{
	public string Name { get; set; } = string.Empty;
	public string Url { get; set; } = string.Empty;
	public DateTime CompletedAt { get; set; }
	public string? RedactedUrl { get; set; }
}