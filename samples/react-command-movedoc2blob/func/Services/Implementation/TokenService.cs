using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MoveDocs2Blob.Services.Implementation;

/// <summary>
/// Service for handling token operations and On-Behalf-Of flow
/// </summary>
public class TokenService : ITokenService
{
    private readonly ILogger<TokenService> _logger;
    private readonly HttpClient _httpClient;

    public TokenService(ILogger<TokenService> logger, HttpClient httpClient)
    {
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<string> ExchangeTokenAsync(string userAccessToken,string? scopes=null)
    {
        if (string.IsNullOrEmpty(userAccessToken))
        {
            throw new ArgumentException("User access token cannot be null or empty", nameof(userAccessToken));
        }

        var tenantId = Environment.GetEnvironmentVariable("SHAREPOINT_TENANT_ID");
        var clientId = Environment.GetEnvironmentVariable("SHAREPOINT_CLIENT_ID");
        var clientSecret = Environment.GetEnvironmentVariable("SHAREPOINT_CLIENT_SECRET");

        if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
        {
            throw new InvalidOperationException("Required environment variables (SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET) are not configured");
        }

        // use default Scope
        var requestedScopes = scopes==null?new[] { "https://graph.microsoft.com/.default" } : scopes.Split(' ');

        var scopeString = string.Join(" ", requestedScopes);

        _logger.LogInformation("Using scopes: {Scopes}", scopeString);

        _logger.LogInformation("Exchanging user token for SharePoint token using On-Behalf-Of flow");

        try
        {
            // Prepare the On-Behalf-Of request
            var tokenEndpoint = $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token";
            
            var parameters = new Dictionary<string, string>
            {
                ["grant_type"] = "urn:ietf:params:oauth:grant-type:jwt-bearer",
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["assertion"] = userAccessToken,
                ["scope"] = scopeString,
                ["requested_token_use"] = "on_behalf_of"
            };

            var content = new FormUrlEncodedContent(parameters);
            
            var response = await _httpClient.PostAsync(tokenEndpoint, content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Token exchange failed with status {StatusCode}: {Response}", 
                    response.StatusCode, responseContent);
                throw new InvalidOperationException($"Token exchange failed: {response.StatusCode} - {responseContent}");
            }

            var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(responseContent);
            
            if (tokenResponse?.AccessToken == null)
            {
                throw new InvalidOperationException("Token exchange succeeded but no access token was returned");
            }

            _logger.LogInformation("Successfully exchanged user token for SharePoint token");
            return tokenResponse.AccessToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token exchange");
            throw;
        }
    }

    public string ExtractTokenFromHeader(string authorizationHeader)
    {
        if (string.IsNullOrEmpty(authorizationHeader))
        {
            throw new ArgumentException("Authorization header cannot be null or empty", nameof(authorizationHeader));
        }

        // Check if header starts with "Bearer "
        const string bearerPrefix = "Bearer ";
        if (!authorizationHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Authorization header must start with 'Bearer '", nameof(authorizationHeader));
        }

        var token = authorizationHeader.Substring(bearerPrefix.Length).Trim();
        
        if (string.IsNullOrEmpty(token))
        {
            throw new ArgumentException("No token found in Authorization header", nameof(authorizationHeader));
        }

        return token;
    }

    /// <summary>
    /// Response model for OAuth token endpoint
    /// </summary>
    private class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("token_type")]
        public string? TokenType { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("scope")]
        public string? Scope { get; set; }

        [JsonPropertyName("error")]
        public string? Error { get; set; }

        [JsonPropertyName("error_description")]
        public string? ErrorDescription { get; set; }
    }
}
