using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocumentRedactionApp.Options;

public class ServiceBusOptions
{
	public const string PropertyName = "ServiceBus";
	public string ConnectionString { get; set; } = string.Empty;
	public string QueueName { get; set; } = "redaction-jobs";
}