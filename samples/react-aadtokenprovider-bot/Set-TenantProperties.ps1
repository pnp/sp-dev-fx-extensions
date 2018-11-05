# Set your own values here
$SiteCollectionUrl = "<your site colelction URL>"
$BotId = "<your bot id>"
$BotDirectLineSecret = "<your bot direct line secret>"
$Comment = "PnP - Graph Bot (ADD Token Provider)"

Connect-PnPOnline -Url $SiteCollectionUrl -UseWebLogin

# Set the environment settings in the tenant property bag
Set-PnPStorageEntity -Key "PnP_AADToken_GraphBot_BotId" -Value $BotId -Comment $Comment -Description "Bot ID"
Set-PnPStorageEntity -Key "PnP_AADToken_GraphBot_BotDirectLineSecret" -Value $BotDirectLineSecret -Comment $Comment -Description "Bot Direct Line Secret"