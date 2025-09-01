namespace MoveDocs2Blob.Models;

/// <summary>
/// Represents an archived document with its metadata
/// </summary>
public class ArchivedDocument
{
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
    public Dictionary<string, object>? Metadata { get; set; }
}
