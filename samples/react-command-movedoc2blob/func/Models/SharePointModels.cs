namespace MoveDocs2Blob.Models;

/// <summary>
/// SharePoint document library information
/// </summary>
public class DocumentLibrary
{
    public string? Id { get; set; }
    public string? Title { get; set; }
    public string? Url { get; set; }

    public string? RootFolderName { get; set; }
    public int ItemCount { get; set; }
    public List<SharePointFile> Files { get; set; } = new();
}

/// <summary>
/// SharePoint file information
/// </summary>
public class SharePointFile
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Title { get; set; }
    public string? Url { get; set; }
    public long Size { get; set; }
    public string? ContentType { get; set; }
    public DateTime Created { get; set; }
    public DateTime Modified { get; set; }
    public string? CreatedBy { get; set; }
    public string? ModifiedBy { get; set; }
    public Dictionary<string, object>? Properties { get; set; }
}

/// <summary>
/// Response model for ShowMovedDocuments function
/// </summary>
public class ShowMovedDocumentsResponse
{
    public string? SiteUrl { get; set; }
    public IEnumerable<ArchivedDocument>? MovedDocuments { get; set; }
    public IEnumerable<DocumentLibrary>? DocumentLibraries { get; set; }
    public DateTime Timestamp { get; set; }
}
