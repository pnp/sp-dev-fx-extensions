using System.Net;
using System.Text.Json;
using Azure.Messaging.ServiceBus;
using DocumentTranslationApp.Models;
using DocumentTranslationApp.Services;
using FluentValidation;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace DocumentTranslationApp;

public class TranslationFunctions
{
    private readonly ILogger<TranslationFunctions> _logger;
    private readonly IJobStatusService _jobStatusService;
    private readonly ITranslationService _translationService;
    private readonly IValidator<SpfxTranslationRequest> _validator;

    public TranslationFunctions(
        ILogger<TranslationFunctions> logger,
        IJobStatusService jobStatusService,
        ITranslationService translationService,
        IValidator<SpfxTranslationRequest> validator
    )
    {
        _logger = logger;
        _jobStatusService = jobStatusService;
        _translationService = translationService;
        _validator = validator;
    }

    [Function("StartTranslation")]
    public async Task<HttpResponseData> StartTranslation(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "translation/start")]
            HttpRequestData req
    )
    {
        var correlationId = Guid.NewGuid().ToString();
        _logger.LogInformation(
            "[{CorrelationId}] Starting translation job request",
            correlationId
        );

        try
        {
            // Parse request body
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            _logger.LogDebug(
                "[{CorrelationId}] Request body length: {Length} chars",
                correlationId,
                requestBody.Length
            );

            var spfxRequest = JsonSerializer.Deserialize<SpfxTranslationRequest>(
                requestBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            if (spfxRequest == null)
            {
                _logger.LogWarning("[{CorrelationId}] Failed to deserialize request body", correlationId);
                return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Invalid request body");
            }

            _logger.LogInformation(
                "[{CorrelationId}] Request for site: {SiteUrl} with {DocumentCount} documents, {LanguageCount} target languages",
                correlationId,
                spfxRequest.SiteUrl,
                spfxRequest.Documents.Count,
                spfxRequest.Options.TargetLanguages.Count
            );

            // Get authorization header
            var authHeader = req
                .Headers.FirstOrDefault(h =>
                    h.Key.Equals("Authorization", StringComparison.OrdinalIgnoreCase)
                )
                .Value.FirstOrDefault();

            if (string.IsNullOrEmpty(authHeader))
            {
                _logger.LogWarning("[{CorrelationId}] No authorization header found", correlationId);
                return await CreateErrorResponse(
                    req,
                    HttpStatusCode.Unauthorized,
                    "User access token is required"
                );
            }

            // Convert to internal format
            var request = new TranslationRequest
            {
                SiteUrl = spfxRequest.SiteUrl,
                Documents = spfxRequest.Documents,
                Options = spfxRequest.Options,
                Context = spfxRequest.Context,
                UserAccessToken = authHeader,
            };

            // Validate request
            var validationResult = await _validator.ValidateAsync(spfxRequest);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                _logger.LogWarning(
                    "[{CorrelationId}] Validation failed: {Errors}",
                    correlationId,
                    string.Join("; ", errors)
                );
                return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Validation failed", errors);
            }

            // Start translation job
            _logger.LogInformation("[{CorrelationId}] Starting translation job...", correlationId);
            var result = await _translationService.StartTranslationJobAsync(request);

            _logger.LogInformation(
                "[{CorrelationId}] Job created. JobId: {JobId}, Success: {Success}",
                correlationId,
                result.JobId,
                result.Success
            );

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(result);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{CorrelationId}] Error starting translation job", correlationId);
            return await CreateErrorResponse(
                req,
                HttpStatusCode.InternalServerError,
                "An internal error occurred"
            );
        }
    }

    [Function("GetTranslationStatus")]
    public async Task<HttpResponseData> GetTranslationStatus(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "translation/status/{jobId}")]
            HttpRequestData req,
        string jobId
    )
    {
        var correlationId = Guid.NewGuid().ToString();
        _logger.LogInformation(
            "[{CorrelationId}] Getting status for job: {JobId}",
            correlationId,
            jobId
        );

        try
        {
            if (string.IsNullOrEmpty(jobId))
            {
                return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Job ID is required");
            }

            var status = await _jobStatusService.GetJobStatusAsync(jobId);

            if (status == null)
            {
                _logger.LogWarning("[{CorrelationId}] Job not found: {JobId}", correlationId, jobId);
                return await CreateErrorResponse(req, HttpStatusCode.NotFound, "Job not found");
            }

            _logger.LogInformation(
                "[{CorrelationId}] Status: {Status}, Progress: {Progress}%",
                correlationId,
                status.Status,
                status.Progress
            );

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(status);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{CorrelationId}] Error getting status", correlationId);
            return await CreateErrorResponse(req, HttpStatusCode.InternalServerError, "An internal error occurred");
        }
    }

    [Function("CancelTranslation")]
    public async Task<HttpResponseData> CancelTranslation(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "translation/cancel/{jobId}")]
            HttpRequestData req,
        string jobId
    )
    {
        var correlationId = Guid.NewGuid().ToString();
        _logger.LogInformation("[{CorrelationId}] Cancelling job: {JobId}", correlationId, jobId);

        try
        {
            if (string.IsNullOrEmpty(jobId))
            {
                return await CreateErrorResponse(req, HttpStatusCode.BadRequest, "Job ID is required");
            }

            var cancelled = await _jobStatusService.CancelJobAsync(jobId);

            if (!cancelled)
            {
                return await CreateErrorResponse(
                    req,
                    HttpStatusCode.BadRequest,
                    "Job cannot be cancelled in its current state"
                );
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { Success = true, Message = "Job cancelled successfully" });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{CorrelationId}] Error cancelling job", correlationId);
            return await CreateErrorResponse(req, HttpStatusCode.InternalServerError, "An internal error occurred");
        }
    }

    [Function("ProcessTranslationJob")]
    public async Task ProcessTranslationJob(
        [ServiceBusTrigger("translation-jobs", Connection = "ServiceBus:ConnectionString")]
        ServiceBusReceivedMessage message,
        ServiceBusMessageActions messageActions,
        FunctionContext context
    )
    {
        var logger = context.GetLogger("ProcessTranslationJob");

        try
        {
            logger.LogInformation(
                "Processing translation job message. MessageId: {MessageId}",
                message.MessageId
            );

            var messageBody = message.Body.ToString();
            var job = JsonSerializer.Deserialize<ProcessingJob>(
                messageBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            if (job == null)
            {
                logger.LogError("Failed to deserialize job from message {MessageId}", message.MessageId);
                await messageActions.DeadLetterMessageAsync(
                    message,
                    deadLetterReason: "DeserializationFailed",
                    deadLetterErrorDescription: "Failed to deserialize ProcessingJob from message body"
                );
                return;
            }

            logger.LogInformation(
                "Processing translation job {JobId} with {DocumentCount} documents",
                job.JobId,
                job.Documents.Count
            );

            await _translationService.ProcessTranslationJobAsync(job);

            // Complete the message to remove from queue
            await messageActions.CompleteMessageAsync(message);

            logger.LogInformation(
                "Successfully completed processing job {JobId}",
                job.JobId
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Error processing translation job message {MessageId}",
                message.MessageId
            );
            // Let Service Bus retry or move to dead letter queue
            throw;
        }
    }

    private async Task<HttpResponseData> CreateErrorResponse(
        HttpRequestData req,
        HttpStatusCode statusCode,
        string message,
        List<string>? errors = null
    )
    {
        var response = req.CreateResponse(statusCode);
        await response.WriteAsJsonAsync(new
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<string>()
        });
        return response;
    }
}
