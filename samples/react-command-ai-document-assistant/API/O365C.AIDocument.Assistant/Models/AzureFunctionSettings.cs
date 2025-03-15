using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace O365C.AIDocument.Assistant.Models
{
    public class AzureFunctionSettings
    {
        public string TenantId { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }       
        public string APIKey { get; set; }
        public string Endpoint { get; set; }

    }
}
