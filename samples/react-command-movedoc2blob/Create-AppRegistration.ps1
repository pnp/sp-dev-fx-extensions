#Requires -Modules Microsoft.Graph.Applications, Microsoft.Graph.Authentication

<#
.SYNOPSIS
    Creates an Azure AD app registration with required Graph and SharePoint permissions for the Archive Documents solution.

.DESCRIPTION
    This script creates an Azure AD app registration with the following delegated permissions:
    - Microsoft Graph: Sites.ReadWrite.All
    - SharePoint: Sites.ReadWrite.All
    
    The script will also configure redirect URIs and create API scopes for SharePoint Framework applications.

.PARAMETER AppName
    The display name for the app registration. Defaults to "Archive Documents App"

.PARAMETER RedirectUris
    Array of redirect URIs for the application. Defaults to common SharePoint Framework URIs.

.PARAMETER ScopeName
    The name of the custom scope to create. Defaults to "access_as_user"

.PARAMETER ScopeDescription
    The description of the custom scope. Defaults to "Allow the application to access Archive Documents on behalf of the signed-in user."

.EXAMPLE
    .\Create-AppRegistration.ps1
    
.EXAMPLE
    .\Create-AppRegistration.ps1 -AppName "My Archive App" -RedirectUris @("https://yourtenant.sharepoint.com/_layouts/15/workbench.aspx")

.EXAMPLE
    .\Create-AppRegistration.ps1 -ScopeName "movedocs.readwrite" -ScopeDescription "Read and write documents"

.NOTES
    Author: Generated for Archive Documents Solution
    Requires: Microsoft Graph PowerShell modules
    - Microsoft.Graph.Applications
    - Microsoft.Graph.Authentication
#>

param(
    [Parameter(Mandatory = $false)]
    [string]$AppName = "Move Documents2Blob App",
    
    [Parameter(Mandatory = $false)]
    [string[]]$RedirectUris = @(

    ),
    
    [Parameter(Mandatory = $false)]
    [string]$ScopeName = "access_as_user",
    
    [Parameter(Mandatory = $false)]
    [string]$ScopeDescription = "Allow the application to access Archive Documents on behalf of the signed-in user."
)

# Function to check if required modules are installed
function Test-RequiredModules {
    
    #$requiredModules = @("PnP.PowerShell")
    #$missingModules = @()
    
   # foreach ($module in $requiredModules) {
   #     if (-not (Get-Module -ListAvailable -Name $module)) {
   #         $missingModules += $module
  #      }
   # }
    
    #if ($missingModules.Count -gt 0) {
    #    Write-Error "Missing required PowerShell modules: $($missingModules -join ', ')"
    #    Write-Host "Please install missing modules using:" -ForegroundColor Yellow
    #    foreach ($module in $missingModules) {
    #        Write-Host "Install-Module -Name $module -Scope CurrentUser" -ForegroundColor Cyan
    #    }
    #    return $false
    #}
       
    return $true
}

# Function to create the app registration
function New-AppRegistration {
    param(
        [string]$DisplayName,
        [string[]]$RedirectUris,
        [string]$ScopeName,
        [string]$ScopeDescription
    )
    
    try {
        Write-Host "Creating app registration: $DisplayName" -ForegroundColor Green
        
        # Create a new GUID for the scope
        $scopeId = [System.Guid]::NewGuid().ToString()
        
        # Connect to Microsoft Graph with required scopes
        Connect-MgGraph -Scopes "Application.ReadWrite.All", "Directory.ReadWrite.All" -NoWelcome
        
        # Create the application using the Microsoft Graph PowerShell SDK
        $appParams = @{
            DisplayName = $DisplayName
            SignInAudience = "AzureADMyOrg"
            RequiredResourceAccess = @(
                @{
                    ResourceAppId = "00000003-0000-0000-c000-000000000000" # Microsoft Graph
                    ResourceAccess = @(
                        @{
                            Id = "89fe6a52-be36-487e-b7d8-d061c450a026" # Sites.ReadWrite.All
                            Type = "Scope"
                        },
                        @{
                            Id = "5f8c59db-677d-491f-a6b8-5f174b11ec1d" # Group.Read.All
                            Type = "Scope"
                        }
                    )
                }
                @{
                    ResourceAppId = "00000003-0000-0ff1-ce00-000000000000" # Microsoft Graph
                    ResourceAccess = @(
                        @{
                            Id = "4e0d77b0-96ba-4398-af14-3baa780278f4" # AllSites.Read
                            Type = "Scope"
                        },
                        @{
                            Id = "640ddd16-e5b7-4d71-9690-3f4022699ee7" # AllSites.Write

                            Type = "Scope"
                        }
                    )
                }
            )
            Api = @{
                Oauth2PermissionScopes = @(
                    @{
                        Id = $scopeId
                        AdminConsentDescription = $ScopeDescription
                        AdminConsentDisplayName = $ScopeName
                        UserConsentDescription = $ScopeDescription
                        UserConsentDisplayName = $ScopeName
                        Value = $ScopeName
                        Type = "User"
                        IsEnabled = $true
                    }
                )
            }
        }
        
        # Create the application
        $app = New-MgApplication @appParams
        
        # Add the Application ID URI (identifier URI) for the API
        $identifierUri = "api://$($app.AppId)"
        $updateParams = @{
            ApplicationId = $app.Id
            IdentifierUris = @($identifierUri)
        }
        
        try {
            Update-MgApplication @updateParams
            Write-Host "Application ID URI set to: $identifierUri" -ForegroundColor Green
        }
        catch {
            Write-Warning "Could not set Application ID URI automatically. Please set it manually in Azure Portal to: $identifierUri"
        }
        
        Write-Host "App registration created successfully!" -ForegroundColor Green
       
        
        # Note: For SharePoint permissions, we'll use PnP commands to grant site permissions
        Write-Host "Application ID: $($app.AppId)" -ForegroundColor Cyan
        Write-Host "Object ID: $($app.Id)" -ForegroundColor Cyan
        Write-Host "Application ID URI: api://$($app.AppId)" -ForegroundColor Cyan
        Write-Host "Custom Scope: $ScopeName (ID: $scopeId)" -ForegroundColor Cyan
        
        # Return app with custom scope info
        $app | Add-Member -NotePropertyName "CustomScopeId" -NotePropertyValue $scopeId
        $app | Add-Member -NotePropertyName "CustomScopeName" -NotePropertyValue $ScopeName
        
        return $app
    }
    catch {
        Write-Error "Failed to create app registration: $($_.Exception.Message)"
        throw
    }
}

# Function to display next steps
function Show-NextSteps {
    param($App)
    
    Write-Host "`n" + "="*60 -ForegroundColor Yellow
    Write-Host "APP REGISTRATION CREATED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "="*60 -ForegroundColor Yellow
    
    Write-Host "`nApplication Details:" -ForegroundColor Cyan
    Write-Host "  Name: $($App.DisplayName)"
    Write-Host "  Application ID: $($App.AppId)"
    Write-Host "  Object ID: $($App.Id)"
    Write-Host "  Application ID URI: api://$($App.AppId)"
    
    Write-Host "`nConfigured Permissions:" -ForegroundColor Cyan
    Write-Host "  - Microsoft Graph: Sites.ReadWrite.All (Delegated)"
    
    Write-Host "`nCustom API Scope:" -ForegroundColor Cyan
    Write-Host "  - Scope Name: $($App.CustomScopeName)"
    Write-Host "  - Scope ID: $($App.CustomScopeId)"
    Write-Host "  - Scope URI: api://$($App.AppId)/$($App.CustomScopeName)"
    
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Grant admin consent for the permissions in Azure Portal:"
    Write-Host "   https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnApi/appId/$($App.AppId)"
    
    Write-Host "`n2. Update your SharePoint Framework solution:"
    Write-Host "   - Update package-solution.json webApiPermissionRequests with:"
    Write-Host "     Resource: $($App.AppId)"
    Write-Host "     Scope: $($App.CustomScopeName)"
    
    Write-Host "`n3. Replace {tenant} placeholder in redirect URIs with your actual tenant name"
    
    Write-Host "`n4. Configure your backend API to accept tokens from this app:"
    Write-Host "   - Audience: $($App.AppId)"
    Write-Host "   - Issuer: https://login.microsoftonline.com/{tenantId}/v2.0"
    
    Write-Host "`n5. Test the application permissions in your SharePoint Framework solution"
    
    Write-Host "`nIMPORTANT: Admin consent is required before the application can be used!" -ForegroundColor Red
}

# Main execution
try {
    Write-Host "Move Documents To Blob App Registration Creator" -ForegroundColor Magenta
    Write-Host "=========================================" -ForegroundColor Magenta
    
    # Check for required modules
    if (-not (Test-RequiredModules)) {
        exit 1
    }
    
    # Import required modules
    Import-Module Microsoft.Graph.Applications -Force
    Import-Module Microsoft.Graph.Authentication -Force
    
    # Connect to Microsoft Graph
    Write-Host "`nConnecting to Microsoft Graph..." -ForegroundColor Yellow
    Write-Host "Please sign in with an account that has permissions to create app registrations." -ForegroundColor Cyan
    
    
    # Create the app registration
    $app = New-AppRegistration -DisplayName $AppName -RedirectUris $RedirectUris -ScopeName $ScopeName -ScopeDescription $ScopeDescription
    
    # Display next steps
    Show-NextSteps -App $app
    
    # Optionally save app details to file
    $appDetails = @{
        DisplayName = $app.DisplayName
        ApplicationId = $app.AppId
        ObjectId = $app.Id
        ApplicationIdUri = "api://$($app.AppId)"
        CustomScopeName = $app.CustomScopeName
        CustomScopeId = $app.CustomScopeId
        ScopeUri = "api://$($app.AppId)/$($app.CustomScopeName)"
        CreatedDate = Get-Date
    }
    
    $appDetailsJson = $appDetails | ConvertTo-Json -Depth 3
    $appDetailsFile = "app-registration-details.json"
    $appDetailsJson | Out-File -FilePath $appDetailsFile -Encoding UTF8
    
    Write-Host "`nApp details saved to: $appDetailsFile" -ForegroundColor Green
}
catch {
    Write-Error "Script execution failed: $($_.Exception.Message)"
    exit 1
}
finally {
    # Disconnect from Microsoft Graph
    try {
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        Write-Host "`nDisconnected from Microsoft Graph" -ForegroundColor Yellow
    }
    catch {
        # Ignore disconnect errors
    }
}
