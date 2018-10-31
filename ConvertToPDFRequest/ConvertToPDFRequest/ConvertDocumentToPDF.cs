using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Graph;
using Microsoft.SharePoint.Client;


namespace ConvertToPDFRequest
{
    public static class ConvertDocumentToPDF
    {
        [FunctionName("ConvertDocumentToPDF")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)]HttpRequestMessage req, TraceWriter log)
        {
            log.Info("C# HTTP trigger function processed a request.");

            // parse query parameters
            string itemNames = req.GetQueryNameValuePairs()
               .FirstOrDefault(q => string.Compare(q.Key, "itemNames", true) == 0)
               .Value;

            string siteUrl = req.GetQueryNameValuePairs()
               .FirstOrDefault(q => string.Compare(q.Key, "siteUrl", true) == 0)
               .Value;

            string libraryName = req.GetQueryNameValuePairs()
              .FirstOrDefault(q => string.Compare(q.Key, "libraryName", true) == 0)
              .Value;

            string newDocumentName = req.GetQueryNameValuePairs()
               .FirstOrDefault(q => string.Compare(q.Key, "newDocumentName", true) == 0)
               .Value;

            bool errorOccurred = false;

            try
            {
                List<string> itemNamesList = itemNames.Split(';').ToList();
                foreach (var item in itemNamesList)
                {
                    log.Info($"Processing {item}");

                    string itemUrl = $"{siteUrl}/{libraryName}/{item}";
                    if (String.IsNullOrEmpty(newDocumentName))
                    {
                        newDocumentName = item.Substring(0, item.IndexOf("."));
                    }

                    string base64Value = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(itemUrl));
                    string encodedUrl = "u!" + base64Value.TrimEnd('=').Replace('/', '_').Replace('+', '-');

                    GraphServiceClient client = GetClient(log);

                    List<Option> options = new List<Option>();
                    options.Add(new QueryOption("format", "pdf"));

                    //Get the stream
                    Stream pdfStream = client.Shares[encodedUrl].DriveItem.Content.Request(options).GetAsync().Result;

                    using (ClientContext clientContext = AuthenticationHelper.GetSPAuthContext(siteUrl))
                    {
                        Microsoft.SharePoint.Client.List library = clientContext.Web.Lists.GetByTitle(libraryName);

                        log.Info($"Uploading {newDocumentName}.pdf");
                        //Use code from PnP team to upload the file using stream
                        library.RootFolder.UploadFile($"{newDocumentName}.pdf", pdfStream, true);
                        newDocumentName = "";
                    }
                }

            }
            catch (Exception ex)
            {
                log.Error(ex.Message);
                errorOccurred = true;
            }

            return errorOccurred
                ? req.CreateResponse(HttpStatusCode.BadRequest, "There was an error, please check the logs.")
                : req.CreateResponse(HttpStatusCode.OK, "Done");
        }

        private static GraphServiceClient GetClient(TraceWriter log)
        {
            try
            {
                GraphServiceClient client = AuthenticationHelper.GetAuthenticatedClientForApp();
                return client;
            }
            catch (Exception ex)
            {
                if (ex.InnerException != null)
                {
                    log.Error("Error detail: " + ex.InnerException.Message);
                }
                return null;
            }
        }

    }
}
