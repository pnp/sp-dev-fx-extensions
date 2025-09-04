using MoveDocs2Blob.Services;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace MoveDocs2Blob.Services.Implementation;

/// <summary>
/// Azure Blob Storage service implementation
/// </summary>
public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly ILogger<BlobStorageService> _logger;

    public BlobStorageService(BlobServiceClient blobServiceClient, ILogger<BlobStorageService> logger)
    {
        _blobServiceClient = blobServiceClient;
        _logger = logger;
    }

    public async Task<string> UploadDocumentAsync(string containerName, string fileName, Stream content, string contentType)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            var options = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = contentType
                },
                Metadata = new Dictionary<string, string>
                {
                    ["UploadedAt"] = DateTime.UtcNow.ToString("O"),
                    ["Source"] = "SharePoint"
                }
            };

            content.Position = 0;
            await blobClient.UploadAsync(content, options);

            _logger.LogInformation("Document uploaded successfully to blob: {BlobUrl}", blobClient.Uri);
            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload document to blob storage. Container: {Container}, File: {FileName}", 
                containerName, fileName);
            throw;
        }
    }

    public async Task<string> UploadMetadataAsync(string containerName, string fileName, object metadata)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient($"{fileName}.json");

            var jsonContent = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var contentBytes = Encoding.UTF8.GetBytes(jsonContent);
            using var contentStream = new MemoryStream(contentBytes);

            var options = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = "application/json"
                },
                Metadata = new Dictionary<string, string>
                {
                    ["MetadataFile"] = "true",
                    ["UploadedAt"] = DateTime.UtcNow.ToString("O")
                }
            };

            await blobClient.UploadAsync(contentStream, options);

            _logger.LogInformation("Metadata uploaded successfully to blob: {BlobUrl}", blobClient.Uri);
            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload metadata to blob storage. Container: {Container}, File: {FileName}", 
                containerName, fileName);
            throw;
        }
    }

    public async Task<bool> CreateContainerIfNotExistsAsync(string containerName)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var response = await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            if (response != null)
            {
                _logger.LogInformation("Created new blob container: {ContainerName}", containerName);
                return true;
            }

            _logger.LogDebug("Blob container already exists: {ContainerName}", containerName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create blob container: {ContainerName}", containerName);
            return false;
        }
    }

    public string GetContainerName(string siteUrl)
    {
        // Extract relevant parts from SharePoint site URL and create a valid container name
        try
        {
            var uri = new Uri(siteUrl);
            var segments = uri.Segments
                .Where(s => !string.IsNullOrWhiteSpace(s) && s != "/")
                .Select(s => s.Trim('/'))
                .Where(s => !string.IsNullOrEmpty(s))
                .ToArray();

            var containerName = string.Join("-", segments)
                .ToLowerInvariant()
                .Replace(" ", "-");

            // Ensure container name meets Azure requirements (3-63 chars, alphanumeric and hyphens only)
            containerName = Regex.Replace(containerName, "[^a-z0-9-]", "");
            containerName = Regex.Replace(containerName, "-+", "-");
            containerName = containerName.Trim('-');

            if (containerName.Length < 3)
            {
                containerName = $"sp-archive-{Math.Abs(siteUrl.GetHashCode())}";
            }
            else if (containerName.Length > 63)
            {
                containerName = containerName.Substring(0, 60) + Math.Abs(siteUrl.GetHashCode()).ToString()[..3];
            }

            _logger.LogDebug("Generated container name: {ContainerName} for site: {SiteUrl}", containerName, siteUrl);
            return containerName;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate container name from site URL: {SiteUrl}", siteUrl);
            return $"sp-archive-{Math.Abs(siteUrl.GetHashCode())}";
        }
    }
}
