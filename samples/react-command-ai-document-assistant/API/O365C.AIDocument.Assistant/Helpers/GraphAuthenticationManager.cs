﻿using Azure.Identity;
using Microsoft.Graph;
using O365C.AIDocument.Assistant.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace O365C.AIDocument.Assistant.Helpers
{
    public class GraphAuthenticationManager
    {
        private static GraphServiceClient? _appGraphClient;

        public static GraphServiceClient GetAuthenticatedGraphClient(AzureFunctionSettings config)
        {

            try
            {
                if (_appGraphClient == null)
                {
                    // The client credentials flow requires that you request the
                    // /.default scope, and pre-configure your permissions on the
                    // app registration in Azure. An administrator must grant consent
                    // to those permissions beforehand.
                    var scopes = new[] { "https://graph.microsoft.com/.default" };

                    // Values from app registration
                    var clientId = config.ClientId;
                    var tenantId = config.TenantId;
                    var clientSecret = config.ClientSecret;

                    // using Azure.Identity;
                    var options = new ClientSecretCredentialOptions
                    {
                        AuthorityHost = AzureAuthorityHosts.AzurePublicCloud,
                    };

                    // https://learn.microsoft.com/dotnet/api/azure.identity.clientsecretcredential
                    var clientSecretCredential = new ClientSecretCredential(
                        tenantId, clientId, clientSecret, options);

                    _appGraphClient = new GraphServiceClient(clientSecretCredential);
                    return _appGraphClient;
                }
                else
                {
                    return _appGraphClient;
                }

            }
            catch (Exception)
            {

                throw;
            }

        }
    }
}
