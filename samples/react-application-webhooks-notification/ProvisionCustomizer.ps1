$credentials = Get-Credential
Connect-PnPOnline "https://giuleon.sharepoint.com/sites/demo" -Credentials $credentials

$context = Get-PnPContext
$web = Get-PnPWeb
$context.Load($web)
Execute-PnPQuery

$ca = $web.UserCustomActions.Add()
$ca.ClientSideComponentId = "c0c009bd-5299-4c13-9826-9068022ce804"
$ca.ClientSideComponentProperties = "{""WebhooksSocketServer"":""https://webhooksbroadcaster.azurewebsites.net""}"
$ca.Location = "ClientSideExtension.ApplicationCustomizer"
$ca.Name = "WebhooksNotificationCustomAction"
$ca.Title = "WebhooksNotificationCustomizer"
$ca.Description = "Custom action for receiving webhooks notification across Socket.IO"
$ca.Update()

$context.Load($web.UserCustomActions)
Execute-PnPQuery
