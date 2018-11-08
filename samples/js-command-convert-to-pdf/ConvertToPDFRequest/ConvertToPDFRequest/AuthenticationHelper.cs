using System;
using System.Diagnostics;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using Microsoft.SharePoint.Client;

namespace ConvertToPDFRequest
{
    class AuthenticationHelper
    {

        static string clientId = EnvironmentConfigurationManager.GetSetting("ClientId");
        static string clientSecret = EnvironmentConfigurationManager.GetSetting("ClientSecret");
        static string authortityUri = "https://login.microsoftonline.com/" + EnvironmentConfigurationManager.GetSetting("TenantId") + "/oauth2/v2.0/token";

        public static ConfidentialClientApplication IdentityAppOnlyApp = new ConfidentialClientApplication(clientId, authortityUri, EnvironmentConfigurationManager.GetSetting("RedirectUri"), new ClientCredential(clientSecret), new TokenCache(), new TokenCache());
        public static string TokenForApp = null;
        private static GraphServiceClient graphClient = null;

        public static GraphServiceClient GetAuthenticatedClientForApp()
        {

            // Create Microsoft Graph client.
            try
            {
                graphClient = new GraphServiceClient(
                    "https://graph.microsoft.com/v1.0",
                    new DelegateAuthenticationProvider(
                        async (requestMessage) =>
                        {
                            var token = await GetTokenForAppAsync();
                            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("bearer", token);

                        }));
                return graphClient;
            }

            catch (Exception ex)
            {
                Debug.WriteLine("Could not create a graph client: " + ex.Message);
            }


            return graphClient;
        }

        public static ClientContext GetSPAuthContext(string siteUrl)
        {
            var authManager = new OfficeDevPnP.Core.AuthenticationManager();
            return authManager.GetAppOnlyAuthenticatedContext(siteUrl, clientId, clientSecret);
        }


        /// <summary>
        /// Get Token for App.
        /// </summary>
        /// <returns>Token for app.</returns>
        public static async Task<string> GetTokenForAppAsync()
        {
            AuthenticationResult authResult;

            authResult = await IdentityAppOnlyApp.AcquireTokenForClientAsync(new string[] { "https://graph.microsoft.com/.default" });
            TokenForApp = authResult.AccessToken;

            return TokenForApp;
        }




    }
}
