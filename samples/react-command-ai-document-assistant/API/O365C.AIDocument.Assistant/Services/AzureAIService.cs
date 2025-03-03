using O365C.AIDocument.Assistant.Models;
using OpenAI.Assistants;
using System.Text;
using OpenAI;
using OpenAI.Files;

namespace O365C.AIDocument.Assistant.Services
{
    public interface IAzureAIService
    {
        Task<string> GenerateSummary(RequestDetail requestDetail);
    }

    internal class AzureAIService : IAzureAIService
    {
        private readonly IGraphAPIService _graphAPIService;
        private readonly AzureFunctionSettings _azureFunctionSettings;


        public AzureAIService(IGraphAPIService graphAPIService, AzureFunctionSettings azureFunctionSettings)
        {
            _graphAPIService = graphAPIService;
            _azureFunctionSettings = azureFunctionSettings;

        }
        public async Task<string> GenerateSummary(RequestDetail requestDetail)
        {

            var result = new StringBuilder();
            try
            {

                //Fetch file from SharePoint document library using Graph API as PDF stream
                var fileStream = await _graphAPIService.GetFileStream(requestDetail.DriveId, requestDetail.ItemId, requestDetail.FileName);

                //If the requestDetail.FileName is not a PDF file, rename the extension to .pdf
                if (!requestDetail.FileName.EndsWith(".pdf"))
                {
                    requestDetail.FileName = requestDetail.FileName.Replace(System.IO.Path.GetExtension(requestDetail.FileName), ".pdf");
                }    


                // Assistants is a beta API and subject to change; acknowledge its experimental status by suppressing the matching warning.
                #pragma warning disable OPENAI001                
                OpenAIClient openAIClient = new OpenAIClient(_azureFunctionSettings.APIKey);              
                OpenAIFileClient fileClient = openAIClient.GetOpenAIFileClient();
                AssistantClient assistantClient = openAIClient.GetAssistantClient();                            

                AssistantCreationOptions assistantCreationOptions = new AssistantCreationOptions()
                {
                    Name = "DocumentAssistant",
                    Instructions =
            @"You are FileSearchPro and CodeInterpreter Pro, an intelligent assistant designed to help users locate information within their uploaded files. Your primary function is to search through these documents and provide accurate, concise answers to users' questions. You understand various file types and can extract relevant data, ensuring users get the information they need quickly and efficiently.
            Key Features:
            Efficiently search all uploaded documents to extract precise information.
            Provide clear, straightforward answers directly from the file contents.
            Maintain confidentiality and security of all user data.
            Offer guidance on effective search queries if needed.            
            Always strive to deliver accurate and helpful information, enhancing users' ability to access and utilize their stored documents effectively.
            Use CodeInterpreter where necessary to interpret code snippets or data analysis within the uploaded files.",

                    Tools = { ToolDefinition.CreateFileSearch(), ToolDefinition.CreateCodeInterpreter() }
                };


                // Check if the assistant already exists, if not create a new one
                var assistant = await assistantClient.CreateAssistantAsync("gpt-4o", assistantCreationOptions);


                var fileUploadResponse = await openAIClient.GetOpenAIFileClient().UploadFileAsync(fileStream, requestDetail.FileName, FileUploadPurpose.Assistants);
                Console.WriteLine($"Uploaded file {fileUploadResponse.Value.Filename}");


                var thread = await assistantClient.CreateThreadAsync();

                requestDetail.Question = $"{requestDetail.Question}.Do not add any references related to citations";


                var messageCreationOptions = new MessageCreationOptions();
                messageCreationOptions.Attachments.Add(new MessageCreationAttachment(fileUploadResponse.Value.Id, new List<ToolDefinition>() { ToolDefinition.CreateFileSearch(), ToolDefinition.CreateCodeInterpreter() }));

                await assistantClient.CreateMessageAsync(thread.Value.Id, MessageRole.User, new List<OpenAI.Assistants.MessageContent>() { OpenAI.Assistants.MessageContent.FromText(requestDetail.Question) }, messageCreationOptions);

                await foreach (StreamingUpdate streamingUpdate
                        in assistantClient.CreateRunStreamingAsync(thread.Value.Id, assistant.Value.Id, new RunCreationOptions()))
                {
                    if (streamingUpdate.UpdateKind == StreamingUpdateReason.RunCreated)
                    {
                        Console.WriteLine($"--- Run started! ---");
                    }

                    else if (streamingUpdate is MessageContentUpdate contentUpdate)
                    {
                        if (contentUpdate?.TextAnnotation?.InputFileId == fileUploadResponse.Value.Id)
                        {
                            Console.Write(" (From: " + fileUploadResponse.Value.Filename + ")");
                        }
                        else
                        {
                            result.Append(contentUpdate?.Text);
                            Console.Write(contentUpdate?.Text);
                        }
                    }
                }

                // clean up the file and assistant
                Console.WriteLine("Cleaning up and exiting...");
                await openAIClient.GetOpenAIFileClient().DeleteFileAsync(fileUploadResponse.Value.Id);
                await assistantClient.DeleteThreadAsync(thread.Value.Id);
                await assistantClient.DeleteAssistantAsync(assistant.Value.Id);

                return result.ToString();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error generating summary: {ex.Message}");
            }

        }


    }
}
