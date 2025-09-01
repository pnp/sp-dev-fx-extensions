using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using MoveDocs2Blob.Services;
using MoveDocs2Blob.Models;
using System.Text.Json;

namespace MoveDocs2Blob;

/// <summary>
/// HTTP triggers for document movement to blob operations
/// </summary>
public class HttpTriggers
{
    private readonly ILogger<HttpTriggers> _logger;
    private readonly IMoveDoc2BlobService _moveDoc2BlobService;
    private readonly ITokenService _tokenService;
    private readonly ISharePointService _sharePointService;

    public HttpTriggers(ILogger<HttpTriggers> logger, IMoveDoc2BlobService moveDoc2BlobService, ITokenService tokenService, ISharePointService sharePointService)
    {
        _logger = logger;
        _moveDoc2BlobService = moveDoc2BlobService;
        _tokenService = tokenService;
        _sharePointService = sharePointService;
    }

    /// <summary>
    /// Moves a SharePoint document to blob storage
    /// </summary>
    /// <param name="req">HTTP request containing ListID, ItemID, and SiteURL parameters</param>
    /// <returns>Move operation result</returns>
    [Function("MoveDoc2Blob")]
    public async Task<IActionResult> MoveDoc2Blob(
        [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req)
    {
        _logger.LogInformation("ArchiveDocument function triggered");

        try
        {
            // Extract parameters from query string or request body
            string? listId = req.Query["ListID"];
            string? itemId = req.Query["ItemID"];
            string? siteUrl = req.Query["SiteURL"];

            // If not in query string, try to get from request body
            if (string.IsNullOrEmpty(listId) || string.IsNullOrEmpty(itemId) || string.IsNullOrEmpty(siteUrl))
            {
                var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                if (!string.IsNullOrEmpty(requestBody))
                {
                    var requestData = JsonSerializer.Deserialize<Dictionary<string, string>>(requestBody);
                    listId ??= requestData?.GetValueOrDefault("ListID");
                    itemId ??= requestData?.GetValueOrDefault("ItemID");
                    siteUrl ??= requestData?.GetValueOrDefault("SiteURL");
                }
            }

            // Validate required parameters
            if (string.IsNullOrEmpty(listId))
            {
                return new BadRequestObjectResult(new { error = "ListID parameter is required" });
            }

            if (string.IsNullOrEmpty(itemId))
            {
                return new BadRequestObjectResult(new { error = "ItemID parameter is required" });
            }

            if (string.IsNullOrEmpty(siteUrl))
            {
                return new BadRequestObjectResult(new { error = "SiteURL parameter is required" });
            }

            _logger.LogInformation("Moving document to blob: SiteURL={SiteUrl}, ListID={ListId}, ItemID={ItemId}", 
                siteUrl, listId, itemId);

            // Extract user token from Authorization header
            string? userAccessToken = null;
            if (req.Headers.TryGetValue("Authorization", out var authHeader) && !string.IsNullOrEmpty(authHeader))
            {
                try
                {
                    userAccessToken = _tokenService.ExtractTokenFromHeader(authHeader!);
                }
                catch (ArgumentException ex)
                {
                    _logger.LogWarning("Invalid Authorization header format: {Message}", ex.Message);
                    return new BadRequestObjectResult(new { error = ex.Message });
                }
            }
            if (userAccessToken == null)
            { 
                return new BadRequestObjectResult(new { error = "Authorization header with Bearer token is required" });
            }
            
            // Perform move operation on_behalf_of 
            var result = await _moveDoc2BlobService.MoveDocumentAsync(siteUrl, listId, itemId, userAccessToken);

            if (result.Success)
            {
                _logger.LogInformation("Document copied successfully: {FileName}", result.FileName);
                return new OkObjectResult(result);
            }
            else
            {
                _logger.LogWarning("Archive operation failed: {Message}", result.Message);
                return new BadRequestObjectResult(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in MoveDoc2Blob function");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Retrieves moved documents for a SharePoint site
    /// </summary>
    /// <param name="req">HTTP request containing SiteURL parameter</param>
    /// <returns>Collection of moved documents and document libraries</returns>
    [Function("ShowMovedDocuments")]
    public async Task<IActionResult> ShowMovedDocuments(
        [HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
    {
        _logger.LogInformation("ShowMovedDocuments function triggered");
        string? userAccessToken = null;
        if (req.Headers.TryGetValue("Authorization", out var authHeader) && !string.IsNullOrEmpty(authHeader))
        {
            try
            {
                userAccessToken = _tokenService.ExtractTokenFromHeader(authHeader!);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Invalid Authorization header format: {Message}", ex.Message);
                return new BadRequestObjectResult(new { error = ex.Message });
            }
        }
        if (userAccessToken == null)
        {
            return new BadRequestObjectResult(new { error = "Authorization header with Bearer token is required" });
        }
       

        try
        {
            string? siteUrl = req.Query["SiteURL"];
            
            // Validate required parameter
            if (string.IsNullOrEmpty(siteUrl))
            {
                return new BadRequestObjectResult(new { error = "SiteURL parameter is required" });
            }
           

            try
            {
                // This will throw if the user does not have access
                await _sharePointService.GetDocumentLibrariesAsync(siteUrl, userAccessToken);
            }
            catch (Exception ex)
            {

                _logger.LogWarning(ex, "User does not have read access to the site or token is invalid." + ex.Message);
                return new StatusCodeResult(StatusCodes.Status403Forbidden);
            }

            _logger.LogInformation("Retrieving moved documents for site: {SiteUrl}", siteUrl);

            // Get moved documents and document libraries in parallel
            var movedDocumentsTask = _moveDoc2BlobService.GetMovedDocumentsAsync(siteUrl, userAccessToken);
            var documentLibrariesTask = _sharePointService.GetDocumentLibrariesAsync(siteUrl, userAccessToken);

            await Task.WhenAll(movedDocumentsTask, documentLibrariesTask);

            var response = new ShowMovedDocumentsResponse
            {
                SiteUrl = siteUrl,
                MovedDocuments = await movedDocumentsTask,
                DocumentLibraries = await documentLibrariesTask,
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Successfully retrieved moved documents for site: {SiteUrl}", siteUrl);
            return new OkObjectResult(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ShowArchivedDocuments function");
            return new StatusCodeResult(500);
        }
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    /// <param name="req">HTTP request</param>
    /// <returns>Health status</returns>
    [Function("HealthCheck")]
    public IActionResult HealthCheck([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
    {
        _logger.LogInformation("HealthCheck function triggered");
        
        return new OkObjectResult(new 
        { 
            status = "healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0"
        });
    }

   
}