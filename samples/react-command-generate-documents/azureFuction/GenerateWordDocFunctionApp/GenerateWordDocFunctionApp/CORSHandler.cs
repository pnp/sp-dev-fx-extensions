
using Microsoft.Azure.WebJobs.Host;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Microsoft.Extensions.Configuration;


namespace GenerateWordDocFunctionApp
{
    public static class CORSHandler
    {

        public static bool AddCORSHeaders(HttpRequestMessage req, ref HttpResponseMessage resp, string verbs, TraceWriter log, IConfiguration Config)
        {
            if (req.Headers.Contains("Origin"))
            {


                var origin = req.Headers.GetValues("Origin").FirstOrDefault();
                log.Error(string.Concat("Origin is ", origin), null);

                if (origin != null)
                {
                    var AllowedDomains = System.Configuration.ConfigurationManager.AppSettings["AllowedOrigins"];
                    
                    log.Error(string.Concat("AllowedDomains is ", AllowedDomains), null);
                    if (AllowedDomains.Contains(origin))
                    {

                        resp.Headers.Add("Access-Control-Allow-Credentials", "true");
                        resp.Headers.Add("Access-Control-Allow-Origin", origin);
                        resp.Headers.Add("Access-Control-Allow-Methods", verbs);

                        resp.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return true;
            }



        }

        public static void Dumpheaders(HttpResponseMessage resp, TraceWriter log)
        {
            foreach (KeyValuePair<string, IEnumerable<string>> header in resp.Headers)
            {
                log.Error(string.Format("{0} ==> {1}", header.Key, header.Value), null);
            }
        }
    }
}
