using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using O365C.AIDocument.Assistant.Models;
using O365C.AIDocument.Assistant.Services;

namespace O365C.AIDocument.Assistant
{
    public class DocumentAssistant
    {
        private readonly ILogger<DocumentAssistant> _logger;
        private readonly AzureFunctionSettings _azureFunctionSettings;
        private readonly IAzureAIService _azureAIService;

        public DocumentAssistant(ILogger<DocumentAssistant> logger, AzureFunctionSettings azureFunctionSettings, IAzureAIService azureAIService)
        {
            _logger = logger;
            _azureFunctionSettings = azureFunctionSettings;
            _azureAIService = azureAIService;
        }

        [Function("documentAssistant")]
        public async Task<IActionResult> RunAsync([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            //get query string parameters and validate and convert to model requestDetail
            var requestDetail = new RequestDetail
            {
                SiteUrl = req.Query["siteUrl"].ToString() ?? string.Empty,
                ListName = req.Query["listName"].ToString() ?? string.Empty,
                DriveId = req.Query["driveId"].ToString() ?? string.Empty,
                ItemId = req.Query["itemId"].ToString() ?? string.Empty,
                FileName = req.Query["fileName"].ToString() ?? string.Empty,
                Question = req.Query["question"].ToString() ?? string.Empty

            };

            if (string.IsNullOrEmpty(requestDetail.SiteUrl) || string.IsNullOrEmpty(requestDetail.ListName) || string.IsNullOrEmpty(requestDetail.DriveId) || string.IsNullOrEmpty(requestDetail.ItemId) || string.IsNullOrEmpty(requestDetail.Question))
            {
                return new BadRequestObjectResult("Please pass all required parameters in the query string");
            }

            //call the summarizer service to generate the summary
             var summary = await _azureAIService.GenerateSummary(requestDetail);


            var response = new
            {
                Summary = summary
            };
            return new OkObjectResult(response);
                
            }
        }
    }


