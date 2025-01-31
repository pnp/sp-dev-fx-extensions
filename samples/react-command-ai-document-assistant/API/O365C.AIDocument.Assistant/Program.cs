using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using O365C.AIDocument.Assistant.Models;
using O365C.AIDocument.Assistant.Services;

var builder = FunctionsApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("local.settings.json", optional: true, reloadOnChange: true);


// Application Insights isn't enabled by default. See https://aka.ms/AAt8mw4.
// builder.Services
//     .AddApplicationInsightsTelemetryWorkerService()
//     .ConfigureFunctionsApplicationInsights();
builder.ConfigureFunctionsWebApplication();

builder.Services.AddSingleton(options =>
{
    var configuration = builder.Configuration;
    var azureFunctionSettings = new AzureFunctionSettings();
    configuration.GetSection("AzureAd").Bind(azureFunctionSettings);
    configuration.GetSection("AzureOpenAI").Bind(azureFunctionSettings);
    return azureFunctionSettings;
});

builder.Services.AddSingleton<IAzureAIService, AzureAIService>();
builder.Services.AddSingleton<IGraphAPIService, GraphAPIService>();

builder.Build().Run();
