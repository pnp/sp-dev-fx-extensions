using System.Security.Cryptography.X509Certificates;
using Azure;
using Azure.AI.TextAnalytics;
using Azure.Data.Tables;
using Azure.Messaging.ServiceBus;
using Azure.Storage.Blobs;
using Azure.Storage.Queues;
using DocumentRedactionApp.Models;
using DocumentRedactionApp.Options;
using DocumentRedactionApp.Services;
using DocumentRedactionApp.Validators;
using FluentValidation;
using Google.Protobuf.WellKnownTypes;
using Microsoft.AspNetCore.Identity;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PnP.Core.Auth;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(
        (context, services) =>
        {
            services.AddApplicationInsightsTelemetryWorkerService();
            services.ConfigureFunctionsApplicationInsights();
			// Configuration
			var configuration = context.Configuration;

            // Azure Storage
            services.AddSingleton(provider =>
            {
                var connectionString =
                    configuration.GetConnectionString("AzureWebJobsStorage")
                    ?? configuration["AzureWebJobsStorage"];
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException(
                        "AzureWebJobsStorage connection string is required"
                    );
                }
                return new BlobServiceClient(connectionString);
            });

            // Azure AI Language Service
            services.AddSingleton(provider =>
            {
                var endpoint = configuration["LanguageService:Endpoint"];
                var apiKey = configuration["LanguageService:ApiKey"];

                if (string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(apiKey))
                {
                    throw new InvalidOperationException(
                        "Language Service configuration is missing"
                    );
                }

                return new TextAnalyticsClient(new Uri(endpoint), new AzureKeyCredential(apiKey));
            });

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

            // Application Services
            services.AddScoped<ITextAnalyticsService, TextAnalyticsService>();
            services.AddScoped<IBlobStorageService, BlobStorageService>();
            services.AddScoped<ISharePointService, SharePointService>();
            services.AddScoped<IJobStatusService, JobStatusService>();
            services.AddScoped<IRedactionService, RedactionService>();
			// Validators
			services.AddScoped<IValidator<RedactionRequest>, RedactionRequestValidator>();

            // HTTP Client
            services.AddHttpClient();

            // Logging
            services.AddLogging();

            // Configuration Options
            services.Configure<LanguageServiceOptions>(configuration.GetSection("LanguageService"));
            services.Configure<SharePointOptions>(configuration.GetSection("SharePoint"));
            services.Configure<StorageOptions>(configuration.GetSection("Storage"));
			services.Configure<ServiceBusOptions>(configuration.GetSection("ServiceBus"));

			services.AddSingleton<TableServiceClient>(serviceProvider =>
			{
				var connectionString = configuration.GetSection("AzureWebJobsStorage");
				return new TableServiceClient(connectionString.Value);
			});

			// Add Service Bus client registration
			services.AddSingleton(serviceProvider =>
			{
				var options = serviceProvider.GetRequiredService<IOptions<ServiceBusOptions>>();
				return new ServiceBusClient(options.Value.ConnectionString);
			});

			services.AddSingleton<ServiceBusSender>(serviceProvider =>
			{
				var serviceBusClient = serviceProvider.GetRequiredService<ServiceBusClient>();
				var options = serviceProvider.GetRequiredService<IOptions<ServiceBusOptions>>();
				return serviceBusClient.CreateSender(options.Value.QueueName);
			});

		}
)
    .Build();

host.Run();
