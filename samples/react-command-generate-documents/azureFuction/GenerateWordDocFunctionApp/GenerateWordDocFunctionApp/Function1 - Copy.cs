/*** S 
 * 
 * 
 * 
 * SEE https://www.vrdmn.com/2018/05/spfx-calling-back-to-sharepoint-from.html
 * 
 * 
 * 
 */
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
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Net.Http.Formatting;
using File = Microsoft.SharePoint.Client.File;
//using DocumentFormat.OpenXml.Drawing;

namespace GenerateWordDocFunctionApp
{
    public class Drive2
    {
        public string createdDateTime { get; set; }
        public string description { get; set; }
        public string id { get; set; }
        public string lastModifiedDateTime { get; set; }
        public string name { get; set; }
        public string webUrl { get; set; }
        public string driveType { get; set; }

    }
    public class DriveArray2
    {
        public Drive[] value { get; set; }

    }

    public class DriveItem2
    {
        public string createdDateTime { get; set; }
        public string id { get; set; }
        public string lastModifiedDateTime { get; set; }
        public string name { get; set; }
        public string webUrl { get; set; }
        public int  size { get; set; }

    }
    public class PlainTextReplacementParameters2
    {
        public string token { get; set; }
        public string value { get; set; }
        public string replacementType { get; set; }  // plainText or picture (for now)
    }
    public class CheckboxReplacementParameters2
    {
        public string token { get; set; }
        public Boolean value { get; set; }

    }
    public class PostData2
    {
        public PlainTextReplacementParameters[] plainTextParameters { get; set; }

        public int itemId { get; set; }
        public string templateServerRelativeUrl { get; set; }
        public string destinationFolderServerRelativeURL { get; set; }
        public string temporaryFolderServerRelativeURL { get; set; }
        public string fileName { get; set; }
        public string saveAsFormat { get; set; }
    }
    public static class Function2
    {
        public static ClientContext cx;
        public static Document doc;


        private static HttpClient httpClient = new HttpClient();



        [FunctionName("Function1")]
        public static async Task<HttpResponseMessage> GenerateWordDocument([HttpTrigger(AuthorizationLevel.Anonymous,
            new string[] { "POST", "OPTIONS" },Route=null)]HttpRequestMessage req, TraceWriter log,
            ExecutionContext context)
        {
            log.Error("C# HTTP trigger function processed a request.");

            //await GraphTest(req, log);
            string ClientId = "e107dec4-7c7d-4885-bd6f-9e9f7836cfee";
            string ClientSecret = "L4Xyhe/+kp.AM+puheZ4KhjH3BEeH7zQ";
            string TenantId = "9eec07e6-f6f8-4e24-b4c7-c5868500b417";
            string spRootResourceUrl = "https://tronoxglobal.sharepoint.com";
            var response2 = req.CreateResponse();
            PostData postData = await req.Content.ReadAsAsync<PostData>();
            string spSiteUrl = $"{spRootResourceUrl}/sites/Sustainability";
            string authority = $"https://login.microsoftonline.com/{TenantId}";

            //Access token coming from SPFx AadHttpClient with "user_impersonation" Scope

            var userImpersonationAccessToken = req.Headers.Authorization.Parameter;

            //Exchange the SPFx access token with another Access token containing the delegated scope for Microsoft Graph
            ClientCredential clientCred = new ClientCredential(ClientId, ClientSecret);
            UserAssertion userAssertion = new UserAssertion(userImpersonationAccessToken);
            //For production, use a Token Cache like Redis https://blogs.msdn.microsoft.com/mrochon/2016/09/19/using-redis-as-adal-token-cache/
            var authContext = new AuthenticationContext(authority);
            log.Error($"AcquireTokenAsync reoiecyr ${spRootResourceUrl} is  clicred is ${clientCred} ua is ${userAssertion}");
            AuthenticationResult authResult = await authContext.AcquireTokenAsync(spRootResourceUrl, clientCred, userAssertion);

            var spAccessToken = authResult.AccessToken;

            //Get CSOM ClientContext using the SharePoint Access Token
            var clientContext = GetAzureADAccessTokenAuthenticatedContext(spSiteUrl, spAccessToken);
             return await GenerateFile(log, response2, postData, clientContext, req.Headers.Authorization.Parameter);



            // OLD WAY:::::::: Without impersonation
            ////http://localhost:7071/api/Function1?templatePath=/sites/Sustainability/templates/testtmpl.docx&destinationFolderServerRelativeURL=/sites/Sustainability/templates


            //string siteUrl = "https://tronoxglobal.sharepoint.com/sites/sustainability";
            //string userName = "russell.gove@tronox.com";
            //string password = "xxxxxxxxxx";
            //OfficeDevPnP.Core.AuthenticationManager authManager = new OfficeDevPnP.Core.AuthenticationManager();
            //try
            //{
            //    // Get and set the client context  
            //    // Connects to SharePoint online site using inputs provided  
            //    using (var clientContext = authManager.GetSharePointOnlineAuthenticatedContextTenant(siteUrl, userName, password))
            //    {
            //        // List Name input  

            //        return GenerateFile(log, response2, postData, clientContext);

            //    }
            //}
            //catch (Exception ex)
            //{

            //    log.Info("Error Message: " + ex.Message);

            //    response2.StatusCode = HttpStatusCode.InternalServerError;
            //    return response2;
            //}


        }

        private static async Task<HttpResponseMessage> GenerateFile(TraceWriter log, HttpResponseMessage response2, PostData postData, ClientContext clientContext,string authorizationParameter)
        {
            // Retrieves list object using title  
            File templateFile = null;
            try
            {
                templateFile = clientContext.Site.RootWeb.GetFileByServerRelativeUrl(postData.templateServerRelativeUrl);
                clientContext.Load(templateFile);
                clientContext.ExecuteQueryRetry();
            }
            catch (Exception err)
            {
                var message = $"Error loading template file {postData.templateServerRelativeUrl}";
                log.Error(message, err);
                response2.StatusCode = HttpStatusCode.BadRequest;
                response2.ReasonPhrase = message;
                return response2;

            }
            if (templateFile != null)
            {
                // Returns required result  
                ClientResult<Stream> templatestream = templateFile.OpenBinaryStream();
                clientContext.ExecuteQueryRetry();
                var tempPath = System.IO.Path.Combine(System.IO.Path.GetTempPath(), Guid.NewGuid().ToString()) + ".docx";
                using (Stream fileStream = new FileStream(tempPath, FileMode.Create))
                {
                    templatestream.Value.CopyTo(fileStream);
                }
                log.Error("Created temp file");

                WordprocessingDocument templateDoc = WordprocessingDocument.Open(tempPath, true);
                foreach (var replacementParm in postData.plainTextParameters)
                {
                    switch (replacementParm.replacementType)
                    {
                        case "PlainText":
                            templateDoc = InsertText(templateDoc, replacementParm.token, replacementParm.value, log);
                            break;
                        case "Image":
                            templateDoc = InsertImages(templateDoc, clientContext, replacementParm.token, replacementParm.value, log);
                            break;
                        default:
                            throw new Exception();
                    }
                }
                log.Error("replaced parametyers`");
                IEnumerable<string> m_oEnum = new string[] { "ptIncidentSummary" };
                templateDoc = RemoveSdtBlocks(templateDoc, m_oEnum);

                templateDoc.Save();
                templateDoc.Close(); // file now saved to local folder

                log.Error("Saved Doc");
                // Upload a file to a specific folder  
                if (postData.saveAsFormat.ToLower() == "docx")
                {
                    UploadFileToSharepoint(log, clientContext, postData.destinationFolderServerRelativeURL, tempPath, postData.fileName + ".docx");
                }
                else
                {
                    UploadFileToSharepoint(log, clientContext, postData.temporaryFolderServerRelativeURL, tempPath, postData.fileName+".docx");
                  string pdfPath=await  GetFileAsPDF(log, postData.fileName + ".docx", postData.temporaryFolderServerRelativeURL, authorizationParameter);
                    UploadFileToSharepoint(log, clientContext, postData.destinationFolderServerRelativeURL, pdfPath, postData.fileName + ".pdf");
                }
             

                response2.StatusCode = HttpStatusCode.OK;
                


                return response2;
            }
            else
            {
                log.Info("List is not available on the site");
                response2.StatusCode = HttpStatusCode.BadRequest;
                response2.ReasonPhrase = $"The template file ${postData.templateServerRelativeUrl} could not be found";
                return response2;
            }
        }

        private static async Task<string> GetFileAsPDF(TraceWriter log, string fileName,string tempFilePath,string authorizationParameter)
        {
            string libraryName = tempFilePath.Substring(tempFilePath.LastIndexOf("/")+1);
            string ClientId = "e107dec4-7c7d-4885-bd6f-9e9f7836cfee";
            string ClientSecret = "L4Xyhe/+kp.AM+puheZ4KhjH3BEeH7zQ";
            string TenantId = "9eec07e6-f6f8-4e24-b4c7-c5868500b417";
            string HostName = "tronoxglobal.sharepoint.com";
            string msGraphResourceUrl = "https://graph.microsoft.com";
            //Get the tenant id from the current claims
            // string tenantId = ClaimsPrincipal.Current.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value;
            string authority = $"https://login.microsoftonline.com/{TenantId}";
            //Access token coming from SPFx AadHttpClient with "user_impersonation" Scope
            var userImpersonationAccessToken = authorizationParameter;
            //Exchange the SPFx access token with another Access token containing the delegated scope for Microsoft Graph
            ClientCredential clientCred = new ClientCredential(ClientId, ClientSecret);
            log.Error("Got Cred");
            UserAssertion userAssertion = new UserAssertion(userImpersonationAccessToken);
            //For production, use a Token Cache like Redis https://blogs.msdn.microsoft.com/mrochon/2016/09/19/using-redis-as-adal-token-cache/
            var authContext = new AuthenticationContext(authority);
            AuthenticationResult authResult = await authContext.AcquireTokenAsync(msGraphResourceUrl, clientCred, userAssertion);
            var graphAccessToken = authResult.AccessToken;
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", graphAccessToken);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            Drive drive = await GetDriveByLibraryName(log, httpClient, HostName, "/sites/Sustainability", libraryName);
            var driveItem = await GetDriveItem(log, httpClient, HostName, "c87151f5-1e4d-47bd-a9bf-98c718736172", "486aa0ed-816a-4f05-90c9-a486ef8c980e", drive.id, "/"+fileName);
            // now create share to get as pdfg
            log.Info("Document  URL is " + driveItem.webUrl);
            // from https://docs.microsoft.com/en-us/graph/api/shares-get?view=graph-rest-1.0&tabs=http#encoding-sharing-urls
            string sharingUrl = driveItem.webUrl;
            string base64Value = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(sharingUrl));
            string encodedUrl = "u!" + base64Value.TrimEnd('=').Replace('/', '_').Replace('+', '-');
            // from https://docs.microsoft.com/en-us/graph/api/shares-get?view=graph-rest-1.0&tabs=http#encoding-sharing-urls

            var templateFileContents = await GetFileContents(log, httpClient, HostName, "c87151f5-1e4d-47bd-a9bf-98c718736172", "486aa0ed-816a-4f05-90c9-a486ef8c980e", drive.id, driveItem.id,true);
            log.Info($"got file");
            var tempPath = System.IO.Path.Combine(System.IO.Path.GetTempPath(), Guid.NewGuid().ToString()) + ".pdf";
            System.IO.File.WriteAllText(tempPath, templateFileContents);
            return tempPath;

        }

        public static void UploadFileToSharepoint(TraceWriter log, ClientContext clientContext, string destinationFolderServerRelativeURL,String filePath ,string spFileName)
        {
            Folder folder = null;
            try
            {
                folder = clientContext.Web.GetFolderByServerRelativeUrl(destinationFolderServerRelativeURL);
                clientContext.ExecuteQuery();

            }
            catch (Exception err)
            {
                var message = $"Error accessing destination folder {destinationFolderServerRelativeURL}. Please make sure the folder exists and you have write access to it";
                log.Error(message, err);
                throw new Exception(message);
            }
            File newFile = null;
            try
            {
                newFile = folder.UploadFile(spFileName, filePath, true);
            }
            catch (Exception err)
            {
                var message = $"Error uploading file to  destination folder {destinationFolderServerRelativeURL}. Please make sure you have Write access to it.";
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

        private static async Task<HttpResponseMessage> GenerateFileUsingGraph(TraceWriter log, HttpRequestMessage req)
        {
            PostData postData = await req.Content.ReadAsAsync<PostData>();
            string ClientId = "e107dec4-7c7d-4885-bd6f-9e9f7836cfee";
            string ClientSecret = "L4Xyhe/+kp.AM+puheZ4KhjH3BEeH7zQ";
            string TenantId = "9eec07e6-f6f8-4e24-b4c7-c5868500b417";
            string HostName = "tronoxglobal.sharepoint.com";
            string msGraphResourceUrl = "https://graph.microsoft.com";
            //Get the tenant id from the current claims
            // string tenantId = ClaimsPrincipal.Current.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value;
            string authority = $"https://login.microsoftonline.com/{TenantId}";
            //Access token coming from SPFx AadHttpClient with "user_impersonation" Scope
            var userImpersonationAccessToken = req.Headers.Authorization.Parameter;
            //Exchange the SPFx access token with another Access token containing the delegated scope for Microsoft Graph
            ClientCredential clientCred = new ClientCredential(ClientId, ClientSecret);
            log.Error("Got Cred");
            UserAssertion userAssertion = new UserAssertion(userImpersonationAccessToken);
            //For production, use a Token Cache like Redis https://blogs.msdn.microsoft.com/mrochon/2016/09/19/using-redis-as-adal-token-cache/
            var authContext = new AuthenticationContext(authority);
            AuthenticationResult authResult = await authContext.AcquireTokenAsync(msGraphResourceUrl, clientCred, userAssertion);
            var graphAccessToken = authResult.AccessToken;
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", graphAccessToken);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            Drive drive = await GetDriveByLibraryName(log, httpClient, HostName, "/sites/Sustainability", "templates");
            string driveID = drive.id;
            log.Info($"Drive ID is {drive.id}");
            var driveItem = await GetDriveItem(log, httpClient, HostName, "c87151f5-1e4d-47bd-a9bf-98c718736172", "486aa0ed-816a-4f05-90c9-a486ef8c980e", driveID, "/IncidentFlashReportTemplate3.docx");

            var templateFileContents = await GetFileContents(log, httpClient, HostName, "c87151f5-1e4d-47bd-a9bf-98c718736172", "486aa0ed-816a-4f05-90c9-a486ef8c980e", driveID, driveItem.id,false);
            log.Info($"got file");

            var tempPath = System.IO.Path.Combine(System.IO.Path.GetTempPath(), Guid.NewGuid().ToString()) + ".docx";
            System.IO.File.WriteAllText(tempPath, templateFileContents);
            log.Error("Created temp file");




            var request = new HttpRequestMessage(HttpMethod.Get, $"https://graph.microsoft.com/v1.0/me");

            var response = await httpClient.SendAsync(request);

            var content = await response.Content.ReadAsStringAsync();

            var result = new Dictionary<string, string>();
            result.Add("Current User through Microsoft Graph", content);
            //return req.CreateResponse(HttpStatusCode.OK, result, JsonMediaTypeFormatter.DefaultMediaType);




            return req.CreateResponse(HttpStatusCode.OK);
        }
        public static async Task<DriveItem> GetDriveItem(TraceWriter log, HttpClient httpClient, string hostName, string siteId, string webId, string driveId, string filePath)
        {
            log.Info("in getDriveItem");
            string requestFormat = "https://graph.microsoft.com/v1.0/sites/{0},{1},{2}/drives/{3}/root:{4}";
            log.Info("requestFormat:" + requestFormat);
            log.Info("hostname:" + hostName);
            log.Info("filepath:" + filePath);
            log.Info("driveId:" + driveId);
            string requestUrl = string.Format(requestFormat, hostName, siteId, webId, driveId, filePath);
            log.Info("getFilerequestUrl:" + requestUrl);
            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            var response = await httpClient.SendAsync(request);
            var driveItem = await response.Content.ReadAsAsync<DriveItem>();

            return driveItem;
            //drives = await response.Content.ReadAsAsync<Drive[]>();


            return null;

        }
        public static async Task<string> GetFileContents(TraceWriter log, HttpClient httpClient, string hostName, string siteId,string webId, string driveId, string itemId,bool getAsPDF)
        {
            log.Info("in getfile");
            
            string requestFormat = getAsPDF? "https://graph.microsoft.com/v1.0/sites/{0},{1},{2}/drives/{3}/items/{4}/content?format=PDF":
              "https://graph.microsoft.com/v1.0/sites/{0},{1},{2}/drives/{3}/items/{4}/content"  ;
            log.Info("requestFormat:" + requestFormat);
            log.Info("hostname:" + hostName);
            log.Info("itemId:" + itemId);
            log.Info("driveId:" + driveId);
//            string requestUrl = string.Format(requestFormat, hostName, siteId, webId, driveId, filePath);
            string requestUrl = string.Format(requestFormat, hostName, siteId, webId, driveId, itemId);

            log.Info("getFilerequestUrl:" + requestUrl);
            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            var response = await httpClient.SendAsync(request);
            string responsestring = await response.Content.ReadAsStringAsync();
            log.Info("response:" + responsestring);
            return responsestring;
            //drives = await response.Content.ReadAsAsync<Drive[]>();


            return null;

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
            log.Info("Library:" + libraryName + " Not found");
            return null;

        }
        private static async Task<Drive[]> GetDrives(TraceWriter log, HttpClient httpClient, string hostName, string siteServerRelativeUrl)
        {
            DriveArray drives = null;
            string requestFormat = "https://graph.microsoft.com/v1.0/sites/{0}:{1}:/drives";
            string requestUrl = string.Format(requestFormat, hostName, siteServerRelativeUrl);
            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            var response = await httpClient.SendAsync(request);
            //var responsestring= await response.Content.ReadAsStringAsync();
            //log.Info("response:" + responsestring);

            drives = await response.Content.ReadAsAsync<DriveArray>();

            return drives.value;

        }

        private static async Task GraphTest(HttpRequestMessage req, TraceWriter log)
        {
            //****** GRAPH TEST

            string ClientId = "e107dec4-7c7d-4885-bd6f-9e9f7836cfee";
            string ClientSecret = "L4Xyhe/+kp.AM+puheZ4KhjH3BEeH7zQ";
            string TenantId = "9eec07e6-f6f8-4e24-b4c7-c5868500b417";
            string msGraphResourceUrl = "https://graph.microsoft.com";
            //Get the tenant id from the current claims
            // string tenantId = ClaimsPrincipal.Current.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid")?.Value;
            string authority = $"https://login.microsoftonline.com/{TenantId}";

            //Access token coming from SPFx AadHttpClient with "user_impersonation" Scope

            var userImpersonationAccessToken = req.Headers.Authorization.Parameter;

            //Exchange the SPFx access token with another Access token containing the delegated scope for Microsoft Graph
            ClientCredential clientCred = new ClientCredential(ClientId, ClientSecret);


            UserAssertion userAssertion = new UserAssertion(userImpersonationAccessToken);

            //For production, use a Token Cache like Redis https://blogs.msdn.microsoft.com/mrochon/2016/09/19/using-redis-as-adal-token-cache/

            var authContext = new AuthenticationContext(authority);



            AuthenticationResult authResult = await authContext.AcquireTokenAsync(msGraphResourceUrl, clientCred, userAssertion);
            var graphAccessToken = authResult.AccessToken;

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", graphAccessToken);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage(HttpMethod.Get, $"https://graph.microsoft.com/v1.0/me");

            var response = await httpClient.SendAsync(request);

            var content = await response.Content.ReadAsStringAsync();

            var result = new Dictionary<string, string>();
            result.Add("Current User through Microsoft Graph", content);
            //return req.CreateResponse(HttpStatusCode.OK, result, JsonMediaTypeFormatter.DefaultMediaType);




            //******  END GRAPH TEST     
        }

        public static WordprocessingDocument InsertImages(this WordprocessingDocument doc, ClientContext clientContext, string contentControlTag, string attachementServerRelativeUrl, TraceWriter log)
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
                        Console.WriteLine("done");
                    }
                }
            }
            return doc;
        }

        public static WordprocessingDocument InsertText(this WordprocessingDocument doc, string contentControlTag, string text, TraceWriter log)
        {
            SdtElement element = doc.MainDocumentPart.Document.Body.Descendants<SdtElement>()
              .FirstOrDefault(sdt => sdt.SdtProperties.GetFirstChild<Tag>()?.Val == contentControlTag);

            if (element == null)
            {
                log.Info($"ContentControlTag \"{contentControlTag}\" doesn't exist.");
            }
            else
            {
                element.Descendants<Text>().First().Text = text;
                element.Descendants<Text>().Skip(1).ToList().ForEach(t => t.Remove());
            }

            return doc;
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
    }
}
