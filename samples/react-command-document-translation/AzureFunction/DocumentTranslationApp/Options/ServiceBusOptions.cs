namespace DocumentTranslationApp.Options;

public class ServiceBusOptions
{
    public const string PropertyName = "ServiceBus";
    public string ConnectionString { get; set; } = string.Empty;
    public string QueueName { get; set; } = "translation-jobs";
}
