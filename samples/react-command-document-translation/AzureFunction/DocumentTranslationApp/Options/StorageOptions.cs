namespace DocumentTranslationApp.Options;

public class StorageOptions
{
    public string ConnectionString { get; set; } = string.Empty;
	public string JobStatusTableName { get; set; } = "translationjobs";
    public string SourceContainer { get; set; } = "translation-source";
    public string TempContainer { get; set; } = "translation-temp";

    // Authentication configuration
    public bool UseManagedIdentity { get; set; } = true; // Use managed identity by default

    // Retry configuration
    public int DefaultMaxRetries { get; set; } = 3;
    public bool DeleteFailedJobBlobs { get; set; } = true;
    public int RetryDelayMinutes { get; set; } = 5;
}
