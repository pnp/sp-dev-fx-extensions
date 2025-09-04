using PnP.Core.Services;
using PnP.Core.Auth;
using Azure.Identity;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using PnP.Core.Model.SharePoint;

namespace MoveDocs2Blob.Services.Implementation;

/// <summary>
/// Service for creating PnPContext instances with different authentication modes
/// </summary>
public class PnPContextService : IPnPContextService
{
    private readonly ILogger<PnPContextService> _logger;
    private readonly IPnPContextFactory _pnpContextFactory;
    private readonly ITokenService _tokenService;

    public PnPContextService(ILogger<PnPContextService> logger, IPnPContextFactory pnpContextFactory, ITokenService tokenService)
    {
        _logger = logger;
        _pnpContextFactory = pnpContextFactory;
        _tokenService = tokenService;
    }

    public async Task<IPnPContext> CreateAppOnlyContextAsync(string siteUrl)
    {
        try
        {
            var tenantId = Environment.GetEnvironmentVariable("SHAREPOINT_TENANT_ID");
            var clientId = Environment.GetEnvironmentVariable("SHAREPOINT_CLIENT_ID");
            var clientSecret = Environment.GetEnvironmentVariable("SHAREPOINT_CLIENT_SECRET");

            if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                throw new InvalidOperationException("Required environment variables for SharePoint authentication are missing");
            }

            _logger.LogDebug("Creating PnPContext with client credentials for tenant: {TenantId}, site: {SiteUrl}", tenantId, siteUrl);

            // Use the dependency injected PnP context factory
            var context = await _pnpContextFactory.CreateAsync(siteUrl);
            return context;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create app-only PnP context for site: {SiteUrl}", siteUrl);
            throw;
        }
    }

    public async Task<IPnPContext> CreateUserContextAsync(string siteUrl, string userAccessToken)
    {
        try
        {
            if (string.IsNullOrEmpty(userAccessToken))
            {
                throw new ArgumentException("User access token cannot be null or empty", nameof(userAccessToken));
            }

            _logger.LogDebug("Creating PnPContext with user access token for site: {SiteUrl}", siteUrl);

            // Clean up token - remove Bearer prefix if present
            var cleanToken = userAccessToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) 
                ? userAccessToken["Bearer ".Length..] 
                : userAccessToken;
            //https://{tenant}.sharepoint.com/.default
            var siteuri= new Uri(siteUrl);
            //var scopes =  $"https://graph.microsoft.com/sites.readwrite.all";
            var scope = $"https://{siteuri.Host}/.default";
            _logger.LogInformation("Using scopes: {Scopes}", scope);
            var oboToken = await _tokenService.ExchangeTokenAsync(userAccessToken, scope);
            // Create context with external authentication provider
            // ExternalAuthenticationProvider expects a function that returns a token
            var context = await _pnpContextFactory.CreateAsync(new Uri(siteUrl), 
                new ExternalAuthenticationProvider((uri, scopes) => oboToken));
            
            return context;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user PnP context for site: {SiteUrl}", siteUrl);
            throw;
        }
    }


}
