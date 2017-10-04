$credentials = Get-Credential
Connect-PnPOnline "https://<your-tenant>.sharepoint.com/sites/travelinnovation" -Credentials $credentials

$context = Get-PnPContext
$web = Get-PnPWeb
$context.Load($web)
Execute-PnPQuery

$ca = $web.UserCustomActions.Add()
$ca.ClientSideComponentId = "67fd1d01-84e8-4fbf-85bd-4b80768c6080"
$ca.ClientSideComponentProperties = "{""SourceTermSetName"":""Regions""}"
$ca.Location = "ClientSideExtension.ApplicationCustomizer"
$ca.Name = "YammerFooterCustomAction"
$ca.Title = "YammerFooterCustomizer"
$ca.Description = "Custom action for Yammer Footer Application Customizer"
$ca.Update()

$context.Load($web.UserCustomActions)
Execute-PnPQuery
