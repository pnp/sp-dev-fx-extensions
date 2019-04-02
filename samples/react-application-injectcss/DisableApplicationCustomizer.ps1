$tenantUrl = "https://<your-tenant>.sharepoint.com/sites/<your-site>"

# Get credentials
$credentials = Get-Credential
Connect-PnPOnline $tenantUrl -Credentials $credentials

# Connect to tenant
Get-PnPCustomAction | ? Name -eq "InjectCssApplicationCustomizer" | Remove-PnPCustomAction

