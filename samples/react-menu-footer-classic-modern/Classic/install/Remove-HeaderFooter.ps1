
[CmdletBinding()]
Param(
   [Parameter(Mandatory=$False,Position=1)]
   [string]$Url,	

   [Parameter(ValueFromPipeline=$True)]
   [object]$Credentials
)

# If credentials were not provided, get them now
if ($Credentials -eq $null) {
    $Credentials  = Get-Credential -Message "Enter Site Administrator Credentials"
}

Connect-PnPOnline -Url $Url -Credentials $Credentials

Write-Output "Script Links before:"
Get-PnPJavaScriptLink

Write-Output "`n`nRemoving script links"
Remove-PnPJavaScriptLink -Name HeaderFooter -Force
Remove-PnPJavaScriptLink -Name ReactDom -Force
Remove-PnPJavaScriptLink -Name React -Force

Write-Output "`n`nScript Links After:"
Get-PnPJavaScriptLink

Write-Output "`n`nDone"

