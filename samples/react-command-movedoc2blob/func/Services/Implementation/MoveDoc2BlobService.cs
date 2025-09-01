using MoveDocs2Blob.Models;
using MoveDocs2Blob.Services;
using Microsoft.Extensions.Logging;

namespace MoveDocs2Blob.Services.Implementation;

/// <summary>
/// Service implementation that orchestrates document movement to blob operations
/// </summary>
public class MoveDoc2BlobService : IMoveDoc2BlobService
{
    private readonly ISharePointService _sharePointService;
    private readonly IBlobStorageService _blobStorageService;
    private readonly ITableStorageService _tableStorageService;
    private readonly ILogger<MoveDoc2BlobService> _logger;

    public MoveDoc2BlobService(
        ISharePointService sharePointService,
        IBlobStorageService blobStorageService,
        ITableStorageService tableStorageService,
        ILogger<MoveDoc2BlobService> logger)
    {
        _sharePointService = sharePointService;
        _blobStorageService = blobStorageService;
        _tableStorageService = tableStorageService;
        _logger = logger;
    }

    public async Task<MoveResult> MoveDocumentAsync( string siteUrl,string listId, string itemId,string userAccessToken)
    {
        try
        {
            _logger.LogInformation("Starting document archiving. SiteUrl: {SiteUrl}, ListId: {ListId}, ItemId: {ItemId}", 
                siteUrl, listId, itemId);

            // Generate unique document ID
            var documentId = $"{listId}-{itemId}";

            // Check if document is already archived
            if (await _tableStorageService.IsDocumentArchivedAsync(siteUrl, documentId))
            {
                _logger.LogWarning("Document is already moved. DocumentId: {DocumentId}", documentId);
                return new MoveResult
                {
                    Success = false,
                    Message = "Document is already moved"
                };
            }
            

            // Step 1: Get document metadata from SharePoint
            var sharePointFile = await _sharePointService.GetDocumentAsync(siteUrl, listId, itemId,userAccessToken);
            if (sharePointFile == null)
            {
                return new MoveResult
                {
                    Success = false,
                    Message = "Document not found in SharePoint"
                };
            }
            var fileServerRelativeURL  = new Uri(sharePointFile.Url!).AbsolutePath;

            // Step 2: Download document content
            using var documentStream = await _sharePointService.DownloadDocumentAsync(siteUrl, fileServerRelativeURL, userAccessToken);
            
            // Step 3: Create blob container based on site URL
            var containerName = _blobStorageService.GetContainerName(siteUrl);
            await _blobStorageService.CreateContainerIfNotExistsAsync(containerName);

            // Step 4: Generate blob file path (library name / file name)
            var libraryName = ExtractLibraryName(sharePointFile.Url!);
            var blobFileName = $"{libraryName}/{sharePointFile.Name}";

            // Step 5: Upload document to blob storage
            var blobUrl = await _blobStorageService.UploadDocumentAsync(
                containerName, 
                blobFileName, 
                documentStream, 
                sharePointFile.ContentType ?? "application/octet-stream");

            // Step 6: Upload metadata as JSON
            var metadataFileName = $"{libraryName}/{Path.GetFileNameWithoutExtension(sharePointFile.Name!)}_metadata";
            var metadataUrl = await _blobStorageService.UploadMetadataAsync(
                containerName, 
                metadataFileName, 
                sharePointFile.Properties ?? new Dictionary<string, object>());

            // Step 7: Create archived document record
            var archivedDocument = new ArchivedDocument
            {
                DocumentId = documentId,
                Title = sharePointFile.Title ?? sharePointFile.Name,
                Description = sharePointFile.Properties?.GetValueOrDefault("_dlc_DocIdUrl")?.ToString(),
                OriginalUrl = $"{siteUrl.TrimEnd('/')}{sharePointFile.Url}",
                BlobUrl = blobUrl,
                ContainerName = containerName,
                LibraryName = libraryName,
                FileName = sharePointFile.Name,
                FileSize = sharePointFile.Size,
                ContentType = sharePointFile.ContentType,
                ArchivedDate = DateTime.UtcNow,
                ArchivedBy = "System", // TODO: Get from user context
                SiteUrl = siteUrl,
                ListId = listId,
                ItemId = itemId,
                Metadata = sharePointFile.Properties
            };

            // Step 8: Store metadata in table storage
            var stored = await _tableStorageService.StoreArchivedDocumentAsync(archivedDocument);
            if (!stored)
            {
                _logger.LogWarning("Failed to store document metadata in table storage. DocumentId: {DocumentId}", 
                    documentId);
            }

            var result = new MoveResult
            {
                Success = true,
                Message = "Document archived successfully",
                BlobUrl = blobUrl,
                ContainerName = containerName,
                FileName = sharePointFile.Name,
                ArchivedDate = archivedDocument.ArchivedDate,
                ArchivedBy = archivedDocument.ArchivedBy
            };

            _logger.LogInformation("Document moved successfully. DocumentId: {DocumentId}, BlobUrl: {BlobUrl}", 
                documentId, blobUrl);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to move document. SiteUrl: {SiteUrl}, ListId: {ListId}, ItemId: {ItemId}", 
                siteUrl, listId, itemId);
            
            return new MoveResult
            {
                Success = false,
                Message = $"Archive operation failed: {ex.Message}"
            };
        }
    }

     public async Task<IEnumerable<ArchivedDocument>> GetMovedDocumentsAsync(string siteUrl, string userAccessToken)
    
    {
        try
        {
            _logger.LogInformation("Retrieving archived documents for site: {SiteUrl}", siteUrl);
            
            var archivedDocuments = await _tableStorageService.GetArchivedDocumentsAsync(siteUrl);
            
            _logger.LogInformation("Retrieved {Count} moved documents for site: {SiteUrl}", 
                archivedDocuments.Count(), siteUrl);
            
            return archivedDocuments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve archived documents for site: {SiteUrl}", siteUrl);
            throw;
        }
    }

    public async Task<IEnumerable<DocumentLibrary>> GetDocumentLibrariesAsync(string siteUrl,string userAccessToken)
    {
        try
        {
            _logger.LogInformation("Retrieving document libraries for site: {SiteUrl}", siteUrl);
            
            var libraries = await _sharePointService.GetDocumentLibrariesAsync(siteUrl, userAccessToken);
            
            // Optionally populate files for each library
            var librariesWithFiles = new List<DocumentLibrary>();
            foreach (var library in libraries)
            {
                try
                {
                    var files = await _sharePointService.GetLibraryFilesAsync(siteUrl, library.Id!, userAccessToken);
                    library.Files = files.ToList();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get files for library: {LibraryId}", library.Id);
                    library.Files = new List<SharePointFile>();
                }
                
                librariesWithFiles.Add(library);
            }
            
            _logger.LogInformation("Retrieved {Count} document libraries for site: {SiteUrl}", 
                librariesWithFiles.Count, siteUrl);
            
            return librariesWithFiles;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve document libraries for site: {SiteUrl}", siteUrl);
            throw;
        }
    }

    private static string ExtractLibraryName(string fileUrl)
    {
        // Extract library name from SharePoint file URL
        // Example: /sites/sitename/library/folder/file.pdf -> library
        try
        {
            var segments = fileUrl.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (segments.Length >= 3)
            {
                // Find the segment after "sites" and site name
                for (int i = 0; i < segments.Length - 1; i++)
                {
                    if (segments[i].Equals("sites", StringComparison.OrdinalIgnoreCase) && i + 2 < segments.Length)
                    {
                        return segments[i + 2]; // Library name is after site name
                    }
                }
            }
            
            // Fallback: use the second-to-last segment
            return segments.Length >= 2 ? segments[^2] : "Documents";
        }
        catch
        {
            return "Documents"; // Default library name
        }
    }

   
}
