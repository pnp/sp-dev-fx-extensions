Connect-PnPOnline "https://<your-tenant>.sharepoint.com/sites/<your-site>" -Interactive -ClientId "<your-new-registered-entra-id-application-id>"

Add-PnPCustomAction -Title "TenantGlobalNavBarCustomAction" `
					-Name "TenantGlobalNavBarCustomAction" `
					-Location "ClientSideExtension.ApplicationCustomizer" `
					-ClientSideComponentId "b1efedb9-b371-4f5c-a90f-3742d1842cf3" `
					-ClientSideComponentProperties "{""TopMenuTermSet"":""TenantGlobalNavBar"",""BottomMenuTermSet"":""TenantGlobalFooterBar""}"