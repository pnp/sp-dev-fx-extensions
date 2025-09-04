using MoveDocs2Blob.Models;
using MoveDocs2Blob.Services;
using Azure.Data.Tables;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace MoveDocs2Blob.Services.Implementation;

/// <summary>
/// Azure Table Storage service implementation
/// </summary>
public class TableStorageService : ITableStorageService
{
    private readonly TableClient _tableClient;
    private readonly ILogger<TableStorageService> _logger;
    private const string TableName = "ArchivedDocuments";

    public TableStorageService(TableServiceClient tableServiceClient, ILogger<TableStorageService> logger)
    {
        _tableClient = tableServiceClient.GetTableClient(TableName);
        _logger = logger;
        
        // Ensure table exists
        _tableClient.CreateIfNotExists();
    }

    public async Task<bool> StoreArchivedDocumentAsync(ArchivedDocument archivedDocument)
    {
        try
        {
            var entity = new MovedDocumentEntity(archivedDocument.SiteUrl!, archivedDocument.DocumentId!)
            {
                DocumentId = archivedDocument.DocumentId,
                Title = archivedDocument.Title,
                Description = archivedDocument.Description,
                OriginalUrl = archivedDocument.OriginalUrl,
                BlobUrl = archivedDocument.BlobUrl,
                ContainerName = archivedDocument.ContainerName,
                LibraryName = archivedDocument.LibraryName,
                FileName = archivedDocument.FileName,
                FileSize = archivedDocument.FileSize,
                ContentType = archivedDocument.ContentType,
                ArchivedDate = archivedDocument.ArchivedDate,
                ArchivedBy = archivedDocument.ArchivedBy,
                SiteUrl = archivedDocument.SiteUrl,
                ListId = archivedDocument.ListId,
                ItemId = archivedDocument.ItemId,
                MetadataJson = archivedDocument.Metadata != null 
                    ? JsonSerializer.Serialize(archivedDocument.Metadata) 
                    : null
            };

            await _tableClient.UpsertEntityAsync(entity);
            _logger.LogInformation("Archived document metadata stored successfully. DocumentId: {DocumentId}", 
                archivedDocument.DocumentId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to store archived document metadata. DocumentId: {DocumentId}", 
                archivedDocument.DocumentId);
            return false;
        }
    }

    public async Task<IEnumerable<ArchivedDocument>> GetArchivedDocumentsAsync(string siteUrl)
    {
        try
        {
            var partitionKey = GetPartitionKey(siteUrl);
            var query = _tableClient.QueryAsync<MovedDocumentEntity>(
                entity => entity.PartitionKey == partitionKey);

            var archivedDocuments = new List<ArchivedDocument>();

            await foreach (var entity in query)
            {
                var archivedDocument = new ArchivedDocument
                {
                    DocumentId = entity.DocumentId,
                    Title = entity.Title,
                    Description = entity.Description,
                    OriginalUrl = entity.OriginalUrl,
                    BlobUrl = entity.BlobUrl,
                    ContainerName = entity.ContainerName,
                    LibraryName = entity.LibraryName,
                    FileName = entity.FileName,
                    FileSize = entity.FileSize,
                    ContentType = entity.ContentType,
                    ArchivedDate = entity.ArchivedDate,
                    ArchivedBy = entity.ArchivedBy,
                    SiteUrl = entity.SiteUrl,
                    ListId = entity.ListId,
                    ItemId = entity.ItemId,
                    Metadata = !string.IsNullOrEmpty(entity.MetadataJson)
                        ? JsonSerializer.Deserialize<Dictionary<string, object>>(entity.MetadataJson)
                        : null
                };

                archivedDocuments.Add(archivedDocument);
            }

            _logger.LogInformation("Retrieved {Count} archived documents for site: {SiteUrl}", 
                archivedDocuments.Count, siteUrl);
            return archivedDocuments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve archived documents for site: {SiteUrl}", siteUrl);
            throw;
        }
    }

    public async Task<bool> IsDocumentArchivedAsync(string siteUrl, string documentId)
    {
        try
        {
            var partitionKey = GetPartitionKey(siteUrl);
            var entity = await _tableClient.GetEntityIfExistsAsync<MovedDocumentEntity>(partitionKey, documentId);
            
            var exists = entity.HasValue;
            _logger.LogDebug("Document archived status check. DocumentId: {DocumentId}, Exists: {Exists}", 
                documentId, exists);
            return exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check if document is archived. DocumentId: {DocumentId}", documentId);
            return false;
        }
    }

    private static string GetPartitionKey(string siteUrl)
    {
        // Use a hash of the site URL as partition key for better distribution
        return Math.Abs(siteUrl.GetHashCode()).ToString();
    }
}
