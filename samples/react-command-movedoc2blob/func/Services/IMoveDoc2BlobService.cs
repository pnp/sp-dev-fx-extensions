using MoveDocs2Blob.Models;

namespace MoveDocs2Blob.Services;

/// <summary>
/// Interface for document movement to blob operations
/// </summary>
public interface IMoveDoc2BlobService
{
    /// <summary>
    /// Moves a SharePoint document to blob storage
    /// </summary>
    /// <param name="listId">SharePoint list/library identifier</param>
    /// <param name="itemId">Document item identifier</param>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <returns>Archive operation result</returns>
    Task<MoveResult> MoveDocumentAsync(string siteUrl,string listId, string itemId, string userAccessToken);

    /// <summary>
    /// Retrieves moved documents for a SharePoint site
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <returns>Collection of archived documents</returns>
    Task<IEnumerable<ArchivedDocument>> GetMovedDocumentsAsync(string siteUrl,string userAccessToken);

    /// <summary>
    /// Gets all document libraries from a SharePoint site
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <returns>Collection of document libraries</returns>
    Task<IEnumerable<DocumentLibrary>> GetDocumentLibrariesAsync(string siteUrl,string userAccessToken);
}
