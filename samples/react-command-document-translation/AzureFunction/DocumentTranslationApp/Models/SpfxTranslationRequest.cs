namespace DocumentTranslationApp.Models;

public class SpfxTranslationRequest
{
    public required string SiteUrl { get; set; }
    public required List<DocumentInfo> Documents { get; set; }
    public required TranslationOptions Options { get; set; }
    public RequestContext? Context { get; set; }
}
