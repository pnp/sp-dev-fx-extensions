using Microsoft.Extensions.Logging;
using MoveDocs2Blob.Services;
using MoveDocs2Blob.Models;
using PnP.Core.Services;
using PnP.Core.Model.SharePoint;
using System.Linq;

namespace MoveDocs2Blob.Services.Implementation;

/// <summary>
/// Service for SharePoint operations using PnP.Core SDK
/// </summary>
public class SharePointService : ISharePointService
{
    private readonly IPnPContextService _pnpContextService;
    private readonly ILogger<SharePointService> _logger;

    public SharePointService(IPnPContextService pnpContextService, ILogger<SharePointService> logger)
    {
        _pnpContextService = pnpContextService;
        _logger = logger;
    }

    public async Task<SharePointFile> GetDocumentAsync(string siteUrl, string listId, string itemId, string userAccessToken)
    {
        try
        {
            _logger.LogInformation("Getting document {ItemId} from list {ListId} in site {SiteUrl}", itemId, listId, siteUrl);

            using var context = await _pnpContextService.CreateUserContextAsync(siteUrl, userAccessToken);
                
            
            // Get the list by its ID
            var list = await context.Web.Lists.GetByIdAsync(Guid.Parse(listId));
            
            // Get the item from the list
            var item = await list.Items.GetByIdAsync(int.Parse(itemId), 
                li => li.Id, li => li.File, li => li.FieldValuesAsText);
            
            if (item?.File == null)
            {
                throw new FileNotFoundException($"Document with ID {itemId} not found in list {listId}");
            }

            // Load file properties
            await item.File.LoadAsync(f => f.UniqueId, f => f.Name, f => f.Length, f => f.ServerRelativeUrl, 
                                     f => f.TimeCreated, f => f.TimeLastModified);

            return new SharePointFile
            {
                Id = item.File.UniqueId.ToString(),
                Name = item.File.Name,
                Size = item.File.Length,
                Url = item.File.ServerRelativeUrl, // Use only server-relative URL for downloads
                Created = item.File.TimeCreated,
                Modified = item.File.TimeLastModified,
                ContentType = GetContentTypeFromExtension(item.File.Name),
                Properties = null // TODO: Implement field values extraction if needed
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting document {ItemId} from list {ListId} in site {SiteUrl}", itemId, listId, siteUrl);
            throw;
        }
    }

    public async Task<Stream> DownloadDocumentAsync(string siteUrl, string fileUrl, string userAccessToken)
    {
        try
        {
            _logger.LogInformation("Downloading document from {FileUrl} in site {SiteUrl}", fileUrl, siteUrl);

            using var context = await _pnpContextService.CreateUserContextAsync(siteUrl, userAccessToken);

            // Get the file by server relative URL
            var file = await context.Web.GetFileByServerRelativeUrlAsync(fileUrl);
            
            if (file == null)
            {
                throw new FileNotFoundException($"File not found at {fileUrl}");
            }

            // Download the file content
            return await file.GetContentAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading document from {FileUrl} in site {SiteUrl}", fileUrl, siteUrl);
            throw;
        }
    }

    public async Task<IEnumerable<DocumentLibrary>> GetDocumentLibrariesAsync(string siteUrl, string userAccessToken)
    {
        try
        {
            _logger.LogInformation("Getting document libraries from site {SiteUrl}", siteUrl);

            using var context = await _pnpContextService.CreateUserContextAsync(siteUrl, userAccessToken);

            // Get all lists that are document libraries
            await context.Web.LoadAsync(w => w.Lists);

            // Convert to list first, then filter and load properties
            var allLists = context.Web.Lists.ToList();
            var documentLibraries = allLists.Where(l => l.TemplateType == ListTemplateType.DocumentLibrary).ToList();
            
            // Load additional properties for each document library
            foreach (var list in documentLibraries)
            {
                await list.LoadAsync(l => l.Id, l => l.Title, l => l.Description, l => l.DefaultViewUrl, l => l.ItemCount,l=> l.RootFolder);
            }

            return documentLibraries.Select(list => new DocumentLibrary
            {
                Id = list.Id.ToString(),
                Title = list.Title,
                Url = $"{siteUrl.TrimEnd('/')}{list.DefaultViewUrl}",
                ItemCount = list.ItemCount,
                RootFolderName = list.RootFolder.Name
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting document libraries from site {SiteUrl}", siteUrl);
            throw;
        }
    }

    public async Task<IEnumerable<SharePointFile>> GetLibraryFilesAsync(string siteUrl, string libraryId, string userAccessToken)
    {
        try
        {
            _logger.LogInformation("Getting files from library {LibraryId} in site {SiteUrl}", libraryId, siteUrl);

            using var context = await _pnpContextService.CreateUserContextAsync(siteUrl, userAccessToken);

            // Get the list by its ID
            var list = await context.Web.Lists.GetByIdAsync(Guid.Parse(libraryId));
            
            if (list == null)
            {
                throw new ArgumentException($"Library with ID {libraryId} not found");
            }

            // Get files from the library
            await list.LoadAsync(l => l.RootFolder);
            await list.RootFolder.LoadAsync(f => f.Files);
            
            var files = list.RootFolder.Files;
            
            // Load properties for each file
            foreach (var file in files)
            {
                await file.LoadAsync(f => f.UniqueId, f => f.Name, f => f.Length, f => f.ServerRelativeUrl, 
                                   f => f.TimeCreated, f => f.TimeLastModified);
            }

            return files.Select(file => new SharePointFile
            {
                Id = file.UniqueId.ToString(),
                Name = file.Name,
                Size = file.Length,
                Url = $"{siteUrl.TrimEnd('/')}{file.ServerRelativeUrl}",
                Created = file.TimeCreated,
                Modified = file.TimeLastModified,
                ContentType = GetContentTypeFromExtension(file.Name)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting files from library {LibraryId} in site {SiteUrl}", libraryId, siteUrl);
            throw;
        }
    }

    private static string GetContentTypeFromExtension(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".txt" => "text/plain",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };
    }
}
