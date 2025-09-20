using System.Security;
using System.Text;
using DocumentRedactionApp.Models;
using DocumentRedactionApp.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PnP.Core.Auth;
using PnP.Core.Services;

namespace DocumentRedactionApp.Services;

public interface ISharePointService
{
    Task<DocumentContent> DownloadDocumentAsync(
        string siteUrl,
        string listId,
        string serverRelativeUrl,
        string tenantId,
        string userAccessToken
    );
    Task UploadDocumentAsync(
        string siteUrl,
        string listId,
        string folderPath,
        string fileName,
        Stream content,
        string tenantId,
        string userAccessToken
    );
}

public class SharePointService : ISharePointService
{
    private readonly ILogger<SharePointService> _logger;
    private readonly IPnPContextFactory _pnpContextFactory;
    private readonly AppInfo _appInfo;

    public SharePointService(
        ILogger<SharePointService> logger,
        IPnPContextFactory pnpContextFactory,
        AppInfo appInfo
    )
    {
        _logger = logger;
        _pnpContextFactory = pnpContextFactory;
        _appInfo = appInfo;
    }

    public async Task<DocumentContent> DownloadDocumentAsync(
        string siteUrl,
        string listId,
        string serverRelativeUrl,
        string tenantId,
        string userAccessToken
    )
    {
        _logger.LogInformation(
            "Downloading document from SharePoint: {ServerRelativeUrl}",
            serverRelativeUrl
        );

        using var context = await CreatePnPContextAsync(siteUrl, tenantId, userAccessToken);

        // Get the file
        var file = await context.Web.GetFileByServerRelativeUrlAsync(serverRelativeUrl);
        
        if (file == null)
        {
            throw new FileNotFoundException($"File not found: {serverRelativeUrl}");
        }

        // Download file content
        var stream = await file.GetContentAsync();
        using var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream);
        var bytes = memoryStream.ToArray();

        // Get file info
        var fileName = Path.GetFileName(serverRelativeUrl);
        var fileExtension = Path.GetExtension(fileName);

        // Extract text content for .txt files
        string textContent = "";
        if (fileExtension.ToLowerInvariant() == ".txt")
        {
            textContent = Encoding.UTF8.GetString(bytes);
        }

        _logger.LogInformation(
            "Successfully downloaded document: {FileName} ({Size} bytes)",
            fileName,
            bytes.Length
        );

        return new DocumentContent
        {
            FileName = fileName,
            Content = textContent,
            FileType = fileExtension,
            OriginalBytes = bytes,
        };
    }

    public async Task UploadDocumentAsync(
        string siteUrl,
        string listId,
        string folderPath,
        string fileName,
        Stream content,
        string tenantId,
        string userAccessToken
    )
    {
        _logger.LogInformation(
            "Uploading document to SharePoint: {FolderPath}/{FileName}",
            folderPath,
            fileName
        );

        using var context = await CreatePnPContextAsync(siteUrl, tenantId, userAccessToken);

        // Get target folder
        var folder = await GetFolderAsync(context, listId, folderPath);

        // Create unique filename if needed
       // var finalFileName = await GetUniqueFileNameAsync(folder, fileName);

        // Upload file
        await folder.Files.AddAsync(fileName, content, overwrite: true);

        _logger.LogInformation(
            "Successfully uploaded document: {FolderPath}/{FileName} ({Size} bytes)",
            folderPath,
			fileName,
            content.Length
        );
    }

    private async Task<IPnPContext> CreatePnPContextAsync(
        string siteUrl,
        string tenantId,
        string userAccessToken
    )
    {
        try
        {
            // Remove "Bearer " prefix if present
            var cleanToken = userAccessToken;
            if (userAccessToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                cleanToken = userAccessToken.Substring(7);
            }

            // Validate that we have a token
            if (string.IsNullOrWhiteSpace(cleanToken))
            {
                throw new ArgumentException("User access token is required but was empty or null");
            }

            _logger.LogDebug(
                "Creating PnP context for site: {SiteUrl} with tenant: {TenantId}",
                siteUrl,
                tenantId
            );

            // Create secure string for client secret
            var clientSecret = new SecureString();
            foreach (char c in _appInfo.ClientSecret)
            {
                clientSecret.AppendChar(c);
            }

            // Create OnBehalfOf authentication provider
            var authProvider = new OnBehalfOfAuthenticationProvider(
                _appInfo.ClientId,
                tenantId,
                clientSecret,
                () => cleanToken
            );

            // Create and return PnP context
            return await _pnpContextFactory.CreateAsync(new Uri(siteUrl), authProvider);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create PnP context for site: {SiteUrl}", siteUrl);
            throw new InvalidOperationException(
                $"Failed to authenticate with SharePoint: {ex.Message}",
                ex
            );
        }
    }

    private async Task<PnP.Core.Model.SharePoint.IFolder> GetFolderAsync(
        IPnPContext context,
        string listId,
        string folderPath
    )
    {
        try
        {
            // Handle root folder case
            if (string.IsNullOrEmpty(folderPath) || folderPath == "/" || folderPath == "\\")
            {
                return await GetDocumentLibraryRootAsync(context, listId);
            }

            // Clean folder path
            //folderPath = folderPath.Trim('/', '\\').Replace('\\', '/');

            // Try to get existing folder first
            var web = await context.Web.GetAsync(w => w.ServerRelativeUrl);
            var fullPath = folderPath.StartsWith(web.ServerRelativeUrl)
                ? folderPath
                : $"{web.ServerRelativeUrl.TrimEnd('/')}/{folderPath}";

            try
            {
                return await context.Web.GetFolderByServerRelativeUrlAsync(fullPath);
            }
            catch
            {
                // Folder doesn't exist, create it
                return await CreateFolderAsync(context, listId, folderPath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting folder: {FolderPath}", folderPath);
            throw;
        }
    }

    private async Task<PnP.Core.Model.SharePoint.IFolder> GetDocumentLibraryRootAsync(
        IPnPContext context,
        string listId
    )
    {
        var list = await context.Web.Lists.GetByIdAsync(new Guid(listId));

        if (list == null)
        {
            throw new InvalidOperationException("No document library found");
        }

        await list.LoadAsync(l => l.RootFolder);
        return list.RootFolder;
    }

    private async Task<PnP.Core.Model.SharePoint.IFolder> CreateFolderAsync(
        IPnPContext context,
        string listId,
        string folderPath
    )
    {
        var pathParts = folderPath.Split('/');
        var currentFolder = await GetDocumentLibraryRootAsync(context, listId);

        foreach (var part in pathParts)
        {
            if (string.IsNullOrEmpty(part))
                continue;

            await currentFolder.LoadAsync(f => f.Folders);
            var existingFolder = currentFolder.Folders.FirstOrDefault(f =>
                f.Name.Equals(part, StringComparison.OrdinalIgnoreCase)
            );

            currentFolder = existingFolder ?? await currentFolder.Folders.AddAsync(part);
        }

        return currentFolder;
    }

    private async Task<string> GetUniqueFileNameAsync(
        PnP.Core.Model.SharePoint.IFolder folder,
        string fileName
    )
    {
        await folder.LoadAsync(f => f.Files);

        var baseName = Path.GetFileNameWithoutExtension(fileName);
        var extension = Path.GetExtension(fileName);
        var finalName = fileName;
        var counter = 1;

        while (folder.Files.Any(f => f.Name.Equals(finalName, StringComparison.OrdinalIgnoreCase)))
        {
            finalName = $"{baseName}({counter}){extension}";
            counter++;
        }

        return finalName;
    }
}
