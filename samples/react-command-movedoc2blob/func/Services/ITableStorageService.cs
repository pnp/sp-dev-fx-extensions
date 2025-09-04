using MoveDocs2Blob.Models;

namespace MoveDocs2Blob.Services;

/// <summary>
/// Interface for Azure Table Storage operations
/// </summary>
public interface ITableStorageService
{
    /// <summary>
    /// Stores archived document metadata in table storage
    /// </summary>
    /// <param name="archivedDocument">Archived document metadata</param>
    /// <returns>True if successfully stored</returns>
    Task<bool> StoreArchivedDocumentAsync(ArchivedDocument archivedDocument);

    /// <summary>
    /// Retrieves archived documents for a specific site
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <returns>Collection of archived documents</returns>
    Task<IEnumerable<ArchivedDocument>> GetArchivedDocumentsAsync(string siteUrl);

    /// <summary>
    /// Checks if a document is already archived
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <param name="documentId">Document identifier</param>
    /// <returns>True if document is already archived</returns>
    Task<bool> IsDocumentArchivedAsync(string siteUrl, string documentId);
}
