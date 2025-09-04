using Azure;
using Azure.Data.Tables;

namespace MoveDocs2Blob.Models;

/// <summary>
/// Table entity for storing archived document metadata
/// </summary>
public class MovedDocumentEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    
    // Document properties
    public string? DocumentId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? OriginalUrl { get; set; }
    public string? BlobUrl { get; set; }
    public string? ContainerName { get; set; }
    public string? LibraryName { get; set; }
    public string? FileName { get; set; }
    public long FileSize { get; set; }
    public string? ContentType { get; set; }
    public DateTime ArchivedDate { get; set; }
    public string? ArchivedBy { get; set; }
    public string? SiteUrl { get; set; }
    public string? ListId { get; set; }
    public string? ItemId { get; set; }
    public string? MetadataJson { get; set; } // JSON serialized metadata
    public ETag ETag { get; set; }

    public MovedDocumentEntity()
    {
    }

    public MovedDocumentEntity(string siteUrl, string documentId)
    {
        PartitionKey = GetPartitionKey(siteUrl);
        RowKey = documentId;
    }

    private static string GetPartitionKey(string siteUrl)
    {
        // Use a hash of the site URL as partition key for better distribution
        return Math.Abs(siteUrl.GetHashCode()).ToString();
    }
}
