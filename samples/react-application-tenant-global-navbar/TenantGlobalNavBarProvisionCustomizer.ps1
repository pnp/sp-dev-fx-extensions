Connect-PnPOnline "https://<your-tenant>.sharepoint.com/sites/<your-site>" -UseWebLogin

Add-PnPCustomAction -Title "TenantGlobalNavBarCustomAction" `
					-Name "TenantGlobalNavBarCustomAction" `
					-Location "ClientSideExtension.ApplicationCustomizer" `
					-ClientSideComponentId "b1efedb9-b371-4f5c-a90f-3742d1842cf3" `
					-ClientSideComponentProperties "{""TopMenuTermSet"":""TenantGlobalNavBar"",""BottomMenuTermSet"":""TenantGlobalFooterBar""}"