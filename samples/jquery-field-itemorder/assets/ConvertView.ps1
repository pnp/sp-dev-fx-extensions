[CmdletBinding()]
param
(
    [Parameter(Mandatory = $true, HelpMessage="Enter the URL of the target site, e.g. 'https://intranet.mydomain.com/sites/targetSite'")]
    [String]
    $TargetSiteUrl,

    [Parameter(Mandatory = $true, HelpMessage="Enter the name of the list")]
    [String]
    $ListName,

    [Parameter(Mandatory = $true, HelpMessage="Enter the name of the view")]
    [String]
    $ViewName,

    [Parameter(Mandatory = $false, HelpMessage="Optional administration credentials")]
    [PSCredential]
    $Credentials
)

if($Credentials -eq $null)
{
	$Credentials = Get-Credential -Message "Enter Admin Credentials"
}

Write-Host -ForegroundColor Yellow "Target Site URL: $targetSiteUrl"
Write-Host -ForegroundColor Yellow "    Target List: $ListName"
Write-Host -ForegroundColor Yellow "    Target View: $ViewName"

try
{
    Connect-PnPOnline $TargetSiteUrl -Credentials $Credentials -ErrorAction Stop

    $list = Get-PnPList -Identity $ListName
    $origView = Get-PnPView -List $list -Identity $ViewName -Includes "OrderedView","RowLimit","ViewQuery","ViewType","Paged"

    Write-Host -ForegroundColor Cyan "Removing Original View..."
    Remove-PnPView -List $list.Id -Identity $origView.Id -Force

    Write-Host -ForegroundColor Cyan "Adding Replacement View..."
    $query = $origView.ViewQuery -replace "(?<=<OrderBy>).*(?=</OrderBy>)", "<FieldRef Name=""Order"" />"
    $params = @{
        List = $list.Id;
        Title = $origView.Title;
        Fields = $origView.ViewFields | Select;
        RowLimit = $origView.RowLimit;
        ViewType = $origView.ViewType;
        Query = $query;
    }
    if($origView.Paged) { $params.Add("Paged", $true) }
    if($origView.PersonalView) { $params.Add("Personal", $true) }
    if($origView.DefaultView) { $params.Add("SetAsDefault", $true) }
    Add-PnPView @params

    Write-Host -ForegroundColor Green "All done!"

    Disconnect-PnPOnline

}
catch
{
    Write-Host -ForegroundColor Red "Exception occurred!" 
    Write-Host -ForegroundColor Red "Exception Type: $($_.Exception.GetType().FullName)"
    Write-Host -ForegroundColor Red "Exception Message: $($_.Exception.Message)"
}