$credentials = Get-Credential
Connect-PnPOnline "https://<your-tenant>.sharepoint.com/sites/<your-site>" -Credentials $credentials

$context = Get-PnPContext
$web = Get-PnPWeb
$context.Load($web)
Execute-PnPQuery

$ca = $web.UserCustomActions.Add()
$ca.ClientSideComponentId = "b1efedb9-b371-4f5c-a90f-3742d1842cf3"
$ca.ClientSideComponentProperties = "{""TopMenuTermSet"":""TenantGlobalNavBar"",""BottomMenuTermSet"":""TenantGlobalFooterBar""}"
$ca.Location = "ClientSideExtension.ApplicationCustomizer"
$ca.Name = "TenantGlobalNavBarCustomAction"
$ca.Title = "TenantGlobalNavBarCustomAction"
$ca.Description = "Custom action for Tenant Global NavBar Application Customizer"
$ca.Update()

$context.Load($web.UserCustomActions)
Execute-PnPQuery
