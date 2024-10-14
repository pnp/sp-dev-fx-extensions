# Change these variables to enable the extension
$customCSSUrl = "/SiteAssets/custom.css"
$tenantUrl = "https://<your-tenant>.sharepoint.com/sites/<your-site>"

# Connect to the Site
Connect-PnPOnline $tenantUrl -Interactive -ClientId "<your-new-registered-entra-id-application-id>"

# Connect to tenant
$context = Get-PnPContext
$web = Get-PnPWeb
$context.Load($web)
Invoke-PnPQuery

# Deploy custom action
$ca = $web.UserCustomActions.Add()
$ca.ClientSideComponentId = "5a1fcffd-dfeb-4844-b478-1feb4325a5a7"
$ca.ClientSideComponentProperties = "{""cssurl"":""$customCSSUrl""}"
$ca.Location = "ClientSideExtension.ApplicationCustomizer"
$ca.Name = "InjectCssApplicationCustomizer"
$ca.Title = "Inject CSS Application Extension"
$ca.Description = "Injects custom CSS to make minor style modifications to SharePoint Online"
$ca.Update()

$context.Load($web.UserCustomActions)
Invoke-PnPQuery

