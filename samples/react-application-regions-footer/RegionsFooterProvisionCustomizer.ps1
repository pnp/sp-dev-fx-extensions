$credentials = Get-Credential
Connect-PnPOnline "https://<your-tenant>.sharepoint.com/sites/<your-site>" -Credentials $credentials

$context = Get-PnPContext
$web = Get-PnPWeb
$context.Load($web)
Execute-PnPQuery

$ca = $web.UserCustomActions.Add()
$ca.ClientSideComponentId = "67fd1d01-84e8-4fbf-85bd-4b80768c6080"
$ca.ClientSideComponentProperties = "{""SourceTermSetName"":""Regions""}"
$ca.Location = "ClientSideExtension.ApplicationCustomizer"
$ca.Name = "RegionsFooterCustomAction"
$ca.Title = "RegionsFooterCustomizer"
$ca.Description = "Custom action for Regions Footer Application Customizer"
$ca.Update()

$context.Load($web.UserCustomActions)
Execute-PnPQuery
