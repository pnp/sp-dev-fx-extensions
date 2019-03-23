Connect-PnPOnline -Url https://yourtenantname.sharepoint.com/sites/modern-page-demo/

Add-PnPField -List "Site Pages" -DisplayName "Is Model" -InternalName "Is_x0020_Model" -Type Boolean -Group "SPFx Columns" -AddToDefaultView
Set-PnPDefaultColumnValues -List "Site Pages" -Field "Is Model" -Value "0"