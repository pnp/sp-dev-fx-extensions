using Azure.Data.Tables;
using Azure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocumentRedactionApp.Storage;

public class JobStatusEntity : ITableEntity
{
	public string PartitionKey { get; set; } = "jobs";
	public string RowKey { get; set; } = string.Empty; // Will be JobId
	public DateTimeOffset? Timestamp { get; set; }
	public ETag ETag { get; set; }

	// Job properties
	public string JobId { get; set; } = string.Empty;
	public string Status { get; set; } = string.Empty;
	public int Progress { get; set; }
	public string Message { get; set; } = string.Empty;
	public string? ErrorMessage { get; set; }
	public DateTime CreatedAt { get; set; }
	public DateTime? CompletedAt { get; set; }
	public int RetryCount { get; set; }
	public int MaxRetries { get; set; }

	// Serialized JSON for complex objects
	public string CompletedDocumentsJson { get; set; } = "[]";
	public string FailedDocumentsJson { get; set; } = "[]";
	public string DocumentsJson { get; set; } = "[]";
	public string OptionsJson { get; set; } = "{}";
	public string ContextJson { get; set; } = "{}";

	// Additional fields
	public string SiteUrl { get; set; } = string.Empty;
	public string UserAccessToken { get; set; } = string.Empty;
}