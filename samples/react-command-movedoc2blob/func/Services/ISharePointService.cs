using MoveDocs2Blob.Models;

namespace MoveDocs2Blob.Services;

/// <summary>
/// Interface for SharePoint operations
/// </summary>
public interface ISharePointService
{
    /// <summary>
    /// Gets document metadata and content from SharePoint
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <param name="listId">List/library identifier</param>
    /// <param name="itemId">Item identifier</param>
    /// <param name="userAccessToken">Optional user access token for on-behalf-of operations</param>
    /// <returns>SharePoint file information</returns>
    Task<SharePointFile> GetDocumentAsync(string siteUrl, string listId, string itemId, string userAccessToken);

    /// <summary>
    /// Downloads document content from SharePoint
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <param name="fileUrl">File URL</param>
    /// <param name="userAccessToken">Optional user access token for on-behalf-of operations</param>
    /// <returns>File content stream</returns>
    Task<Stream> DownloadDocumentAsync(string siteUrl, string fileUrl, string userAccessToken);

    /// <summary>
    /// Gets all document libraries from a SharePoint site
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <param name="userAccessToken">Optional user access token for on-behalf-of operations</param>
    /// <returns>Collection of document libraries</returns>
    Task<IEnumerable<DocumentLibrary>> GetDocumentLibrariesAsync(string siteUrl, string userAccessToken);

    /// <summary>
    /// Gets all files from a specific document library
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <param name="libraryId">Library identifier</param>
    /// <param name="userAccessToken">Optional user access token for on-behalf-of operations</param>
    /// <returns>Collection of files</returns>
    Task<IEnumerable<SharePointFile>> GetLibraryFilesAsync(string siteUrl, string libraryId, string userAccessToken);
}
