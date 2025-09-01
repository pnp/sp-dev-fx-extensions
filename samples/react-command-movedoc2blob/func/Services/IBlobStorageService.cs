using MoveDocs2Blob.Models;

namespace MoveDocs2Blob.Services;

/// <summary>
/// Interface for Azure Blob Storage operations
/// </summary>
public interface IBlobStorageService
{
    /// <summary>
    /// Uploads a document to blob storage
    /// </summary>
    /// <param name="containerName">Blob container name</param>
    /// <param name="fileName">File name in blob storage</param>
    /// <param name="content">File content stream</param>
    /// <param name="contentType">Content type of the file</param>
    /// <returns>Blob URL</returns>
    Task<string> UploadDocumentAsync(string containerName, string fileName, Stream content, string contentType);

    /// <summary>
    /// Uploads metadata as JSON to blob storage
    /// </summary>
    /// <param name="containerName">Blob container name</param>
    /// <param name="fileName">JSON file name</param>
    /// <param name="metadata">Metadata object to serialize</param>
    /// <returns>JSON blob URL</returns>
    Task<string> UploadMetadataAsync(string containerName, string fileName, object metadata);

    /// <summary>
    /// Creates a blob container if it doesn't exist
    /// </summary>
    /// <param name="containerName">Container name</param>
    /// <returns>True if container was created or already exists</returns>
    Task<bool> CreateContainerIfNotExistsAsync(string containerName);

    /// <summary>
    /// Gets the container name based on site URL
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <returns>Container name</returns>
    string GetContainerName(string siteUrl);
}
