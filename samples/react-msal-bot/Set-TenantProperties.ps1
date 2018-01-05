# Set your own values here
$SiteCollectionUrl = "<your site collection url>"
$ClientId = "<your Azure AD App client id>"
$BotId = "<your bot id>"
$BotDirectLineSecret = "<your bot direct line secret>"
$TenantId = "<your Office 365 tenant id>"
$Comment = "PnP - Graph Bot (MSAL)"

Connect-PnPOnline -Url $SiteCollectionUrl -UseWebLogin

# Set the environment settings in the tenant property bag
Set-PnPStorageEntity -Key "PnPGraphBot_ClientId" -Value $ClientId -Comment $Comment -Description "Azure AD App ID"
Set-PnPStorageEntity -Key "PnPGraphBot_BotId" -Value $BotId -Comment $Comment -Description "Bot ID"
Set-PnPStorageEntity -Key "PnPGraphBot_BotDirectLineSecret" -Value $BotDirectLineSecret -Comment $Comment -Description "Bot Direct Line Secret"
Set-PnPStorageEntity -Key "PnPGraphBot_TenantId" -Value $TenantId -Comment $Comment -Description "Office 365 Tenant ID"