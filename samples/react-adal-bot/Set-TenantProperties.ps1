# Set your own values here
$SiteCollectionUrl = "<your site collection URL where you're deployng the bot>"
$BotId = "<your Bot ID>"
$BotDirectLineSecret = "<you Bot Direct Line Secret>"
$Comment = "PnP - Graph Bot (ADAL)"

Connect-PnPOnline -Url $SiteCollectionUrl -UseWebLogin

# Set the environment settings in the tenant property bag
Set-PnPStorageEntity -Key "PnP_ADAL_GraphBot_BotId" -Value $BotId -Comment $Comment -Description "Bot ID"
Set-PnPStorageEntity -Key "PnP_ADAL_GraphBot_BotDirectLineSecret" -Value $BotDirectLineSecret -Comment $Comment -Description "Bot Direct Line Secret"
