using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocumentRedactionApp.Models;

public class SpfxRedactionRequest
{
	public required string SiteUrl { get; set; }
	public required List<DocumentInfo> Documents { get; set; }
	public required RedactionOptionsData Options { get; set; }
	public RequestContext? Context { get; set; }
	public string? UserAccessToken { get; set; }
}
