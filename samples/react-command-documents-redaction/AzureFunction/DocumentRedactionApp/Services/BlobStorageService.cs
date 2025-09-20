using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using DocumentRedactionApp.Models;
using DocumentRedactionApp.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DocumentRedactionApp.Services;

public interface IBlobStorageService
{
	Task<string> UploadBlobAsync(
		string sourceFolderId,
		string containerName,
		string blobName,
		string content
	);
	Task<string> UploadBlobAsync(
		string sourceFolderId,
		string containerName,
		string blobName,
		byte[] content
	);
	Task UploadBlobAsync(string containerName, string blobName, string content);

	Task<string> DownloadBlobAsStringAsync(string containerName, string blobName);
	Task<byte[]> DownloadBlobAsBytesAsync(string containerName, string blobName);
	Task DeleteBlobAsync(string containerName, string blobName);
	Task DeleteOldBlobsAsync(string containerName, DateTime cutoffDate);
	Task<Dictionary<string, MemoryStream?>> DownloadFromUrlsBatchAsync(List<string> blobUrls);
	Task CleanupRedactionOutputAsync(string jobId, string outputContainerName);
	Task<bool> BlobExistsAsync(string containerName, string blobName);
}

public class BlobStorageService : IBlobStorageService
{
	private readonly ILogger<BlobStorageService> _logger;
	private readonly BlobServiceClient _blobServiceClient;
	private readonly StorageOptions _options;

	public BlobStorageService(
		IOptions<StorageOptions> options,
		BlobServiceClient blobServiceClient,
		ILogger<BlobStorageService> logger
	)
	{
		_logger = logger;
		_blobServiceClient = blobServiceClient;
		_options = options.Value;
	}

	public async Task UploadBlobAsync(string containerName, string blobName, string content)
	{
		var bytes = Encoding.UTF8.GetBytes(content);
		await UploadBlobAsync(containerName, blobName, bytes);
	}

	public async Task UploadBlobAsync(string containerName, string blobName, byte[] content)
	{
		_logger.LogInformation(
			"Uploading blob: {ContainerName}/{BlobName} ({Size} bytes)",
			containerName,
			blobName,
			content.Length
		);

		// Retry logic for 409 conflicts
		for (int attempt = 1; attempt <= 3; attempt++)
		{
			try
			{
				var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
				var blobClient = containerClient.GetBlobClient(blobName);
				using var stream = new MemoryStream(content);
				await blobClient.UploadAsync(stream, overwrite: true);

				_logger.LogInformation(
					"Successfully uploaded blob: {ContainerName}/{BlobName}",
					containerName,
					blobName
				);
				return;
			}
			catch (RequestFailedException ex) when (ex.Status == 409 && attempt < 3)
			{
				var delay = attempt * 200; // 200ms, 400ms delays
				_logger.LogWarning(
					"409 Conflict uploading {ContainerName}/{BlobName}, attempt {Attempt}/3. Retrying in {DelayMs}ms. ErrorCode: {ErrorCode}, ReasonPhrase: {ReasonPhrase}",
					containerName,
					blobName,
					attempt,
					delay,
					ex.ErrorCode,
					ex.Message
				);
				await Task.Delay(delay);
			}
			catch (Exception ex)
			{
				_logger.LogError(
					ex,
					"Error uploading blob: {ContainerName}/{BlobName}",
					containerName,
					blobName
				);
				throw;
			}
		}

		throw new InvalidOperationException(
			$"Failed to upload {containerName}/{blobName} after 3 attempts"
		);
	}

	public async Task<string> UploadBlobAsync(
		string sourceFolderId,
		string containerName,
		string blobName,
		string content
	)
	{
		var bytes = Encoding.UTF8.GetBytes(content);
		return await UploadBlobAsync(sourceFolderId, containerName, blobName, bytes);
	}

	public async Task<string> UploadBlobAsync(
		string sourceFolderId,
		string containerName,
		string blobName,
		byte[] content
	)
	{
		// Create folder structure using sourceFolderId
		var folderStructuredBlobName = $"{sourceFolderId}/{blobName}";

		_logger.LogInformation(
			"Uploading blob: {ContainerName}/{BlobName} ({Size} bytes)",
			containerName,
			folderStructuredBlobName,
			content.Length
		);

		// Retry logic for 409 conflicts
		for (int attempt = 1; attempt <= 3; attempt++)
		{
			try
			{
				var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
				var blobClient = containerClient.GetBlobClient(folderStructuredBlobName);

				using var stream = new MemoryStream(content);
				await blobClient.UploadAsync(stream, overwrite: true);

				_logger.LogInformation(
					"Successfully uploaded blob: {ContainerName}/{BlobName}",
					containerName,
					folderStructuredBlobName
				);

				return blobClient.Uri.AbsoluteUri;
			}
			catch (RequestFailedException ex) when (ex.Status == 409 && attempt < 3)
			{
				var delay = attempt * 200; // 200ms, 400ms delays
				_logger.LogWarning(
					"409 Conflict uploading {ContainerName}/{BlobName}, attempt {Attempt}/3. Retrying in {DelayMs}ms. ErrorCode: {ErrorCode}, ReasonPhrase: {ReasonPhrase}",
					containerName,
					folderStructuredBlobName,
					attempt,
					delay,
					ex.ErrorCode,
					ex.Message
				);
				await Task.Delay(delay);
			}
			catch (Exception ex)
			{
				_logger.LogError(
					ex,
					"Error uploading blob: {ContainerName}/{BlobName}",
					containerName,
					folderStructuredBlobName
				);
				throw;
			}
		}

		throw new InvalidOperationException(
			$"Failed to upload {containerName}/{folderStructuredBlobName} after 3 attempts"
		);
	}

	public async Task<string> DownloadBlobAsStringAsync(string containerName, string blobName)
	{
		_logger.LogInformation(
			"Downloading blob as string: {ContainerName}/{BlobName}",
			containerName,
			blobName
		);

		try
		{
			var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
			var blobClient = containerClient.GetBlobClient(blobName);

			if (!await blobClient.ExistsAsync())
			{
				throw new FileNotFoundException($"Blob not found: {containerName}/{blobName}");
			}

			var response = await blobClient.DownloadContentAsync();
			var content = response.Value.Content.ToString();

			_logger.LogInformation(
				"Successfully downloaded blob: {ContainerName}/{BlobName} ({Size} chars)",
				containerName,
				blobName,
				content.Length
			);

			return content;
		}
		catch (Exception ex)
		{
			_logger.LogError(
				ex,
				"Error downloading blob: {ContainerName}/{BlobName}",
				containerName,
				blobName
			);
			throw;
		}
	}

	public async Task<byte[]> DownloadBlobAsBytesAsync(string containerName, string blobName)
	{
		_logger.LogInformation(
			"Downloading blob as bytes: {ContainerName}/{BlobName}",
			containerName,
			blobName
		);

		try
		{
			var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
			var blobClient = containerClient.GetBlobClient(blobName);

			if (!await blobClient.ExistsAsync())
			{
				throw new FileNotFoundException($"Blob not found: {containerName}/{blobName}");
			}

			var response = await blobClient.DownloadContentAsync();
			var content = response.Value.Content.ToArray();

			_logger.LogInformation(
				"Successfully downloaded blob: {ContainerName}/{BlobName} ({Size} bytes)",
				containerName,
				blobName,
				content.Length
			);

			return content;
		}
		catch (Exception ex)
		{
			_logger.LogError(
				ex,
				"Error downloading blob: {ContainerName}/{BlobName}",
				containerName,
				blobName
			);
			throw;
		}
	}

	public async Task<MemoryStream> DownloadBlobAsync(
		string container,
		string directoryPath,
		string fileName
	)
	{
		try
		{
			// Get the container client
			var containerClient = _blobServiceClient.GetBlobContainerClient(container);

			// List blobs in the specified directory
			var blobs = containerClient.GetBlobsAsync(prefix: directoryPath);

			await foreach (var blobItem in blobs)
			{
				// Match the blob name with the specified file name
				if (blobItem.Name.EndsWith(fileName, StringComparison.OrdinalIgnoreCase))
				{
					// Get the BlobClient for the matched blob
					var blobClient = containerClient.GetBlobClient(blobItem.Name);

					// Download the Blob to a MemoryStream
					var downloadStream = new MemoryStream();
					await blobClient.DownloadToAsync(downloadStream);

					// Reset stream position
					downloadStream.Position = 0;

					return downloadStream;
				}
			}

			throw new FileNotFoundException(
				$"File '{fileName}' not found in directory '{directoryPath}' of container '{container}'."
			);
		}
		catch (Exception ex)
		{
			this._logger.LogError($"Error downloading blob: {ex.Message}");
			throw;
		}
	}

	public async Task<List<AzureBlobItem>> DownloadBlobItemsAsync(
		string container,
		string directoryPath
	)
	{
		var blobItems = new List<AzureBlobItem>();

		try
		{
			// Get the container client
			var containerClient = _blobServiceClient.GetBlobContainerClient(container);

			// List blobs in the specified directory
			var blobs = containerClient.GetBlobsAsync(prefix: directoryPath);

			await foreach (var blobItem in blobs)
			{
				// Get the BlobClient for the matched blob
				var blobClient = containerClient.GetBlobClient(blobItem.Name);

				// Download the Blob to a MemoryStream
				var downloadStream = new MemoryStream();
				await blobClient.DownloadToAsync(downloadStream);

				// Reset stream position
				downloadStream.Position = 0;

				blobItems.Add(
					new AzureBlobItem
					{
						Name = blobItem.Name,
						Stream = downloadStream,
						Url = blobClient.Uri.ToString(),
					}
				);
			}
		}
		catch (Exception ex)
		{
			this._logger.LogError($"Error downloading blob: {ex.Message}");
			throw;
		}

		return blobItems;
	}

	/// <summary>
	/// Downloads multiple blobs from URLs in batch
	/// </summary>
	/// <param name="blobUrls">List of complete URLs to the blobs</param>
	/// <returns>Dictionary with URL as key and MemoryStream as value, null for failed downloads</returns>
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

	public async Task DeleteBlobAsync(string containerName, string blobName)
	{
		_logger.LogInformation(
			"Deleting blob: {ContainerName}/{BlobName}",
			containerName,
			blobName
		);

		try
		{
			var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
			var blobClient = containerClient.GetBlobClient(blobName);

			await blobClient.DeleteIfExistsAsync();

			_logger.LogInformation(
				"Successfully deleted blob: {ContainerName}/{BlobName}",
				containerName,
				blobName
			);
		}
		catch (Exception ex)
		{
			_logger.LogError(
				ex,
				"Error deleting blob: {ContainerName}/{BlobName}",
				containerName,
				blobName
			);
			throw;
		}
	}

	public async Task DeleteOldBlobsAsync(string containerName, DateTime cutoffDate)
	{
		_logger.LogInformation(
			"Deleting blobs older than {CutoffDate} from container: {ContainerName}",
			cutoffDate,
			containerName
		);

		try
		{
			var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

			if (!await containerClient.ExistsAsync())
			{
				_logger.LogInformation("Container does not exist: {ContainerName}", containerName);
				return;
			}

			var deletedCount = 0;
			await foreach (var blobItem in containerClient.GetBlobsAsync(BlobTraits.Metadata))
			{
				if (blobItem.Properties.CreatedOn < cutoffDate)
				{
					var blobClient = containerClient.GetBlobClient(blobItem.Name);
					await blobClient.DeleteIfExistsAsync();
					deletedCount++;

					_logger.LogDebug(
						"Deleted old blob: {ContainerName}/{BlobName}",
						containerName,
						blobItem.Name
					);
				}
			}

			_logger.LogInformation(
				"Deleted {Count} old blobs from container: {ContainerName}",
				deletedCount,
				containerName
			);
		}
		catch (Exception ex)
		{
			_logger.LogError(
				ex,
				"Error deleting old blobs from container: {ContainerName}",
				containerName
			);
			throw;
		}
	}

	public async Task CleanupRedactionOutputAsync(string jobId, string outputContainerName)
	{
		try
		{
			var containerClient = this._blobServiceClient.GetBlobContainerClient(
				outputContainerName
			);

			var jobPath = $"{jobId}/";
			var blobs = containerClient.GetBlobsAsync(prefix: jobPath);

			await foreach (var blobItem in blobs)
			{
				var blobClient = containerClient.GetBlobClient(blobItem.Name);
				await blobClient.DeleteIfExistsAsync();
			}

			this._logger.LogInformation($"Cleaned up redaction output for job: {jobId}");
		}
		catch (Exception ex)
		{
			this._logger.LogWarning(
				$"Error cleaning up redaction output for job {jobId}: {ex.Message}"
			);
		}
	}

	public async Task<List<AzureBlobItem>> GetAllRedactedFilesAsync(
		string jobId,
		string outputContainerName = "output_container"
	)
	{
		var redactedFiles = new List<AzureBlobItem>();

		try
		{
			var containerClient = this._blobServiceClient.GetBlobContainerClient(
				outputContainerName
			);

			var redactedFilePath = $"{jobId}/PiiEntityRecognition/0001/";
			var blobs = containerClient.GetBlobsAsync(prefix: redactedFilePath);

			await foreach (var blobItem in blobs)
			{
				// Skip directories
				if (!blobItem.Name.EndsWith("/"))
				{
					var blobClient = containerClient.GetBlobClient(blobItem.Name);

					if (await blobClient.ExistsAsync())
					{
						var downloadStream = new MemoryStream();
						await blobClient.DownloadToAsync(downloadStream);
						downloadStream.Position = 0;

						redactedFiles.Add(
							new AzureBlobItem
							{
								Name = blobItem.Name,
								Stream = downloadStream,
								Url = blobClient.Uri.AbsoluteUri,
							}
						);
					}
				}
			}
		}
		catch (Exception ex)
		{
			this._logger.LogError($"Error getting redacted files for job {jobId}: {ex.Message}");
			throw;
		}

		return redactedFiles;
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
				var containerClient = this._blobServiceClient.GetBlobContainerClient(containerName);
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

	/// <summary>
	/// Deletes multiple blobs from URLs in batch
	/// </summary>
	/// <param name="blobUrls">List of complete URLs to the blobs to delete</param>
	/// <returns>Dictionary with URL as key and success status as value</returns>
	public async Task<Dictionary<string, bool>> DeleteBlobsBatchAsync(List<string> blobUrls)
	{
		var results = new Dictionary<string, bool>();

		try
		{
			this._logger.LogInformation("Starting batch deletion of {Count} blobs", blobUrls.Count);

			// Process deletions in parallel with limited concurrency
			var semaphore = new SemaphoreSlim(10, 10); // Limit to 10 concurrent deletions
			var deleteTasks = blobUrls.Select(async url =>
			{
				await semaphore.WaitAsync();
				try
				{
					var success = await this.DeleteBlobFromUrlAsync(url);
					return new { Url = url, Success = success };
				}
				finally
				{
					semaphore.Release();
				}
			});

			var deleteResults = await Task.WhenAll(deleteTasks);

			foreach (var result in deleteResults)
			{
				results[result.Url] = result.Success;
			}

			var successCount = results.Values.Count(s => s);
			this._logger.LogInformation(
				"Completed batch deletion: {SuccessCount}/{TotalCount} successful",
				successCount,
				blobUrls.Count
			);

			return results;
		}
		catch (Exception ex)
		{
			this._logger.LogError(ex, "Error during batch blob deletion");
			throw;
		}
	}

	/// <summary>
	/// Deletes a single blob from a complete URL
	/// </summary>
	/// <param name="blobUrl">The complete URL to the blob</param>
	/// <returns>True if deletion was successful, false otherwise</returns>
	private async Task<bool> DeleteBlobFromUrlAsync(string blobUrl)
	{
		try
		{
			this._logger.LogDebug("Deleting blob from URL: {BlobUrl}", blobUrl);

			var uri = new Uri(blobUrl, UriKind.Absolute);

			// Extract container and blob name from URL
			var pathParts = uri.AbsolutePath.TrimStart('/').Split('/');
			if (pathParts.Length < 2)
			{
				this._logger.LogError("Invalid blob URL format: {BlobUrl}", blobUrl);
				return false;
			}

			var containerName = pathParts[0];
			var blobName = Uri.UnescapeDataString(string.Join("/", pathParts.Skip(1)));

			try
			{
				// Try with the configured connection string first
				var containerClient = this._blobServiceClient.GetBlobContainerClient(containerName);
				var blobClient = containerClient.GetBlobClient(blobName);

				var response = await blobClient.DeleteIfExistsAsync();
				if (response.Value)
				{
					this._logger.LogDebug("Successfully deleted blob: {BlobUrl}", blobUrl);
					return true;
				}
				else
				{
					this._logger.LogDebug(
						"Blob did not exist or was already deleted: {BlobUrl}",
						blobUrl
					);
					return true; // Consider non-existing blob as successful deletion
				}
			}
			catch (RequestFailedException ex) when (ex.Status == 404)
			{
				this._logger.LogDebug(
					"Blob not found (404), considering as successful deletion: {BlobUrl}",
					blobUrl
				);
				return true;
			}
			catch (RequestFailedException ex) when (ex.Status == 403)
			{
				this._logger.LogWarning("Access denied when deleting blob: {BlobUrl}", blobUrl);
				return false;
			}
		}
		catch (Exception ex)
		{
			this._logger.LogError(
				ex,
				"Error deleting blob from URL {BlobUrl}: {Message}",
				blobUrl,
				ex.Message
			);
			return false;
		}
	}

	public async Task<bool> BlobExistsAsync(string containerName, string blobName)
	{
		try
		{
			var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
			var blobClient = containerClient.GetBlobClient(blobName);

			var response = await blobClient.ExistsAsync();
			return response.Value;
		}
		catch (Exception ex)
		{
			_logger.LogError(
				ex,
				"Error checking blob existence: {ContainerName}/{BlobName}",
				containerName,
				blobName
			);
			return false;
		}
	}
}