
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.SharePoint.Client;
using DocumentFormat.OpenXml.Wordprocessing;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using System.IO;

using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System.Net.Http.Headers;
using System.Configuration;
using File = Microsoft.SharePoint.Client.File;
using Newtonsoft.Json;
using System.Text;
using System.Security.Claims;

namespace GenerateWordDocFunctionApp
{
    public class Drive
    {
        public string createdDateTime { get; set; }
        public string description { get; set; }
        public string id { get; set; }
        public string lastModifiedDateTime { get; set; }
        public string name { get; set; }
        public string webUrl { get; set; }
        public string driveType { get; set; }

    }
    public class DriveArray
    {
        public Drive[] value { get; set; }

    }

    public class DriveItem
    {
        public string createdDateTime { get; set; }
        public string id { get; set; }
        public string lastModifiedDateTime { get; set; }
        public string name { get; set; }
        public string webUrl { get; set; }
        public int size { get; set; }

    }
    public class PlainTextReplacementParameters
    {
        public string token { get; set; }
        public string value { get; set; }
        public string replacementType { get; set; }  // plainText or picture (for now)
    }

    // see https://docs.microsoft.com/en-us/previous-versions/office/developer/office-2007/cc197932(v=office.12)?redirectedfrom=MSDN
    public class TableColumnReplacementParameters
    {
        public string value { get; set; }
        public string replacementType { get; set; }  // plainText or picture (for now)
    }
    public class TableRowReplacementParameters
    {
        public TableColumnReplacementParameters[] columns        { get; set; }
    }

    public class TableReplacementParameters
    {
        public string token { get; set; }
        public TableRowReplacementParameters[] rows { get; set; }

    }
    public class PostData
    {
        public PlainTextReplacementParameters[] plainTextParameters { get; set; }
        public TableReplacementParameters[] tableParameters { get; set; }
        public string templateServerRelativeUrl { get; set; }
        public string destinationFolderServerRelativeUrl { get; set; }
        public string temporaryFolderServerRelativeUrl { get; set; }
        public string webServerRelativeUrl { get; set; }

        public string fileName { get; set; }
        public string saveAsFormat { get; set; }
    }
    public class ResponseBody
    {
        public string url { get; set; }
        public List<string> messages { get; set; }
        public List<string> tagsFound { get; set; }
    }

    public static class DocumentGenerator
    {



        [FunctionName("GetPDFPreviewUrl")]
        public static async Task<HttpResponseMessage> GetPDFPreviewUrl([HttpTrigger(AuthorizationLevel.Anonymous,
            new string[] { "POST" },Route=null)]HttpRequestMessage req, TraceWriter log,
    ExecutionContext context)
        {
            log.Error("GetPDFPreviewUrl function processed a request.");
            var response = req.CreateResponse();
            HttpClient httpClient = new HttpClient();
            try
            {
                PostData postData = await req.Content.ReadAsAsync<PostData>();
                ValidatePostdata(postData);

                string spRootResourceUrl = $"https://{ConfigurationManager.AppSettings["HostName"]}";
                string spSiteUrl = $"{spRootResourceUrl}{postData.webServerRelativeUrl}";

                var spToken = await GetSharePointAccessTokenForUser(postData.webServerRelativeUrl, req.Headers.Authorization.Parameter);

                //Get CSOM ClientContext using the SharePoint Access Token
                var clientContext = GetAzureADAccessTokenAuthenticatedContext(spSiteUrl, spToken);

                //set httpc;oent tp use accesstoken
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", spToken);
                List<string> messages = new List<string>(); //errors/warnings to send to caller
                List<string> tagsFound = new List<string>(); //list of tags found in document to send to caller
                string localDocxFilePath = null;
                try
                {
                    localDocxFilePath = await CreateLocalDocxFile(log, response, postData, clientContext, messages,tagsFound);
                }
                catch (Exception ex)
                {
                    log.Error(ex.Message);
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.ReasonPhrase = ex.Message;
                    return response;
                }

                UploadFileToSharepoint(log, clientContext, postData.temporaryFolderServerRelativeUrl, localDocxFilePath, postData.fileName + ".docx");
                string url = await GetPDFUrlForSPDocument(log, postData.fileName + ".docx", postData.temporaryFolderServerRelativeUrl, postData.webServerRelativeUrl, httpClient);

                response.StatusCode = HttpStatusCode.OK;
                ResponseBody b = new ResponseBody() { url = url, messages = messages, tagsFound = tagsFound };
                response.Content = new StringContent(JsonConvert.SerializeObject(b), Encoding.UTF8, "application/json");
                return response;
            }
            catch (Exception ex)
            {
                log.Error(ex.Message);
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ReasonPhrase = ex.Message;
                return response;
            }
        }



        [FunctionName("GenerateDocument")]
        public static async Task<HttpResponseMessage> GenerateDocument([HttpTrigger(AuthorizationLevel.Anonymous,
            new string[] { "POST" },Route=null)]HttpRequestMessage req, TraceWriter log,
            ExecutionContext context)
        {
            log.Error("C# HTTP trigger function processed a request.");
            var response = req.CreateResponse();
            HttpClient httpClient = new HttpClient();
            try
            {
                PostData postData = await req.Content.ReadAsAsync<PostData>();
                ValidateGenerateDocumentParams(postData);

                string spRootResourceUrl = $"https://{ConfigurationManager.AppSettings["HostName"]}";
                string spSiteUrl = $"{spRootResourceUrl}{postData.webServerRelativeUrl}";

                var spToken = await GetSharePointAccessTokenForUser(postData.webServerRelativeUrl, req.Headers.Authorization.Parameter);

                //Get CSOM ClientContext using the SharePoint Access Token
                var clientContext = GetAzureADAccessTokenAuthenticatedContext(spSiteUrl, spToken);

                //set httpclient tp use accesstoken
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", spToken);

                string localDocxFilePath = null;
                List<string> messages = new List<string>();
                List<string> tagsFound = new List<string>(); //list of tags found in document to send to caller
                try
                {
                    localDocxFilePath = await CreateLocalDocxFile(log, response, postData, clientContext, messages, tagsFound);
                }
                catch (Exception ex)
                {
                    log.Error(ex.Message);
                    response.StatusCode = HttpStatusCode.BadRequest;
                    response.ReasonPhrase = ex.Message;
                    return response;
                }
                string docUrl = "";
                // Upload the file to a sharepoint
                if (postData.saveAsFormat.ToLower() == "docx") // if docx, just upload to destination
                {
                    docUrl = UploadFileToSharepoint(log, clientContext, postData.destinationFolderServerRelativeUrl, localDocxFilePath, postData.fileName + ".docx");
                }
                else // upload tp sp temp directory, download that as pdf, upload the pdyf to destination
                {
                    // upload docx to the temporary library
                    UploadFileToSharepoint(log, clientContext, postData.temporaryFolderServerRelativeUrl, localDocxFilePath, postData.fileName + ".docx");
                    //download it to a temporary file in PDF foprmat
                    string localPdfFilePath = await DownloadFileFromSPAsPDF(log, postData.fileName + ".docx", postData.temporaryFolderServerRelativeUrl, postData.webServerRelativeUrl, httpClient);
                    //upload the pdf to the destination folder
                    docUrl = UploadFileToSharepoint(log, clientContext, postData.destinationFolderServerRelativeUrl, localPdfFilePath, postData.fileName + ".pdf");
                }

                response.StatusCode = HttpStatusCode.OK;
                ResponseBody b = new ResponseBody() { url = docUrl, messages = messages, tagsFound = tagsFound };
                response.Content = new StringContent(JsonConvert.SerializeObject(b), Encoding.UTF8, "application/json");
                return response;
            }
            catch (Exception ex)
            {
                log.Error(ex.Message);
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ReasonPhrase = ex.Message;
                return response;
            }
        }
        private static void ValidateGenerateDocumentParams(PostData pd)
        {
            if (string.IsNullOrEmpty(pd.saveAsFormat))
            {
                throw new Exception($"saveAsFormat is null or empty. Please specify DOCX or PDF for the saveAsFormat.");
            }
            if (pd.saveAsFormat.ToLower() != "pdf" && pd.saveAsFormat.ToLower() != "docx")
            {
                throw new Exception($"saveAsFormat {pd.saveAsFormat} is invalid. Please specify DOCX or PDF for the saveAsFormat.");
            }
            if (string.IsNullOrEmpty(pd.destinationFolderServerRelativeUrl))
            {
                throw new Exception($"destinationFolderServerRelativeUrl is null or empty. Please specify a valid destination folder.");
            }
            // do common validation
            ValidatePostdata(pd);
        }

        private static void ValidatePostdata(PostData pd)
        {
            if (string.IsNullOrEmpty(pd.temporaryFolderServerRelativeUrl))
            {
                throw new Exception($"temporaryFolderServerRelativeUrl is null or empty. Please provide the relative url for a temporary folder.");
            }
            if (string.IsNullOrEmpty(pd.webServerRelativeUrl))
            {
                throw new Exception($"webServerRelativeUrl is null or empty. Please provide the relative url of the sit that will store the documents generated.");
            }
            if (string.IsNullOrEmpty(pd.templateServerRelativeUrl))
            {
                throw new Exception($"templateServerRelativeUrl is null or empty. Please specify  the relative url of the docx file to be used as a template.");
            }
            if (!pd.templateServerRelativeUrl.ToLower().EndsWith(".docx"))
            {
                throw new Exception($"The template {pd.templateServerRelativeUrl} is invalid. Please specify a docx file.");
            }
            if (string.IsNullOrEmpty(pd.fileName))
            {
                throw new Exception($"The file name  is null or empty. Please specify a valid file name.");
            }
            ValidateReplacementParameters(pd.plainTextParameters);
        }
        private static void ValidateReplacementParameters(PlainTextReplacementParameters[] replacmentParams)
        {
            if (replacmentParams.Length == 0)
            {
                throw new Exception($"replacmentParams are missinig on the postData");
            }
            var ctr = 1;
            foreach (var replacmentParam in replacmentParams)
            {
                if (string.IsNullOrEmpty(replacmentParam.replacementType))
                {
                    throw new Exception($"replacementType is null or empty on parameter number {ctr}. Please specify 'PlainText' or 'Image' for the replacementType.");
                }
                if (replacmentParam.replacementType.ToLower() != "plaintext" && replacmentParam.replacementType.ToLower() != "image")
                {
                    throw new Exception($"replacementType {replacmentParam.replacementType}  on parameter number {ctr} is invalid. Please specify 'PlainText' or 'Image' for the replacementType.");
                }
                if (string.IsNullOrEmpty(replacmentParam.token))
                {
                    throw new Exception($"token is null or empty on parameter number {ctr}. Please specify the name of the token that appears in your template.");
                }



            }

        }
        private static async Task<string> GetSharePointAccessTokenForUser(string webServerRelativeUrl, string incomingAccessToken)
        {
            /***  
 * SEE https://www.vrdmn.com/2018/05/spfx-calling-back-to-sharepoint-from.html

 */
            //Exchange the SPFx access token with another Access token containing the delegated scope for Microsoft Graph
            ClientCredential clientCred = new ClientCredential(ConfigurationManager.AppSettings["ClientId"], ConfigurationManager.AppSettings["ClientSecret"]);
            UserAssertion userAssertion = new UserAssertion(incomingAccessToken);

            string authority = $"https://login.microsoftonline.com/{ConfigurationManager.AppSettings["TenantId"]}";
            var authContext = new AuthenticationContext(authority);
            AuthenticationResult authResult;
            string spRootResourceUrl = $"https://{ConfigurationManager.AppSettings["HostName"]}";
            try
            {
                authResult = await authContext.AcquireTokenAsync(spRootResourceUrl, clientCred, userAssertion);
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred aquiring the SharePoint access token. Please ensure that the client ID and client secret of the App Registration have been added to the ClientID and ClientSecrest settings on this Azure function.");
            }

            return authResult.AccessToken;

        }

        private static async Task<string> CreateLocalDocxFile(TraceWriter log, HttpResponseMessage response, PostData postData, ClientContext clientContext, List<string> messages, List<string> tagsFound)
        {
            // Get the document template
            File templateFile = null;
            try
            {
                templateFile = clientContext.Site.RootWeb.GetFileByServerRelativeUrl(postData.templateServerRelativeUrl);
                clientContext.Load(templateFile);
                clientContext.ExecuteQueryRetry();
            }
            catch (Exception err)
            {
                string message = $"Error loading template file {postData.templateServerRelativeUrl}. Message was  {err.Message}";
                throw new Exception(message);

            }
            if (templateFile != null)
            {
                // download the template as a stream  
                ClientResult<Stream> templatestream = templateFile.OpenBinaryStream();
                clientContext.ExecuteQueryRetry();

                //save the template to a local file
                var localDocxFilePath = System.IO.Path.Combine(System.IO.Path.GetTempPath(), Guid.NewGuid().ToString()) + ".docx";
                using (Stream fileStream = new FileStream(localDocxFilePath, FileMode.Create))
                {
                    templatestream.Value.CopyTo(fileStream);
                }

                // open the local file as a WordProcessingDocument
                WordprocessingDocument localDocxFile = WordprocessingDocument.Open(localDocxFilePath, true);

                DumpTags(localDocxFile, tagsFound); // get a list of tags in the document so we can rtun to client to help troubleshooting
                // replace all the content controls 
                foreach (var replacementParm in postData.plainTextParameters)
                {
                    switch (replacementParm.replacementType.ToLower())
                    {
                        case "plaintext":
                            localDocxFile = InsertText(localDocxFile, replacementParm.token, replacementParm.value, log, messages);
                            break;
                        case "image":
                            localDocxFile = InsertImages(localDocxFile, clientContext, replacementParm.token, replacementParm.value, log, messages);
                            break;
                        default:
                            throw new Exception($"Invalid replacement type {replacementParm.replacementType}");
                    }
                }

                // experimantal replace all the tables 
                foreach (var tableParm in postData.tableParameters)
                {
                    localDocxFile = ReplaceTable(localDocxFile, tableParm, log, messages);
                }

                // remove the content controls
                IEnumerable<string> m_oEnum = new string[] { "ptIncidentSummary" };
                localDocxFile = RemoveSdtBlocks(localDocxFile, m_oEnum);


                //save the updated document to the local file system
                localDocxFile.Save();
                localDocxFile.Close(); // file now saved to local folder


                return localDocxFilePath;
            }
            else
            {
                throw new Exception("List is not available on the site");
            }
        }

     
        private static async Task<string> DownloadFileFromSPAsPDF(TraceWriter log, string fileName, string tempFilePath, string webServerRelativeUrl, HttpClient httpClient)
        {
            string requestUrl = await GetPDFUrlForSPDocument(log, fileName, tempFilePath, webServerRelativeUrl, httpClient);
            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            request.Headers.Add("accept", "application/pdf");

            var response = await httpClient.SendAsync(request);
            string pdfFileContents = await response.Content.ReadAsStringAsync();
            var localPDFFilePath = System.IO.Path.Combine(System.IO.Path.GetTempPath(), Guid.NewGuid().ToString()) + ".pdf";

            using (Stream fileStream = new FileStream(localPDFFilePath, FileMode.Create))
            {
                await response.Content.CopyToAsync(fileStream);
            }
            log.Info($"wrote pdf file contents to ${localPDFFilePath}");

            return localPDFFilePath;

        }

        private static async Task<string> GetPDFUrlForSPDocument(TraceWriter log, string fileName, string tempFilePath, string webServerRelativeUrl, HttpClient httpClient)
        {
            string libraryName = tempFilePath.Substring(tempFilePath.LastIndexOf("/") + 1);
            string HostName = System.Configuration.ConfigurationManager.AppSettings["HostName"];

            Drive drive = await GetDriveByLibraryName(log, httpClient, HostName, webServerRelativeUrl, libraryName);
            string requestFormat = "https://{0}{1}/_api/v2.0/drives/{2}/root:/{3}:/content?format=pdf";
            string requestUrl = string.Format(requestFormat, HostName, webServerRelativeUrl, drive.id, fileName);
            log.Error("Url to get doc from sharepoint as a pdf is   :" + requestUrl);
            return requestUrl;
        }

        public static string UploadFileToSharepoint(TraceWriter log, ClientContext clientContext, string destinationFolderServerRelativeURL, String filePath, string spFileName)
        {
            Folder folder = null;
            try
            {
                folder = clientContext.Web.GetFolderByServerRelativeUrl(destinationFolderServerRelativeURL);
                clientContext.ExecuteQuery();

            }
            catch (Exception err)
            {
                var message = $"Error accessing destination folder {destinationFolderServerRelativeURL}. Please make sure the folder exists and you have write access to it and that the file is not opened in another browser.";
                log.Error(message, err);
                throw new Exception(message);
            }
            File newFile = null;
            try
            {
                newFile = folder.UploadFile(spFileName, filePath, true);
                return $"https://{ConfigurationManager.AppSettings["HostName"]}{newFile.ServerRelativeUrl}";
            }
            catch (Exception err)
            {
                var message = $"Error uploading file {spFileName} to  destination folder {destinationFolderServerRelativeURL}. Please make sure you have Write access to it, and that the file is not opened in another browser.";
                log.Error(message, err);
                throw new Exception(message);
            }
        }

        public static ClientContext GetAzureADAccessTokenAuthenticatedContext(string siteUrl, string accessToken)
        {
            var clientContext = new ClientContext(siteUrl);

            clientContext.ExecutingWebRequest += (sender, args) =>
            {
                args.WebRequestExecutor.RequestHeaders["Authorization"] = "Bearer " + accessToken;
            };

            return clientContext;
        }


        public static async Task<Drive> GetDriveByLibraryName(TraceWriter log, HttpClient httpClient, string hostName, string siteServerRelativeUrl, string libraryName)
        {
            var drives = await GetDrives(log, httpClient, hostName, siteServerRelativeUrl);
            foreach (var drive in drives)
            {
                if (drive.name == libraryName)
                {
                    return drive;
                }
            }
            log.Error("Library:" + libraryName + " Not found");
            return null;

        }
        private static async Task<Drive[]> GetDrives(TraceWriter log, HttpClient httpClient, string hostName, string webServerRelativeUrl)
        {
            DriveArray drives = null;
            string requestFormat = "https://{0}{1}/_api/v2.0/drives";
            string requestUrl = string.Format(requestFormat, hostName, webServerRelativeUrl);
            log.Error(requestUrl);

            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            var response = await httpClient.SendAsync(request);
            drives = await response.Content.ReadAsAsync<DriveArray>();
            return drives.value;

        }
        #region WordprocessingDocument methods
        public static WordprocessingDocument InsertImages(this WordprocessingDocument doc, ClientContext clientContext, string contentControlTag, string attachementServerRelativeUrl, TraceWriter log, List<string> messages)
        {
            try
            {
                SdtElement cc = doc.MainDocumentPart.Document.Body.Descendants<SdtElement>().FirstOrDefault(c =>
           {
               SdtProperties p = c.Elements<SdtProperties>().FirstOrDefault();
               if (p != null)
               {
                       // Is it a picture content control? 
                       SdtContentPicture pict = p.Elements<SdtContentPicture>().FirstOrDefault();
                       // Get the alias. 
                       SdtAlias a = p.Elements<SdtAlias>().FirstOrDefault();

                   if (pict != null && a.Val == contentControlTag)
                       return true;
               }
               return false;
           });
                string embed = null;
                if (cc != null)
                {
                    Drawing dr = cc.Descendants<Drawing>().FirstOrDefault();
                    if (dr != null)
                    {
                        DocumentFormat.OpenXml.Drawing.Blip blip = dr.Descendants<DocumentFormat.OpenXml.Drawing.Blip>().FirstOrDefault();
                        if (blip != null)
                            embed = blip.Embed;
                    }
                }
                if (embed != null)
                {
                    IdPartPair idpp = doc.MainDocumentPart.Parts
                    .Where(pa => pa.RelationshipId == embed).FirstOrDefault();
                    if (idpp != null)
                    {
                        ImagePart ip = (ImagePart)idpp.OpenXmlPart;
                        var attachmentFile = clientContext.Site.RootWeb.GetFileByServerRelativeUrl(attachementServerRelativeUrl);
                        clientContext.Load(attachmentFile);
                        clientContext.ExecuteQueryRetry();
                        if (attachmentFile != null)
                        {
                            // Returns required result  
                            ClientResult<Stream> attachmentStream = attachmentFile.OpenBinaryStream();
                            clientContext.ExecuteQueryRetry();
                            ip.FeedData(attachmentStream.Value);
                        }
                    }
                }
                return doc;
            }
            catch (Exception ex)
            {
                string message = $"An error occurred replacing Image Content Control Tag \"{contentControlTag}\". Please ensure its an Image Content Control, and the value is the server relative url of an image file that you have access to";
                log.Info(message);
                messages.Add(message);
                return doc;
            }
        }

        public static WordprocessingDocument InsertText(this WordprocessingDocument doc, string contentControlTag, string text, TraceWriter log, List<string> messages)
        {
            try
            {
                SdtElement element = doc.MainDocumentPart.Document.Body.Descendants<SdtElement>()
                  .FirstOrDefault(sdt => sdt.SdtProperties.GetFirstChild<Tag>()?.Val == contentControlTag);

                if (element == null)
                {
                    string message = $"ContentControlTag \"{contentControlTag}\" doesn't exist.";
                    log.Info(message);
                    messages.Add(message);
                }
                else
                {
                    element.Descendants<Text>().First().Text = text;
                    element.Descendants<Text>().Skip(1).ToList().ForEach(t => t.Remove());
                }

                return doc;
            }
            catch (Exception ex)
            {
                string message = $"An error occurred replacing Plain Text ContentControlTag \"{contentControlTag}\". Please ensure its a Plain Text COntent Control.";
                log.Info(message);
                messages.Add(message);
                return doc;
            }


        }
        private static List<String> DumpTags(WordprocessingDocument localDocxFile, List<string> tags)
        {
            var elements = localDocxFile.MainDocumentPart.Document.Body.Descendants();
            var count = elements.Count();
            foreach (var element in elements)
            {

                if (element.GetType().IsSubclassOf(typeof(SdtElement)))
                {
                    SdtElement block = (SdtElement)element;
                    SdtProperties prop = block.SdtProperties;
                    var tag = prop.GetFirstChild<Tag>();
                    if (tag != null)
                    {
                        tags.Add(tag.Val);
                    }

                }

            }
            return tags;
        }
        private static WordprocessingDocument ReplaceTable(WordprocessingDocument localDocxFile, TableReplacementParameters tableParm, TraceWriter log, List<string> messages)
        {
            try
            {
                MainDocumentPart mainPart = localDocxFile.MainDocumentPart;
                var stuff = mainPart.Document.Body.Descendants<SdtElement>();
                SdtElement ccWithTable = localDocxFile.MainDocumentPart.Document.Body.Descendants<SdtElement>()
                  .FirstOrDefault(sdt => sdt.SdtProperties.GetFirstChild<Tag>()?.Val == tableParm.token);

                //                SdtElement ccWithTable = mainPart.Document.Body.Descendants<SdtElement>().Where
                //               (r => r.SdtProperties.GetFirstChild<Tag>().Val == tableParm.token).Single();

                // This should return only one table.
                Table theTable = ccWithTable.Descendants<Table>().Single();

                // Get the last row in the table. Table should have one tow with titles and an empty data row.
                TableRow theRow = theTable.Elements<TableRow>().Last();
                foreach (var tblParmRow in tableParm.rows)
                {
                    TableRow rowCopy = (TableRow)theRow.CloneNode(true);
                    int colidx = 0;
                    foreach (var tblParmCol in tblParmRow.columns)
                    {
                        Console.WriteLine(tblParmCol.value);
                        rowCopy.Descendants<TableCell>().ElementAt(colidx).Append(new Paragraph
                        (new Run(new Text(tblParmCol.value))));
                        colidx++;
                    }
                    theTable.AppendChild(rowCopy);
                }
                // Remove the empty placeholder row from the table.
                theTable.RemoveChild(theRow);

                // Save the changes to the table back into the document.
                mainPart.Document.Save();

                return localDocxFile;
            }
            catch (Exception ex)
            {
                string message = $"An error occurred replacing the table in Plain Text Content Control Tag \"{tableParm.token}\". Please ensure its a Plain Text COntent Control that contains a table, and the number of columns in that table is equal to the number of columns in the JSON array.";
                log.Info(message);
                messages.Add(message);
                return localDocxFile;
            }


        }

        internal static WordprocessingDocument RemoveSdtBlocks(this WordprocessingDocument doc, IEnumerable<string> contentBlocks)
        {
            List<SdtElement> SdtBlocks = doc.MainDocumentPart.Document.Descendants<SdtElement>().ToList();

            if (contentBlocks == null)
                return doc;

            foreach (var s in contentBlocks)
            {
                SdtElement currentElement = SdtBlocks.FirstOrDefault(sdt => sdt.SdtProperties.GetFirstChild<Tag>()?.Val == s);
                if (currentElement == null)
                    continue;
                IEnumerable<OpenXmlElement> elements = null;

                if (currentElement is SdtBlock)
                    elements = (currentElement as SdtBlock).SdtContentBlock.Elements();
                else if (currentElement is SdtCell)
                    elements = (currentElement as SdtCell).SdtContentCell.Elements();
                else if (currentElement is SdtRun)
                    elements = (currentElement as SdtRun).SdtContentRun.Elements();

                foreach (var el in elements)
                    currentElement.InsertBeforeSelf(el.CloneNode(true));
                currentElement.Remove();
            }
            return doc;
        }
        #endregion WordprocessingDocument methods
    }
}
