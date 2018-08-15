$credentials = Get-Credential
Connect-PnPOnline "https://<Domain>.sharepoint.com/sites/<Siteurl>" -Credentials $credentials

$context = Get-PnPContext
$web = Get-PnPWeb
$context.Load($web)
Execute-PnPQuery

$ca = $web.UserCustomActions.Add()
$ca.ClientSideComponentId = "<Component ID from the extension manifest file>"
$ca.ClientSideComponentProperties = "{}"
$ca.Location = "ClientSideExtension.ApplicationCustomizer"
$ca.Name = "SitePageMetadataExtension"
$ca.Title = "SitePageMetadataExtension"
$ca.Description = "Displays the core metadata of the site page in footer."
$ca.Update()

$context.Load($web.UserCustomActions)
Execute-PnPQuery
