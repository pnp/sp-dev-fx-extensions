using Microsoft.Graph;
using O365C.AIDocument.Assistant.Helpers;
using O365C.AIDocument.Assistant.Models;

namespace O365C.AIDocument.Assistant.Services
{
    public interface IGraphAPIService
    {
        Task<Stream> GetFileStream(string driveId, string driveItemId, string fileName);

    }
    public class GraphAPIService : IGraphAPIService
    {
        private readonly AzureFunctionSettings _azureFunctionSettings;
        public GraphAPIService(AzureFunctionSettings azureFunctionSettings)
        {
            _azureFunctionSettings = azureFunctionSettings;
        }

        public async Task<Stream> GetFileStream(string driveId, string driveItemId, string fileName)
        {
            try
            {
                var graphClient = GraphAuthenticationManager.GetAuthenticatedGraphClient(_azureFunctionSettings);
                if (graphClient == null)
                {
                    throw new Exception("Graph client not initialised");
                }

                if (graphClient == null)
                {
                    throw new Exception("Graph client not initialised");
                }

                Stream fileStream;
                
                if (!fileName.EndsWith(".pdf"))
                {
                    fileStream = await graphClient.Drives[driveId].Items[driveItemId].Content.GetAsync((requestConfiguration) =>
                    {
                        if (fileName.EndsWith(".pdf"))
                        {
                            requestConfiguration.QueryParameters.Format = "pdf";
                        }
                    }) ?? throw new Exception("File stream is null.");
                }
                else
                {
                    fileStream = await graphClient.Drives[driveId].Items[driveItemId].Content.GetAsync() ?? throw new Exception("File stream is null.");
                }                             
            

                return fileStream;
            }
            catch (ServiceException ex)
            {
                // Handle exception
                throw new Exception($"Error fetching PDF file stream: {ex.Message}");
            }
        }

    }
}
