using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocumentRedactionApp.Options;

public class SharePointOptions
{
	public required string ClientId { get; set; }
	public required string ClientSecret { get; set; }
	public required string TenantUrl { get; set; }
	public int TimeoutSeconds { get; set; } = 300;
}