namespace MoveDocs2Blob.Models;

/// <summary>
/// Result of document archiving operation
/// </summary>
public class MoveResult
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? BlobUrl { get; set; }
    public string? ContainerName { get; set; }
    public string? FileName { get; set; }
    public DateTime ArchivedDate { get; set; }
    public string? ArchivedBy { get; set; }
}
