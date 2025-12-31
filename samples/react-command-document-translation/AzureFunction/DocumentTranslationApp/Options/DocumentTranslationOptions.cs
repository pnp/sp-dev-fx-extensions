namespace DocumentTranslationApp.Options;

public class DocumentTranslationOptions
{
    public required string Endpoint { get; set; }
    public required string SubscriptionKey { get; set; }
    public required string ApiVersion { get; set; }

	public required string Region { get; set; }
    public int TimeoutSeconds { get; set; } = 600; // 10 minutes
    public int DefaultTimeout { get; set; } = 600; // 10 minutes (for backward compatibility)
    public int PollingIntervalSeconds { get; set; } = 5;
}
