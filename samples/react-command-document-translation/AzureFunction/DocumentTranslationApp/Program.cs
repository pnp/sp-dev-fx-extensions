using Azure.Data.Tables;
using Azure.Messaging.ServiceBus;
using DocumentTranslationApp.Models;
using DocumentTranslationApp.Options;
using DocumentTranslationApp.Services;
using DocumentTranslationApp.Validators;
using FluentValidation;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        var configuration = context.Configuration;

        // App Configuration for On-Behalf-Of flow
        var appInfo = new AppInfo
        {
            ClientId =
                configuration["SharePoint:ClientId"]
                ?? throw new InvalidOperationException("SharePoint:ClientId is required"),
            ClientSecret =
                configuration["SharePoint:ClientSecret"]
                ?? throw new InvalidOperationException("SharePoint:ClientSecret is required"),
        };
        services.AddSingleton(appInfo);

        // PnP Core SDK Configuration
        services.AddPnPCore();

        // Azure Table Storage
        services.AddSingleton<TableServiceClient>(serviceProvider =>
        {
            var connectionString =
                configuration.GetConnectionString("AzureWebJobsStorage")
                ?? configuration["AzureWebJobsStorage"]
                ?? configuration["Storage:ConnectionString"];

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Storage connection string is required");
            }

            return new TableServiceClient(connectionString);
        });

        // Azure Service Bus
        services.AddSingleton<ServiceBusSender>(serviceProvider =>
        {
            var serviceBusConnectionString =
                configuration["ServiceBus:ConnectionString"]
                ?? throw new InvalidOperationException("ServiceBus:ConnectionString is required");

            var queueName =
                configuration["ServiceBus:QueueName"]
                ?? "translation-jobs";

            var client = new ServiceBusClient(serviceBusConnectionString);
            return client.CreateSender(queueName);
        });

        // Application Services
        services.AddScoped<IBlobStorageService, BlobStorageService>();
        services.AddScoped<ISharePointService, SharePointService>();
        services.AddScoped<IJobStatusService, JobStatusService>();
        services.AddScoped<ITranslationService, TranslationService>();

        // Validators
        services.AddScoped<IValidator<SpfxTranslationRequest>, TranslationRequestValidator>();

        // HTTP Client for Azure Translator API
        services.AddHttpClient();

        // Configuration Options
        services.Configure<DocumentTranslationOptions>(
            configuration.GetSection("DocumentTranslation")
        );
        services.Configure<SharePointOptions>(configuration.GetSection("SharePoint"));
        services.Configure<StorageOptions>(configuration.GetSection("Storage"));
    })
    .Build();

host.Run();
