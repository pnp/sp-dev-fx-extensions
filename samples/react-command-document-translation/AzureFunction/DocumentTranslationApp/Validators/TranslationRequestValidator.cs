using DocumentTranslationApp.Models;
using FluentValidation;

namespace DocumentTranslationApp.Validators;

public class TranslationRequestValidator : AbstractValidator<SpfxTranslationRequest>
{
    public TranslationRequestValidator()
    {
        RuleFor(x => x.SiteUrl)
            .NotEmpty()
            .WithMessage("Site URL is required")
            .Must(BeValidUrl)
            .WithMessage("Site URL must be a valid URL");

        RuleFor(x => x.Documents)
            .NotEmpty()
            .WithMessage("At least one document is required")
            .Must(documents => documents.Count <= 50)
            .WithMessage("Cannot process more than 50 documents per job");

        RuleForEach(x => x.Documents)
            .SetValidator(new DocumentInfoValidator());

        RuleFor(x => x.Options)
            .NotNull()
            .WithMessage("Translation options are required")
            .SetValidator(new TranslationOptionsValidator());

        RuleFor(x => x.Context)
            .SetValidator(new RequestContextValidator())
            .When(x => x.Context != null);
    }

    private bool BeValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
               && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

public class DocumentInfoValidator : AbstractValidator<DocumentInfo>
{
    public DocumentInfoValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Document ID is required");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Document name is required");

        RuleFor(x => x.ServerRelativeUrl)
            .NotEmpty()
            .WithMessage("Server relative URL is required");

        RuleFor(x => x.FileType)
            .NotEmpty()
            .WithMessage("File type is required");

        RuleFor(x => x.Size)
            .GreaterThan(0)
            .WithMessage("File size must be greater than 0")
            .LessThanOrEqualTo(40 * 1024 * 1024)
            .WithMessage("File size cannot exceed 40 MB");

        RuleFor(x => x.IsSupported)
            .Equal(true)
            .WithMessage("Document must be supported for processing");
    }
}

public class TranslationOptionsValidator : AbstractValidator<TranslationOptions>
{
    public TranslationOptionsValidator()
    {
        RuleFor(x => x.TargetLanguages)
            .NotEmpty()
            .WithMessage("At least one target language is required")
            .Must(langs => langs.Count <= 10)
            .WithMessage("Cannot translate to more than 10 languages at once");

        RuleForEach(x => x.TargetLanguages)
            .NotEmpty()
            .WithMessage("Target language code cannot be empty")
            .Length(2, 10)
            .WithMessage("Target language code must be between 2 and 10 characters");

        RuleFor(x => x.SourceLanguage)
            .Length(2, 10)
            .When(x => !string.IsNullOrEmpty(x.SourceLanguage))
            .WithMessage("Source language code must be between 2 and 10 characters");
    }
}

public class RequestContextValidator : AbstractValidator<RequestContext>
{
    public RequestContextValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.ListId)
            .NotEmpty()
            .WithMessage("List ID is required");

        RuleFor(x => x.TenantId)
            .NotEmpty()
            .WithMessage("Tenant ID is required");

        RuleFor(x => x.WebId)
            .NotEmpty()
            .WithMessage("Web ID is required")
            .Must(BeValidGuid)
            .WithMessage("Web ID must be a valid GUID");
    }

    private bool BeValidGuid(string guid)
    {
        return Guid.TryParse(guid, out _);
    }
}
