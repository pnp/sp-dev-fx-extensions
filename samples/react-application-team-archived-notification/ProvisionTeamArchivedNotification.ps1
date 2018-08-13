$credentials = Get-Credential
Connect-PnPOnline "https://innofrontier.sharepoint.com/teams/testiryhma" -Credentials $credentials

$context = Get-PnPContext
$web = Get-PnPWeb
$context.Load($web)
Invoke-PnPQuery

$ca = $web.UserCustomActions.Add()
$ca.ClientSideComponentId = "387bb15a-68d2-474b-8512-5963655f9799"
$ca.ClientSideComponentProperties = "{""testMessage"":""Test""}"
$ca.Location = "ClientSideExtension.ApplicationCustomizer"
$ca.Name = "TeamArchivedNotifier"
$ca.Title = "TeamArchivedNotifier"
$ca.Description = "Custom action for Team Archived Notifier Application Customizer"
$ca.Update()

$context.Load($web.UserCustomActions)
Invoke-PnPQuery