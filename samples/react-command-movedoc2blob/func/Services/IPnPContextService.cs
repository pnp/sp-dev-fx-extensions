using PnP.Core.Services;

namespace MoveDocs2Blob.Services;

/// <summary>
/// Factory interface for creating PnP Context instances
/// </summary>
public interface IPnPContextService
{
    /// <summary>
    /// Creates a PnPContext using application credentials (client credentials flow)
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <returns>PnPContext configured for app-only access</returns>
    Task<IPnPContext> CreateAppOnlyContextAsync(string siteUrl);

    /// <summary>
    /// Creates a PnPContext using a user's access token (on behalf of flow)
    /// </summary>
    /// <param name="siteUrl">SharePoint site URL</param>
    /// <param name="userAccessToken">The user's access token</param>
    /// <returns>PnPContext configured for user access</returns>
    Task<IPnPContext> CreateUserContextAsync(string siteUrl, string userAccessToken);
}
