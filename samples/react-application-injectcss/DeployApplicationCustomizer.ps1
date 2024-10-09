# Use this file to deploy the extension to your application catalog
$tenantUrl = "https://<your-tenant>.sharepoint.com"

# Connect to the Site
Connect-PnPOnline $tenantUrl -Interactive -ClientId "<your-new-registered-entra-id-application-id>"

Add-PnPApp -path .\sharepoint\solution\react-application-injectcss.sppkg -Publish -SkipFeatureDeployment -Overwrite
