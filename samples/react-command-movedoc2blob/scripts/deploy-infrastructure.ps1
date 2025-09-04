# Deploy Documents2Blob Infrastructure
# This script deploys the Azure infrastructure using Azure CLI

param(
    [string]$ResourceGroup = "rg-docsmover-dev",
    [string]$Location = "eastus",
    [string]$Environment = "dev",
    [string]$AppName = "docsmover",
    [switch]$Help
)

if ($Help) {
    Write-Host "Deploy Documents2Blob Infrastructure"
    Write-Host ""
    Write-Host "USAGE:"
    Write-Host "    .\deploy-infrastructure.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "OPTIONS:"
    Write-Host "    -ResourceGroup NAME    Resource group name (default: $ResourceGroup)"
    Write-Host "    -Location LOCATION     Azure region (default: $Location)"
    Write-Host "    -Environment ENV       Environment name (default: $Environment)"
    Write-Host "    -AppName NAME          Application name (default: $AppName)"
    Write-Host "    -Help                  Show this help message"
    exit 0
}

# Check if Azure CLI is installed
try {
    $null = Get-Command az -ErrorAction Stop
}
catch {
    Write-Error "Azure CLI is not installed. Please install it first."
    exit 1
}

# Check if user is logged in
try {
    $null = az account show 2>$null
}
catch {
    Write-Error "Please log in to Azure first using 'az login'"
    exit 1
}

Write-Host "=== Deploying Documents2Blob Infrastructure ===" -ForegroundColor Green
Write-Host "Resource Group: $ResourceGroup"
Write-Host "Location: $Location"
Write-Host "Environment: $Environment"
Write-Host "App Name: $AppName"
Write-Host ""

# Create resource group if it doesn't exist
Write-Host "Creating resource group..." -ForegroundColor Yellow
az group create `
    --name $ResourceGroup `
    --location $Location `
    --output table

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create resource group"
    exit 1
}

Write-Host "Deploying Bicep template..." -ForegroundColor Yellow
$deploymentOutput = az deployment group create `
    --resource-group $ResourceGroup `
    --template-file "infra/main.bicep" `
    --parameters `
        location=$Location `
        environmentName=$Environment `
        appName=$AppName `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Deployment Outputs ===" -ForegroundColor Cyan
    
    $deploymentOutput.properties.outputs.PSObject.Properties | ForEach-Object {
        Write-Host "$($_.Name): $($_.Value.value)"
    }
    
    Write-Host ""
    Write-Host "=== Next Steps ===" -ForegroundColor Cyan
    Write-Host "1. Update your Function App configuration with SharePoint settings"
    Write-Host "2. Deploy your Function App code using 'azd deploy' or 'func azure functionapp publish'"
    Write-Host "3. Configure SharePoint App Registration for the Function App"
}
else {
    Write-Error "❌ Deployment failed!"
    exit 1
}
