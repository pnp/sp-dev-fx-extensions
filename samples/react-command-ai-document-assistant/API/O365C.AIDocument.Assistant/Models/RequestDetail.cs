using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace O365C.AIDocument.Assistant.Models
{
    public class RequestDetail
    {
        public required string SiteUrl { get; set; }
        public required string ListName { get; set; }
        public required string DriveId { get; set; }
        public required string ItemId { get; set; }
        public required string FileName { get; set; }
        public required string Question { get; set; }   
    }
}
