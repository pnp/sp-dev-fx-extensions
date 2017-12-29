# Set your own values here
$SiteCollectionUrl = "https://collaborationcorner.sharepoint.com/teams/PnPIntranet"
$ClientId = "f8b71e39-840b-4265-8276-7b907b5ce01e"
$BotId = "7833069a-0013-44a3-b9e0-ed0ef67c1830"
$BotDirectLineSecret = "yJ0i3EV3AWA.cwA.Amc.VgrHiVJ5LNbg9eT5F4rtTxUdxpu8IdFg-GJkoCAA2dM"
$TenantId = "321e2764-3302-41bf-87fd-5f669647b076"

Connect-PnPOnline -Url $SiteCollectionUrl -UseWebLogin

# Set the environment settings in the tenant property bag
Set-PnPStorageEntity -Key "PnPGraphBot_ClientId" -Value $ClientId
Set-PnPStorageEntity -Key "PnPGraphBot_BotId" -Value $BotId
Set-PnPStorageEntity -Key "PnPGraphBot_BotDirectLineSecret" -Value $BotDirectLineSecret
Set-PnPStorageEntity -Key "PnPGraphBot_TenantId" -Value $TenantId