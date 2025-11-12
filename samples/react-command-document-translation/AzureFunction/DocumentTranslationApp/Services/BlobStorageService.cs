using Azure;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using DocumentTranslationApp.Models;
using DocumentTranslationApp.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text;

namespace DocumentTranslationApp.Services;

public interface IBlobStorageService
{
    Task<string> UploadDocumentAsync(string containerName, string blobName, byte[] content);
    Task<string> UploadBlobAsync(string sourceFolderId, string containerName, string blobName, byte[] content);
    Task<byte[]> DownloadDocumentAsync(string containerName, string blobName);
    Task<List<string>> ListDocumentsAsync(string containerName, string? prefix = null);
    Task DeleteDocumentAsync(string containerName, string blobName);
    Task DeleteContainerAsync(string containerName);
    Task<bool> ContainerExistsAsync(string containerName);
    Task EnsureContainerExistsAsync(string containerName);
    Task<string> GenerateContainerSasTokenAsync(string containerName, BlobContainerSasPermissions permissions, int expiryHours);
    Task<string> GetContainerUrlWithSasAsync(string containerName, BlobContainerSasPermissions permissions, int expiryHours);
    Task<string> GetContainerSasUrlAsync(string containerName, bool write = false);
    Task<Dictionary<string, MemoryStream?>> DownloadFromUrlsBatchAsync(List<string> blobUrls);
    Task CleanupRedactionOutputAsync(string folderId, string containerName);
}

public class BlobStorageService : IBlobStorageService
{
    private readonly ILogger<BlobStorageService> _logger;
    private readonly BlobServiceClient _blobServiceClient;
    private readonly StorageOptions _options;

    public BlobStorageService(
        IOptions<StorageOptions> options,
        ILogger<BlobStorageService> logger)
    {
        _options = options.Value;
        _logger = logger;
        _blobServiceClient = new BlobServiceClient(_options.ConnectionString);
    }

    public async Task<string> UploadDocumentAsync(string containerName, string blobName, byte[] content)
    {
        _logger.LogInformation("Uploading document: {ContainerName}/{BlobName} ({Size} bytes)",
            containerName, blobName, content.Length);

        try
        {
            await EnsureContainerExistsAsync(containerName);

            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            using var stream = new MemoryStream(content);
            await blobClient.UploadAsync(stream, overwrite: true);

            _logger.LogInformation("Successfully uploaded: {ContainerName}/{BlobName}",
                containerName, blobName);

            return blobClient.Uri.AbsoluteUri;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document: {ContainerName}/{BlobName}",
                containerName, blobName);
            throw;
        }
    }

    public async Task<byte[]> DownloadDocumentAsync(string containerName, string blobName)
    {
        _logger.LogInformation("Downloading document: {ContainerName}/{BlobName}",
            containerName, blobName);

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            var response = await blobClient.DownloadContentAsync();
            var content = response.Value.Content.ToArray();

            _logger.LogInformation("Successfully downloaded: {ContainerName}/{BlobName} ({Size} bytes)",
                containerName, blobName, content.Length);

            return content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading document: {ContainerName}/{BlobName}",
                containerName, blobName);
            throw;
        }
    }

    public async Task<List<string>> ListDocumentsAsync(string containerName, string? prefix = null)
    {
        _logger.LogInformation("Listing documents in container: {ContainerName}, prefix: {Prefix}",
            containerName, prefix ?? "none");

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobNames = new List<string>();

            await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: prefix))
            {
                blobNames.Add(blobItem.Name);
            }

            _logger.LogInformation("Found {Count} documents in {ContainerName}",
                blobNames.Count, containerName);

            return blobNames;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing documents in container: {ContainerName}",
                containerName);
            throw;
        }
    }

    public async Task DeleteDocumentAsync(string containerName, string blobName)
    {
        _logger.LogInformation("Deleting document: {ContainerName}/{BlobName}",
            containerName, blobName);

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            await blobClient.DeleteIfExistsAsync();

            _logger.LogInformation("Successfully deleted: {ContainerName}/{BlobName}",
                containerName, blobName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document: {ContainerName}/{BlobName}",
                containerName, blobName);
            throw;
        }
    }

    public async Task DeleteContainerAsync(string containerName)
    {
        _logger.LogInformation("Deleting container: {ContainerName}", containerName);

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.DeleteIfExistsAsync();

            _logger.LogInformation("Successfully deleted container: {ContainerName}", containerName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting container: {ContainerName}", containerName);
            throw;
        }
    }

    public async Task<bool> ContainerExistsAsync(string containerName)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            return await containerClient.ExistsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking container existence: {ContainerName}", containerName);
            return false;
        }
    }

    public async Task EnsureContainerExistsAsync(string containerName)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            _logger.LogInformation("Container exists or created: {ContainerName}", containerName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ensuring container exists: {ContainerName}", containerName);
            throw;
        }
    }

    public async Task<string> GenerateContainerSasTokenAsync(
        string containerName,
        BlobContainerSasPermissions permissions,
        int expiryHours)
    {
        _logger.LogInformation("Generating SAS token for container: {ContainerName}, permissions: {Permissions}, expiry: {Hours}h",
            containerName, permissions, expiryHours);

        try
        {
            await EnsureContainerExistsAsync(containerName);

            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

            // Check if we can generate SAS tokens (requires account key)
            if (!containerClient.CanGenerateSasUri)
            {
                throw new InvalidOperationException(
                    "Cannot generate SAS token. Ensure the storage account is configured with account key, not just connection string.");
            }

            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = containerName,
                Resource = "c", // Container
                StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5), // Account for clock skew
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(expiryHours)
            };

            sasBuilder.SetPermissions(permissions);

            var sasToken = containerClient.GenerateSasUri(sasBuilder).Query;

            _logger.LogInformation("Successfully generated SAS token for: {ContainerName}", containerName);

            return sasToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating SAS token for container: {ContainerName}", containerName);
            throw;
        }
    }

    public async Task<string> GetContainerUrlWithSasAsync(
        string containerName,
        BlobContainerSasPermissions permissions,
        int expiryHours)
    {
        _logger.LogInformation("Getting container URL with SAS: {ContainerName}", containerName);

        try
        {
            await EnsureContainerExistsAsync(containerName);

            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var sasToken = await GenerateContainerSasTokenAsync(containerName, permissions, expiryHours);

            var urlWithSas = $"{containerClient.Uri.AbsoluteUri}{sasToken}";

            _logger.LogInformation("Generated container URL with SAS for: {ContainerName}", containerName);

            return urlWithSas;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting container URL with SAS: {ContainerName}", containerName);
            throw;
        }
    }

    public async Task<string> UploadBlobAsync(string sourceFolderId, string containerName, string blobName, byte[] content)
    {
        _logger.LogInformation("Uploading blob to folder: {FolderId}/{ContainerName}/{BlobName}",
            sourceFolderId, containerName, blobName);

        try
        {
            await EnsureContainerExistsAsync(containerName);

            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var fullBlobName = $"{sourceFolderId}/{blobName}";
            var blobClient = containerClient.GetBlobClient(fullBlobName);

            using var stream = new MemoryStream(content);
            await blobClient.UploadAsync(stream, overwrite: true);

            // Return URL based on authentication method
            if (_options.UseManagedIdentity)
            {
                _logger.LogInformation("Successfully uploaded blob (managed identity): {BlobName}", fullBlobName);
                return blobClient.Uri.AbsoluteUri; // Return plain URL for managed identity
            }
            else
            {
                // Generate SAS URL for the uploaded blob
                var sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = containerName,
                    BlobName = fullBlobName,
                    Resource = "b",
                    StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5),
                    ExpiresOn = DateTimeOffset.UtcNow.AddHours(2)
                };
                sasBuilder.SetPermissions(BlobSasPermissions.Read);

                var sasUri = blobClient.GenerateSasUri(sasBuilder);

                _logger.LogInformation("Successfully uploaded blob with SAS: {BlobName}", fullBlobName);
                return sasUri.AbsoluteUri;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading blob: {FolderId}/{BlobName}", sourceFolderId, blobName);
            throw;
        }
    }

    public async Task<string> GetContainerSasUrlAsync(string containerName, bool write = false)
    {
        // For managed identity, return plain container URL without SAS
        if (_options.UseManagedIdentity)
        {
            await EnsureContainerExistsAsync(containerName);
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            
            _logger.LogInformation("Returning plain container URL for managed identity: {ContainerName}", containerName);
            return containerClient.Uri.AbsoluteUri;
        }
        
        // For SAS authentication, generate SAS token
        var permissions = write
            ? BlobContainerSasPermissions.Read | BlobContainerSasPermissions.Write | BlobContainerSasPermissions.List | BlobContainerSasPermissions.Create
            : BlobContainerSasPermissions.Read | BlobContainerSasPermissions.List;

        return await GetContainerUrlWithSasAsync(containerName, permissions, 2);
    }

	public async Task<Dictionary<string, MemoryStream?>> DownloadFromUrlsBatchAsync(
		List<string> blobUrls
	)
	{
		var results = new Dictionary<string, MemoryStream?>();

		try
		{
			this._logger.LogInformation("Starting batch download of {Count} blobs", blobUrls.Count);

			// Process downloads in parallel with limited concurrency
			var semaphore = new SemaphoreSlim(5, 5); // Limit to 5 concurrent downloads
			var downloadTasks = blobUrls.Select(async url =>
			{
				await semaphore.WaitAsync();
				try
				{
					var result = await this.DownloadFromUrlAsync(url);
					return new { Url = url, Stream = result };
				}
				finally
				{
					semaphore.Release();
				}
			});

			var downloadResults = await Task.WhenAll(downloadTasks);

			foreach (var result in downloadResults)
			{
				results[result.Url] = result.Stream;
			}

			var successCount = results.Values.Count(s => s != null);
			this._logger.LogInformation(
				"Completed batch download: {SuccessCount}/{TotalCount} successful",
				successCount,
				blobUrls.Count
			);

			return results;
		}
		catch (Exception ex)
		{
			this._logger.LogError(ex, "Error during batch blob download");
			throw;
		}
	}

	public async Task CleanupRedactionOutputAsync(string folderId, string containerName)
    {
        _logger.LogInformation("Cleaning up folder: {FolderId} in container: {ContainerName}",
            folderId, containerName);

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var exists = await containerClient.ExistsAsync();

            if (!exists)
            {
                _logger.LogWarning("Container {ContainerName} does not exist, skipping cleanup", containerName);
                return;
            }

            var deletedCount = 0;
            await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: folderId))
            {
                var blobClient = containerClient.GetBlobClient(blobItem.Name);
                await blobClient.DeleteIfExistsAsync();
                deletedCount++;
            }

            _logger.LogInformation("Cleaned up {Count} blobs from folder: {FolderId}", deletedCount, folderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up folder: {FolderId} in container: {ContainerName}",
                folderId, containerName);
            throw;
        }
    }

	/// <summary>
	/// Downloads a blob from a complete URL (including container and storage account)
	/// </summary>
	/// <param name="blobUrl">The complete URL to the blob</param>
	/// <returns>MemoryStream containing the blob data</returns>
	public async Task<MemoryStream?> DownloadFromUrlAsync(string blobUrl)
	{
		try
		{
			this._logger.LogDebug("Downloading blob from URL: {BlobUrl}", blobUrl);

			// First try using the same connection string (in case it's the same storage account)
			var blobServiceClient = new BlobServiceClient(this._options.ConnectionString);
			var uri = new Uri(blobUrl, UriKind.Absolute);

			// Extract container and blob name from URL
			var pathParts = uri.AbsolutePath.TrimStart('/').Split('/');
			if (pathParts.Length < 2)
			{
				this._logger.LogError("Invalid blob URL format: {BlobUrl}", blobUrl);
				return null;
			}

			var containerName = pathParts[0];
			var blobName = Uri.UnescapeDataString(string.Join("/", pathParts.Skip(1)));

			this._logger.LogDebug(
				"Parsed URL - Container: {Container}, Blob: {BlobName}",
				containerName,
				blobName
			);

			try
			{
				// Try with the configured connection string first
				var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
				var blobClient = containerClient.GetBlobClient(blobName);

				// Check if the blob exists
				var exists = await blobClient.ExistsAsync();
				if (exists.Value)
				{
					// Download the blob to a MemoryStream
					var downloadStream = new MemoryStream();
					await blobClient.DownloadToAsync(downloadStream);

					// Reset position to beginning for reading
					downloadStream.Position = 0;

					this._logger.LogDebug(
						"Successfully downloaded blob using connection string: {BlobUrl}, Size: {Size} bytes",
						blobUrl,
						downloadStream.Length
					);

					return downloadStream;
				}
			}
			catch (RequestFailedException ex) when (ex.Status == 404 || ex.Status == 403)
			{
				this._logger.LogDebug(
					"Blob not accessible with configured connection string, trying direct URL access: {ErrorCode}",
					ex.ErrorCode
				);
			}

			// If that fails, try creating a BlobClient directly from the URL (for public access or SAS)
			var directBlobClient = new BlobClient(new Uri(blobUrl));
			var directExists = await directBlobClient.ExistsAsync();

			if (!directExists.Value)
			{
				this._logger.LogWarning("Blob does not exist at URL: {BlobUrl}", blobUrl);
				return null;
			}

			// Download the blob to a MemoryStream
			var directDownloadStream = new MemoryStream();
			await directBlobClient.DownloadToAsync(directDownloadStream);

			// Reset position to beginning for reading
			directDownloadStream.Position = 0;

			this._logger.LogDebug(
				"Successfully downloaded blob using direct URL access: {BlobUrl}, Size: {Size} bytes",
				blobUrl,
				directDownloadStream.Length
			);

			return directDownloadStream;
		}
		catch (RequestFailedException ex)
		{
			this._logger.LogError(
				ex,
				"Azure request failed while downloading blob from URL {BlobUrl}: {ErrorCode} - {Message}",
				blobUrl,
				ex.ErrorCode,
				ex.Message
			);
			return null;
		}
		catch (Exception ex)
		{
			this._logger.LogError(
				ex,
				"Error downloading blob from URL {BlobUrl}: {Message}",
				blobUrl,
				ex.Message
			);
			return null;
		}
	}
}
