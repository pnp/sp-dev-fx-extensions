using DocumentRedactionApp.Models;
using FluentValidation;
using Microsoft.Extensions.Options;

namespace DocumentRedactionApp.Validators;

public class RedactionRequestValidator : AbstractValidator<RedactionRequest>
{
	private readonly RedactionOptions _options;

	public RedactionRequestValidator(IOptions<RedactionOptions> options)
	{
		_options = options.Value;

		RuleFor(x => x.SiteUrl)
			.NotEmpty()
			.WithMessage("Site URL is required")
			.Must(BeValidUrl)
			.WithMessage("Site URL must be a valid URL");

		RuleFor(x => x.Documents)
			.NotEmpty()
			.WithMessage("At least one document is required")
			.Must(documents => documents.Count <= _options.MaxDocumentsPerJob)
			.WithMessage($"Cannot process more than {_options.MaxDocumentsPerJob} documents per job");

		RuleForEach(x => x.Documents)
			.SetValidator(new DocumentInfoValidator(_options));

		RuleFor(x => x.Options)
			.NotNull()
			.WithMessage("Redaction options are required")
			.SetValidator(new RedactionOptionsValidator());

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
	private readonly RedactionOptions _options;

	public DocumentInfoValidator(RedactionOptions options)
	{
		_options = options;

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
			.WithMessage("File type is required")
			.Must(fileType => _options.SupportedFileTypes.Contains(fileType.ToLowerInvariant()))
			.WithMessage($"File type must be one of: {string.Join(", ", _options.SupportedFileTypes)}");

		RuleFor(x => x.Size)
			.GreaterThan(0)
			.WithMessage("File size must be greater than 0")
			.LessThanOrEqualTo(_options.MaxFileSizeBytes)
			.WithMessage($"File size cannot exceed {_options.MaxFileSizeBytes / (1024 * 1024)} MB");

		RuleFor(x => x.IsSupported)
			.Equal(true)
			.WithMessage("Document must be supported for processing");
	}
}

public class RedactionOptionsValidator : AbstractValidator<RedactionOptionsData>
{
	public RedactionOptionsValidator()
	{
		RuleFor(x => x.MaskType)
			.IsInEnum()
			.WithMessage("Invalid mask type");

		RuleFor(x => x.MaskCharacter)
			.NotEmpty()
			.When(x => x.MaskType == MaskType.CharacterMask)
			.WithMessage("Mask character is required when using character mask")
			.Length(1)
			.When(x => x.MaskType == MaskType.CharacterMask && !string.IsNullOrEmpty(x.MaskCharacter))
			.WithMessage("Mask character must be exactly one character");

		RuleFor(x => x.SelectedCategories)
			.NotEmpty()
			.When(x => x.MaskType == MaskType.EntityMask && !x.IncludeAllCategories)
			.WithMessage("At least one PII category must be selected when not including all categories");

		RuleForEach(x => x.SelectedCategories)
			.NotEmpty()
			.WithMessage("PII category cannot be empty")
			.When(x => x.SelectedCategories != null);
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