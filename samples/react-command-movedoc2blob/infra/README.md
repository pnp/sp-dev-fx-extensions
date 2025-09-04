# Infrastructure

This folder contains the Infrastructure as Code (IaC) files for deploying the
Documents2BlobMover solution to Azure. The infrastructure supports a SharePoint
Framework (SPFx) solution with serverless backend processing capabilities.

## Overview

The Documents2BlobMover solution requires the following Azure resources:

- **Azure Functions**: Serverless compute for document processing operations
- **Azure Storage Account**: Blob storage for moved documents and table
  storage for metadata
- **Application Insights**: Monitoring and telemetry for the Azure Functions
- **Managed Identity**: Secure authentication between Azure services

## Architecture

The infrastructure follows a serverless architecture pattern:

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SharePoint    │───▶│  Azure Functions │───▶│  Azure Storage  │
│   Framework     │    │    (HTTP APIs)   │    │   (Blob/Table)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Application     │
                       │ Insights        │
                       └─────────────────┘
```

## Prerequisites

Before deploying the infrastructure, ensure you have:

- Azure CLI installed and configured
- Appropriate permissions to create resources in your Azure subscription
- Resource group created for the deployment

## Resources Created

The Bicep template creates the following Azure resources:

- **Azure Function App** (Consumption plan) - Serverless compute for document processing
- **Azure Storage Account** - Blob storage for documents and Table storage for metadata
- **Application Insights** - Application monitoring and telemetry
- **Log Analytics Workspace** - Centralized logging
- **User-Assigned Managed Identity** - Secure authentication between services
- **Role Assignments** - Storage Blob Data Contributor and Storage Table Data Contributor

## Security Features

- **Managed Identity**: Uses user-assigned managed identity for secure access to storage
- **HTTPS Only**: All endpoints enforce HTTPS
- **No Public Blob Access**: Blob containers are private by default
- **TLS 1.2**: Minimum TLS version enforced on storage account

## Deployment

## Deployment Prerequisites

- Azure CLI installed and configured
- Azure Developer CLI (azd) installed (recommended)
- .NET 9.0 SDK installed
- Appropriate permissions to create resources in your Azure subscription

### Option 1: Using Azure Developer CLI (Recommended)

```bash
# Initialize the environment
azd auth login
azd env new

# Deploy infrastructure and application
azd up
```

### Option 2: Using Azure CLI

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "your-subscription-id"

# Create resource group
az group create --name "rg-docsmover-dev" --location "eastus"

# Deploy the Bicep template
az deployment group create \
  --resource-group "rg-docsmover-dev" \
  --template-file "infra/main.bicep" \
  --parameters "infra/main.parameters.json"
az account set --subscription "your-subscription-id"

# Create resource group (if not exists)
az group create --name "rg-documents2blobmover" --location "East US"

# Deploy the infrastructure
az deployment group create \
  --resource-group "rg-documents2blobmover" \
  --template-file main.bicep \
  --parameters @parameters.json
```

### Option 2: Using Azure DevOps/GitHub Actions

The infrastructure can be deployed as part of a CI/CD pipeline. Refer to the
pipeline configuration files in the `.github/workflows` or `.azuredevops`
directory.

## Security

The infrastructure implements the following security measures:

- **Managed Identity**: Azure Functions use system-assigned managed identity
  for secure access to storage resources
- **RBAC**: Principle of least privilege with specific role assignments
- **Network Security**: Storage account configured with appropriate access
  restrictions
- **Application Insights**: Secure telemetry collection with no sensitive
  data logging

## Monitoring

Application Insights provides comprehensive monitoring capabilities:

- Function execution metrics and performance
- Error tracking and diagnostics
- Custom telemetry and logging
- Dependency tracking for storage operations

## Cost Optimization

The serverless architecture provides cost-effective scaling:

- **Consumption Plan**: Pay-per-execution for Azure Functions
- **Storage Tiers**: Appropriate storage tiers for moved documents
- **Monitoring**: Application Insights with data retention policies

## Troubleshooting

Common issues and solutions:

1. **Deployment Failures**: Check Azure CLI version and permissions
2. **Function Access Issues**: Verify managed identity role assignments
3. **Storage Connectivity**: Confirm storage account configuration
4. **Monitoring Gaps**: Validate Application Insights instrumentation key

## Resources

- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Azure Storage Documentation](https://docs.microsoft.com/azure/storage/)
- [Bicep Documentation](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [Application Insights Documentation](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
