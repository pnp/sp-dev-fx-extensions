using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Azure.Storage.Blobs;
using Azure.Data.Tables;
using Azure.Identity;
using MoveDocs2Blob.Services;
using MoveDocs2Blob.Services.Implementation;
using PnP.Core.Auth;
using PnP.Core.Services.Builder.Configuration;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

// Add Application Insights
builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

// Configure Azure Storage clients
builder.Services.AddSingleton<BlobServiceClient>(serviceProvider =>
{
    var connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
    if (string.IsNullOrEmpty(connectionString))
    {
        // For production, use Managed Identity
        var storageAccountName = Environment.GetEnvironmentVariable("STORAGE_ACCOUNT_NAME");
        if (!string.IsNullOrEmpty(storageAccountName))
        {
            var blobUri = new Uri($"https://{storageAccountName}.blob.core.windows.net");
            return new BlobServiceClient(blobUri, new DefaultAzureCredential());
        }
        throw new InvalidOperationException("Either AzureWebJobsStorage connection string or STORAGE_ACCOUNT_NAME must be configured");
    }
    return new BlobServiceClient(connectionString);
});

builder.Services.AddSingleton<TableServiceClient>(serviceProvider =>
{
    var connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
    if (string.IsNullOrEmpty(connectionString))
    {
        // For production, use Managed Identity
        var storageAccountName = Environment.GetEnvironmentVariable("STORAGE_ACCOUNT_NAME");
        if (!string.IsNullOrEmpty(storageAccountName))
        {
            var tableUri = new Uri($"https://{storageAccountName}.table.core.windows.net");
            return new TableServiceClient(tableUri, new DefaultAzureCredential());
        }
        throw new InvalidOperationException("Either AzureWebJobsStorage connection string or STORAGE_ACCOUNT_NAME must be configured");
    }
    return new TableServiceClient(connectionString);
});

// Configure PnP Core SDK
builder.Services.AddPnPCore();
builder.Services.AddPnPCoreAuthentication();

// Configure PnP context service
builder.Services.AddScoped<IPnPContextService, PnPContextService>();

// Register HTTP client for token service
builder.Services.AddHttpClient<ITokenService, TokenService>();

// Register services
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();
builder.Services.AddScoped<ITableStorageService, TableStorageService>();
builder.Services.AddScoped<ISharePointService, SharePointService>();
builder.Services.AddScoped<IMoveDoc2BlobService, MoveDoc2BlobService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Configure logging
builder.Services.AddLogging(logging =>
{
    logging.SetMinimumLevel(LogLevel.Information);
    logging.AddConsole();
});

var app = builder.Build();

app.Run();
