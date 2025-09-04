namespace MoveDocs2Blob.Configuration;

/// <summary>
/// Configuration settings for the Archive Documents function app
/// </summary>
public class AppSettings
{
    public string? AzureWebJobsStorage { get; set; }
    public string? StorageAccountName { get; set; }
    public string? SharePointClientId { get; set; }
    public string? SharePointClientSecret { get; set; }
    public string? SharePointTenantId { get; set; }
    public string? ApplicationInsightsConnectionString { get; set; }

    /// <summary>
    /// Validates that all required settings are configured
    /// </summary>
    /// <returns>List of missing or invalid settings</returns>
    public List<string> Validate()
    {
        var errors = new List<string>();

        if (string.IsNullOrEmpty(AzureWebJobsStorage) && string.IsNullOrEmpty(StorageAccountName))
        {
            errors.Add("Either AzureWebJobsStorage connection string or StorageAccountName must be configured");
        }

        // SharePoint authentication settings are optional for now
        // but would be required for production use

        return errors;
    }
}
