using PnP.Core.Services;

namespace MoveDocs2Blob.Services;

/// <summary>
/// Service interface for handling token operations and On-Behalf-Of flow
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Exchanges a user access token for a new token with SharePoint permissions using On-Behalf-Of flow
    /// </summary>
    /// <param name="userAccessToken">The user's access token from the authorization header</param>
    /// <param name="scopes">Optional scopes to request for the new token. Defaults to SharePoint scopes.</param>
    /// <returns>New access token for SharePoint</returns>
    Task<string> ExchangeTokenAsync(string userAccessToken,string? scopes=null);

    /// <summary>
    /// Validates and extracts the access token from the Authorization header
    /// </summary>
    /// <param name="authorizationHeader">The Authorization header value (e.g., "Bearer token123")</param>
    /// <returns>The extracted access token</returns>
    string ExtractTokenFromHeader(string authorizationHeader);
}
