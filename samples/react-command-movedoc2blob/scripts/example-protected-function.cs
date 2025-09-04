using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace ArchiveDocuments.Functions
{
    /// <summary>
    /// Example Azure Function showing how to validate the custom scope created by the app registration script
    /// </summary>
    public class ExampleProtectedFunction
    {
        private readonly ILogger<ExampleProtectedFunction> _logger;

        public ExampleProtectedFunction(ILogger<ExampleProtectedFunction> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Example HTTP trigger that requires the custom scope
        /// </summary>
        /// <param name="req">The HTTP request</param>
        /// <returns>A response indicating successful authorization</returns>
        [FunctionName("ExampleProtected")]
        [Authorize] // This will validate the JWT token
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "protected")] HttpRequest req)
        {
            try
            {
                // Get the current user's claims from the JWT token
                var identity = req.HttpContext.User.Identity as ClaimsIdentity;
                var userClaims = identity?.Claims?.ToList();

                // Check if the token has the required scope
                var scopeClaim = userClaims?.FirstOrDefault(x => x.Type == "scp" || x.Type == "scope");
                var scopes = scopeClaim?.Value?.Split(' ') ?? new string[0];

                // Verify the custom scope is present
                if (!scopes.Contains("access_as_user"))
                {
                    _logger.LogWarning("Request missing required scope: access_as_user");
                    return new UnauthorizedObjectResult(new { error = "insufficient_scope", error_description = "The request requires the 'access_as_user' scope" });
                }

                // Get user information from the token
                var userObjectId = userClaims?.FirstOrDefault(x => x.Type == "oid")?.Value;
                var userPrincipalName = userClaims?.FirstOrDefault(x => x.Type == "upn")?.Value;
                var appId = userClaims?.FirstOrDefault(x => x.Type == "appid")?.Value;

                _logger.LogInformation($"Authorized request from user: {userPrincipalName} (OID: {userObjectId}), App: {appId}");

                return new OkObjectResult(new
                {
                    message = "Successfully authorized with custom scope",
                    user = new
                    {
                        objectId = userObjectId,
                        userPrincipalName = userPrincipalName,
                        scopes = scopes
                    },
                    app = new
                    {
                        appId = appId
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing authorized request");
                return new StatusCodeResult(500);
            }
        }
    }
}

/*
To use this example:

1. Install required NuGet packages in your Azure Functions project:
   - Microsoft.AspNetCore.Authentication.JwtBearer
   - Microsoft.AspNetCore.Authorization

2. Configure JWT authentication in your Startup.cs or Program.cs:

public void ConfigureServices(IServiceCollection services)
{
    services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = $"https://login.microsoftonline.com/{tenantId}/v2.0";
            options.Audience = "{YOUR_APP_ID_HERE}"; // Replace with your App ID from the script
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true
            };
        });
    
    services.AddAuthorization();
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseAuthentication();
    app.UseAuthorization();
}

3. Call this function from your SharePoint Framework solution:
   - Request a token with scope: "api://{YOUR_APP_ID_HERE}/access_as_user"
   - Include the token in the Authorization header: "Bearer {token}"
*/
