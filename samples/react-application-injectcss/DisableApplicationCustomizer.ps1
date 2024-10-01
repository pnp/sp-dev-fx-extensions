$tenantUrl = "https://<your-tenant>.sharepoint.com/sites/<your-site>"

# Connect to the Site
Connect-PnPOnline $tenantUrl -Interactive -ClientId "<your-new-registered-entra-id-application-id>"

# Connect to tenant
Get-PnPCustomAction | ? Name -eq "InjectCssApplicationCustomizer" | Remove-PnPCustomAction

