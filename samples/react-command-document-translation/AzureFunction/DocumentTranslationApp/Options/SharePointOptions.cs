namespace DocumentTranslationApp.Options;

public class SharePointOptions
{
    public required string ClientId { get; set; }
    public required string ClientSecret { get; set; }
    public int TimeoutSeconds { get; set; } = 300;
}
