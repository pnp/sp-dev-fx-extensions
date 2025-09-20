using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocumentRedactionApp.Options;

public class LanguageServiceOptions
{
    public const string PropertyName = "LanguageService";

    /// <summary>
    /// Gets or sets the Azure Language Service endpoint.
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Azure Language Service API key.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the redaction policy for PII entities.
    /// Valid values: "CharacterMask", "EntityMask", "Redact"
    /// </summary>
    public string RedactionPolicy { get; set; } = "CharacterMask";

    /// <summary>
    /// Gets or sets the character to use for masking when RedactionPolicy is "CharacterMask".
    /// </summary>
    public string RedactionCharacter { get; set; } = "*";

    /// <summary>
    /// Gets or sets the API version for the Language Service REST API.
    /// </summary>
    public string ApiVersion { get; set; } = "2024-11-15-preview";

    /// <summary>
    /// Gets or sets the timeout for HTTP requests to the Language Service (in seconds).
    /// </summary>
    public int TimeoutSeconds { get; set; } = 120;

    /// <summary>
    /// Gets or sets whether to exclude extraction data from PII recognition responses.
    /// </summary>
    public bool ExcludeExtractionData { get; set; } = false;

    /// <summary>
    /// Gets or sets specific PII categories to detect. If empty, all categories are detected.
    /// </summary>
    public List<string> PiiCategories { get; set; } = new();

    /// <summary>
    /// Gets or sets the default language for text analysis.
    /// </summary>
    public string DefaultLanguage { get; set; } = "en-US";

    public List<string> SupportedFileTypes { get; set; } = new();
    public int MaxFileSizeBytes { get; set; }
    public int MaxDocumentsPerJob { get; set; }
}
