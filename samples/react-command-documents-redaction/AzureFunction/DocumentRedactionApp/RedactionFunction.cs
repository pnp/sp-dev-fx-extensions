using System.Net;
using System.Text.Json;
using Azure;
using Azure.Messaging.ServiceBus;
using Azure.Storage.Queues.Models;
using DocumentRedactionApp.Models;
using DocumentRedactionApp.Services;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace DocumentRedactionApp;

public class RedactionFunctions
{
    private readonly ILogger<RedactionFunctions> _logger;
    private readonly IJobStatusService _jobStatusService;
    private readonly IRedactionService _redactionService;
    private readonly IValidator<RedactionRequest> _validator;

    public RedactionFunctions(
        ILogger<RedactionFunctions> logger,
        IJobStatusService jobStatusService,
        IRedactionService redactionService,
        IValidator<RedactionRequest> validator
    )
    {
        _logger = logger;
        _jobStatusService = jobStatusService;
        _redactionService = redactionService;
        _validator = validator;
    }

    [Function("StartRedaction")]
    public async Task<HttpResponseData> StartRedaction(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "redaction/start")]
            HttpRequestData req
    )
    {
        var correlationId = Guid.NewGuid().ToString();
        _logger.LogInformation(
            "[{CorrelationId}] Starting redaction job request from {UserAgent}",
            correlationId,
            req.Headers.GetValues("User-Agent").FirstOrDefault() ?? "Unknown"
        );

        try
        {
            // Parse request body - expecting the format from SPFx
            _logger.LogDebug("[{CorrelationId}] Reading request body...", correlationId);
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            _logger.LogDebug(
                "[{CorrelationId}] Request body length: {Length} chars",
                correlationId,
                requestBody.Length
            );

            var spfxRequest = JsonSerializer.Deserialize<SpfxRedactionRequest>(
                requestBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            if (spfxRequest == null)
            {
                _logger.LogWarning(
                    "[{CorrelationId}] Failed to deserialize request body. Body: {RequestBody}",
                    correlationId,
                    requestBody.Length > 1000 ? requestBody[..1000] + "..." : requestBody
                );
                return await CreateErrorResponse(
                    req,
                    HttpStatusCode.BadRequest,
                    "Invalid request body"
                );
            }

            _logger.LogInformation(
                "[{CorrelationId}] Successfully parsed request for site: {SiteUrl} with {DocumentCount} documents",
                correlationId,
                spfxRequest.SiteUrl,
                spfxRequest.Documents.Count
            );

            // Validate that we have the user access token
            _logger.LogDebug("[{CorrelationId}] Validating authorization header...", correlationId);
            var authHeader = req
                .Headers.FirstOrDefault(h =>
                    h.Key.Equals("Authorization", StringComparison.OrdinalIgnoreCase)
                )
                .Value.FirstOrDefault();

            if (string.IsNullOrEmpty(authHeader))
            {
                _logger.LogWarning(
                    "[{CorrelationId}] No authorization header found in request. Available headers: {Headers}",
                    correlationId,
                    string.Join(", ", req.Headers.Select(h => h.Key))
                );
                return await CreateErrorResponse(
                    req,
                    HttpStatusCode.Unauthorized,
                    "User access token is required for delegated permissions"
                );
            }

            _logger.LogDebug(
                "[{CorrelationId}] Authorization header present: {AuthType}",
                correlationId,
                authHeader.Split(' ').FirstOrDefault() ?? "Unknown"
            );

            // Convert SPFx request to internal format
            var request = new RedactionRequest
            {
                SiteUrl = spfxRequest.SiteUrl,
                Documents = spfxRequest.Documents,
                Options = spfxRequest.Options,
                Context = spfxRequest.Context,
                UserAccessToken = authHeader,
            };

            // Validate request
            _logger.LogDebug(
                "[{CorrelationId}] Validating request with {DocumentCount} documents...",
                correlationId,
                request.Documents.Count
            );
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                _logger.LogWarning(
                    "[{CorrelationId}] Request validation failed. Errors: {ValidationErrors}",
                    correlationId,
                    string.Join("; ", errors)
                );
                return await CreateErrorResponse(
                    req,
                    HttpStatusCode.BadRequest,
                    "Validation failed",
                    errors
                );
            }

            _logger.LogInformation(
                "[{CorrelationId}] Request validation passed successfully",
                correlationId
            );

            // Start redaction job
            _logger.LogInformation(
                "[{CorrelationId}] Starting redaction job via RedactionService...",
                correlationId
            );
            var result = await _redactionService.StartRedactionJobAsync(request);

            _logger.LogInformation(
                "[{CorrelationId}] Redaction job created. JobId: {JobId}, Success: {Success}, Message: {Message}",
                correlationId,
                result.JobId,
                result.Success,
                result.Message
            );

            // Create response
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(result);
            _logger.LogInformation(
                "[{CorrelationId}] Response sent successfully for job {JobId}",
                correlationId,
                result.JobId
            );
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[{CorrelationId}] Error starting redaction job. Exception: {ExceptionType}, Message: {ExceptionMessage}",
                correlationId,
                ex.GetType().Name,
                ex.Message
            );
            return await CreateErrorResponse(
                req,
                HttpStatusCode.InternalServerError,
                "An internal error occurred while starting the redaction job"
            );
        }
    }

    [Function("GetJobStatus")]
    public async Task<HttpResponseData> GetJobStatus(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "redaction/status/{jobId}")]
            HttpRequestData req,
        string jobId
    )
    {
        var correlationId = Guid.NewGuid().ToString();
        _logger.LogInformation(
            "[{CorrelationId}] Getting job status request for job: {JobId}",
            correlationId,
            jobId
        );

        try
        {
            if (string.IsNullOrEmpty(jobId))
            {
                _logger.LogWarning(
                    "[{CorrelationId}] GetJobStatus called with empty job ID",
                    correlationId
                );
                return await CreateErrorResponse(
                    req,
                    HttpStatusCode.BadRequest,
                    "Job ID is required"
                );
            }

            _logger.LogDebug(
                "[{CorrelationId}] Calling JobStatusService.GetJobStatusAsync for job: {JobId}",
                correlationId,
                jobId
            );
            var status = await _jobStatusService.GetJobStatusAsync(jobId);

            if (status == null)
            {
                _logger.LogWarning(
                    "[{CorrelationId}] Job not found: {JobId}",
                    correlationId,
                    jobId
                );
                return await CreateErrorResponse(req, HttpStatusCode.NotFound, "Job not found");
            }

            _logger.LogInformation(
                "[{CorrelationId}] Successfully retrieved job status for {JobId}. Status: {Status}, Progress: {Progress}%",
                correlationId,
                jobId,
                status.Status,
                status.Progress
            );

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(status);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[{CorrelationId}] Error getting job status for job: {JobId}. Exception: {ExceptionType}, Message: {ExceptionMessage}",
                correlationId,
                jobId,
                ex.GetType().Name,
                ex.Message
            );
            return await CreateErrorResponse(
                req,
                HttpStatusCode.InternalServerError,
                "An internal error occurred while retrieving job status"
            );
        }
    }

    [Function("CancelJob")]
    public async Task<HttpResponseData> CancelJob(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "redaction/cancel/{jobId}")]
            HttpRequestData req,
        string jobId
    )
    {
        var correlationId = Guid.NewGuid().ToString();
        _logger.LogInformation(
            "[{CorrelationId}] Cancelling job request for: {JobId}",
            correlationId,
            jobId
        );

        try
        {
            if (string.IsNullOrEmpty(jobId))
            {
                _logger.LogWarning(
                    "[{CorrelationId}] CancelJob called with empty job ID",
                    correlationId
                );
                return await CreateErrorResponse(
                    req,
                    HttpStatusCode.BadRequest,
                    "Job ID is required"
                );
            }

            _logger.LogDebug(
                "[{CorrelationId}] Calling JobStatusService.CancelJobAsync for job: {JobId}",
                correlationId,
                jobId
            );
            var success = await _jobStatusService.CancelJobAsync(jobId);

            if (!success)
            {
                _logger.LogWarning(
                    "[{CorrelationId}] Failed to cancel job: {JobId} - Job not found or cannot be cancelled",
                    correlationId,
                    jobId
                );
                return await CreateErrorResponse(
                    req,
                    HttpStatusCode.NotFound,
                    "Job not found or cannot be cancelled"
                );
            }

            _logger.LogInformation(
                "[{CorrelationId}] Successfully cancelled job: {JobId}",
                correlationId,
                jobId
            );

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(
                new { success = true, message = "Job cancelled successfully" }
            );
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "[{CorrelationId}] Error cancelling job: {JobId}. Exception: {ExceptionType}, Message: {ExceptionMessage}",
                correlationId,
                jobId,
                ex.GetType().Name,
                ex.Message
            );
            return await CreateErrorResponse(
                req,
                HttpStatusCode.InternalServerError,
                "An internal error occurred while cancelling the job"
            );
        }
    }

	[Function("ProcessRedactionJob")]
	public async Task ProcessRedactionJob(
	[ServiceBusTrigger("redaction-jobs", Connection = "ServiceBus:ConnectionString")]
	ServiceBusReceivedMessage message,
	ServiceBusMessageActions messageActions,
	FunctionContext context)
	{
		var logger = context.GetLogger("ProcessRedactionJob");

		try
		{
			var messageBody = message.Body.ToString();
			var job = JsonSerializer.Deserialize<ProcessingJob>(messageBody);

			await _redactionService.ProcessRedactionJobAsync(job);

			// Complete the message to remove from queue
			await messageActions.CompleteMessageAsync(message);
		}
		catch (Exception ex)
		{
			logger.LogError(ex, "Error processing message");
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

        var errorResponse = new
        {
            success = false,
            message,
            errors = errors ?? new List<string>(),
        };

        await response.WriteAsJsonAsync(errorResponse);
        return response;
    }

}
