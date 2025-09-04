#!/bin/bash

# Deploy Documents2Blob Infrastructure
# This script deploys the Azure infrastructure using Azure CLI

set -e

# Default values
RESOURCE_GROUP="rg-docsmover-dev"
LOCATION="eastus"
ENVIRONMENT="dev"
APP_NAME="docsmover"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "Error: Please log in to Azure first using 'az login'"
    exit 1
fi

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -g, --resource-group NAME    Resource group name (default: $RESOURCE_GROUP)"
    echo "  -l, --location LOCATION      Azure region (default: $LOCATION)"
    echo "  -e, --environment ENV        Environment name (default: $ENVIRONMENT)"
    echo "  -a, --app-name NAME          Application name (default: $APP_NAME)"
    echo "  -h, --help                   Show this help message"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -g|--resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        -l|--location)
            LOCATION="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--app-name)
            APP_NAME="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

echo "=== Deploying Documents2Blob Infrastructure ==="
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Environment: $ENVIRONMENT"
echo "App Name: $APP_NAME"
echo

# Create resource group if it doesn't exist
echo "Creating resource group..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output table

echo "Deploying Bicep template..."
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "infra/main.bicep" \
    --parameters \
        location="$LOCATION" \
        environmentName="$ENVIRONMENT" \
        appName="$APP_NAME" \
    --output json)

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo
    echo "=== Deployment Outputs ==="
    echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs | to_entries[] | "\(.key): \(.value.value)"'
    echo
    echo "=== Next Steps ==="
    echo "1. Update your Function App configuration with SharePoint settings"
    echo "2. Deploy your Function App code using 'azd deploy' or 'func azure functionapp publish'"
    echo "3. Configure SharePoint App Registration for the Function App"
else
    echo "❌ Deployment failed!"
    exit 1
fi
