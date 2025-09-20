using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocumentRedactionApp.Options;

public class StorageOptions
{
    public string JobStatusTableName { get; set; } = "job-status";
    public string TempContainer { get; set; } = "redaction-temp";
    public string SourceContainer { get; set; } = "source-documents";

    // Retry configuration
    public int DefaultMaxRetries { get; set; } = 1;
    public bool DeleteFailedJobBlobs { get; set; } = true;
    public int RetryDelayMinutes { get; set; } = 5;

}
