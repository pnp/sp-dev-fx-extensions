$credentials = Get-Credential
Connect-PnPOnline "https://<your-tenant>.sharepoint.com/sites/<target-site>" -Credentials $credentials

# You can use the following PnP cmdlet
Add-PnPCustomAction -Name "DiscussNowCustomAction" -Title "DiscussNowCommandSet" -Description "Custom action for Discuss Now Command Set" -RegistrationId "101" -RegistrationType List -ClientSideComponentId "95483216-5d5f-404c-bf25-563e44cdd935" -Location "ClientSideExtension.ListViewCommandSet"

# Or you can manually add the extension to a specific list
$context = Get-PnPContext
$web = Get-PnPWeb
$list = $web.Lists.GetByTitle("Documents")
$context.Load($list)
Execute-PnPQuery

$ca = $list.UserCustomActions.Add()
$ca.ClientSideComponentId = "95483216-5d5f-404c-bf25-563e44cdd935"
$ca.Location = "ClientSideExtension.ListViewCommandSet"
$ca.Name = "DiscussNowCustomAction"
$ca.Title = "DiscussNowCommandSet"
$ca.Description = "Custom action for Discuss Now Command Set"
$ca.Update()

Execute-PnPQuery
