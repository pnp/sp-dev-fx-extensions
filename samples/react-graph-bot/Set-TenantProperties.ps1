Connect-PnPOnline -Url "https://collaborationcorner.sharepoint.com/teams/PnPIntranet" -UseWebLogin

Set-PnPStorageEntity -Key "PnPGraphBot_ClientId" -Value "f8b71e39-840b-4265-8276-7b907b5ce01e"
Set-PnPStorageEntity -Key "PnPGraphBot_BotId" -Value "7833069a-0013-44a3-b9e0-ed0ef67c1830"
Set-PnPStorageEntity -Key "PnPGraphBot_BotDirectLineSecret" -Value "yJ0i3EV3AWA.cwA.Amc.VgrHiVJ5LNbg9eT5F4rtTxUdxpu8IdFg-GJkoCAA2dM"
Set-PnPStorageEntity -Key "PnPGraphBot_TenantId" -Value "321e2764-3302-41bf-87fd-5f669647b076"