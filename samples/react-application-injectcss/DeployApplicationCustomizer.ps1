# Use this file to deploy the extension to your application catalog
$tenantUrl = "https://<your-tenant>.sharepoint.com"

# Get credentials
$credentials = Get-Credential
Connect-PnPOnline $tenantUrl -Credentials $credentials

Add-PnPApp -path .\sharepoint\solution\react-application-injectcss.sppkg -Publish -SkipFeatureDeployment -Overwrite
