[CmdletBinding()]
param
(
    [Parameter(Mandatory = $true, HelpMessage="Enter the URL of the target site, e.g. 'https://intranet.mydomain.com/sites/targetSite'")]
    [String]
    $TargetSiteUrl,

    [Parameter(Mandatory = $true, HelpMessage="Enter the filepath for the template, e.q. Folder\File.xml or Folder\File.pnp")]
    [String]
    $FilePath,

    [Parameter(Mandatory = $false, HelpMessage="Optional administration credentials")]
    [PSCredential]
    $Credentials
)

if($Credentials -eq $null)
{
	$Credentials = Get-Credential -Message "Enter Admin Credentials"
}

Write-Host -ForegroundColor Yellow "Target Site URL: $targetSiteUrl"
Write-Host -ForegroundColor Yellow "Applying Template: $FilePath"

try
{
    Connect-PnPOnline $TargetSiteUrl -Credentials $Credentials -ErrorAction Stop

    Apply-PnPProvisioningTemplate -Path $FilePath

    $favList = Get-PnPList -Identity "Lists/Favourites" -Includes ReadSecurity, WriteSecurity
    $favList.ReadSecurity = 2
    $favList.WriteSecurity = 2
    
    $authorField = $favList.Fields.GetByInternalNameOrTitle("Author")
    $authorField.Indexed = $true
    $authorField.Update()
    
    $favList.Update()
    $favList.Context.ExecuteQuery()

    Disconnect-PnPOnline

}
catch
{
    Write-Host -ForegroundColor Red "Exception occurred!" 
    Write-Host -ForegroundColor Red "Exception Type: $($_.Exception.GetType().FullName)"
    Write-Host -ForegroundColor Red "Exception Message: $($_.Exception.Message)"
}