# Quick Start Guide - Document Translation Extension

This guide will help you get the Document Translation extension up and running quickly.

## Prerequisites Checklist

- [ ] Node.js v22.14.0 or higher installed
- [ ] Azure subscription with Translator resource created
- [ ] Azure Storage Account created
- [ ] Azure AD App Registration configured
- [ ] SharePoint Online tenant with admin access

## 5-Minute Setup

### Step 1: Install SPFx Extension (2 minutes)

```bash
cd SPFx
npm install
```

Edit `config/serve.json` - Update these values:
- `azureFunctionUrl`: Your Azure Function URL (or `http://localhost:7071` for local testing)
- `clientId`: Your Azure AD App ID
- `pageUrl`: Replace `{tenantDomain}` with your SharePoint tenant

```bash
gulp serve
```

### Step 2: Test Locally (3 minutes)

1. Navigate to your SharePoint document library
2. Append query string from gulp serve output
3. Select a document
4. Click "Translate Document" button
5. Choose target languages
6. Click "Start Translation"

**Note**: Without the Azure Function backend, you'll see a configuration error. This is expected for frontend-only testing.

## Full Production Setup

### Azure Resources Setup (15 minutes)

#### 1. Create Azure Translator Resource

```bash
# Using Azure CLI
az cognitiveservices account create \
  --name my-translator \
  --resource-group my-rg \
  --kind TextTranslation \
  --sku S1 \
  --location eastus

# Get keys
az cognitiveservices account keys list \
  --name my-translator \
  --resource-group my-rg
```

**Save these values:**
- Endpoint: `https://api.cognitive.microsofttranslator.com`
- Key: (from command output)
- Region: `eastus`

#### 2. Create Storage Account

```bash
az storage account create \
  --name mytranslatorstorage \
  --resource-group my-rg \
  --location eastus \
  --sku Standard_LRS

# Get connection string
az storage account show-connection-string \
  --name mytranslatorstorage \
  --resource-group my-rg
```

**Save**: Connection string

#### 3. Create Azure Function App

```bash
az functionapp create \
  --name my-translation-func \
  --resource-group my-rg \
  --storage-account mytranslatorstorage \
  --consumption-plan-location eastus \
  --runtime dotnet-isolated \
  --functions-version 4
```

**Save**: Function App URL

#### 4. Configure Azure AD App Registration

1. Go to Azure Portal > Azure Active Directory > App registrations
2. Click "New registration"
3. Name: "SharePoint Document Translation"
4. Redirect URI: Not needed for backend service
5. Click "Register"

**Save**: Application (client) ID

6. Go to "Certificates & secrets" > "New client secret"
7. Description: "Translation Service Secret"
8. Expiry: 24 months
9. Click "Add"

**Save**: Secret value (copy immediately, won't show again)

10. Go to "API permissions"
11. Click "Add a permission"
12. Select "SharePoint" > "Delegated permissions"
13. Check "AllSites.Write"
14. Click "Grant admin consent"

15. Go to "Expose an API"
16. Click "Add a scope"
17. Accept default Application ID URI: `api://{client-id}`
18. Scope name: `user_impersonation`
19. Admin consent display name: "Access SharePoint as user"
20. State: Enabled
21. Click "Add scope"

### Backend Setup (10 minutes)

#### 1. Copy Azure Function Files

```bash
cd ../AzureFunction/DocumentTranslationApp

# Copy implementation from redaction sample and adapt
# OR implement following the IMPLEMENTATION_GUIDE.md
```

#### 2. Configure local.settings.json

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "DocumentTranslation:Endpoint": "https://api.cognitive.microsofttranslator.com",
    "DocumentTranslation:SubscriptionKey": "<YOUR_TRANSLATOR_KEY>",
    "DocumentTranslation:Region": "eastus",
    "BlobStorage:ConnectionString": "<YOUR_STORAGE_CONNECTION_STRING>",
    "BlobStorage:SourceContainer": "translation-source",
    "BlobStorage:TargetContainerPrefix": "translation-target-",
    "SharePoint:ClientId": "<YOUR_APP_ID>",
    "SharePoint:ClientSecret": "<YOUR_APP_SECRET>"
  }
}
```

#### 3. Test Locally

```bash
# Install Azure Functions Core Tools if not already installed
npm install -g azure-functions-core-tools@4

# Start Azurite for local storage emulation
azurite --silent --location c:\azurite --debug c:\azurite\debug.log

# Run function locally
func start
```

#### 4. Deploy to Azure

```bash
func azure functionapp publish my-translation-func

# Set application settings
az functionapp config appsettings set \
  --name my-translation-func \
  --resource-group my-rg \
  --settings \
    "DocumentTranslation:Endpoint=https://api.cognitive.microsofttranslator.com" \
    "DocumentTranslation:SubscriptionKey=<YOUR_KEY>" \
    "DocumentTranslation:Region=eastus" \
    "BlobStorage:ConnectionString=<YOUR_CONNECTION_STRING>" \
    "SharePoint:ClientId=<YOUR_APP_ID>" \
    "SharePoint:ClientSecret=<YOUR_APP_SECRET>"
```

### Deploy SPFx to Production (5 minutes)

```bash
cd ../../SPFx

# Build for production
gulp bundle --ship
gulp package-solution --ship

# Upload to SharePoint
# 1. Go to SharePoint Admin Center > Apps > App Catalog
# 2. Upload sharepoint/solution/react-command-document-translation.sppkg
# 3. Click "Deploy"
# 4. Trust the solution

# Grant API permissions
# 1. Go to SharePoint Admin Center > Advanced > API access
# 2. Approve pending request for api://{your-app-id}
```

### Configure Extension Properties (2 minutes)

**Option 1: Tenant-wide Configuration** (Recommended)

```powershell
# Connect to SharePoint Online
Connect-PnPOnline -Url https://yourtenant-admin.sharepoint.com -Interactive

# Add tenant-wide extension
Add-PnPCustomAction -Name "DocumentTranslationExt" `
  -Title "Document Translation" `
  -Location "ClientSideExtension.ListViewCommandSet.CommandBar" `
  -ClientSideComponentId "1f94503e-9f38-49f9-ab62-5dbbc086cbb6" `
  -ClientSideComponentProperties '{
    "azureFunctionUrl":"https://my-translation-func.azurewebsites.net",
    "clientId":"<YOUR_APP_ID>",
    "maxFilesPerJob":50,
    "maxFileSize":41943040
  }' `
  -Scope Site
```

**Option 2: Site-specific Configuration**

```powershell
# Connect to specific site
Connect-PnPOnline -Url https://yourtenant.sharepoint.com/sites/yoursite -Interactive

# Add site-level extension
Add-PnPCustomAction -Name "DocumentTranslationExt" `
  -Title "Document Translation" `
  -Location "ClientSideExtension.ListViewCommandSet.CommandBar" `
  -ClientSideComponentId "1f94503e-9f38-49f9-ab62-5dbbc086cbb6" `
  -ClientSideComponentProperties '{
    "azureFunctionUrl":"https://my-translation-func.azurewebsites.net",
    "clientId":"<YOUR_APP_ID>"
  }' `
  -Scope Web
```

## Verification

### Test the Complete Flow

1. Navigate to any document library in SharePoint
2. Upload a test document (e.g., .docx or .pdf)
3. Select the document
4. Click "Translate Document" in command bar
5. Select target language (e.g., French)
6. Click "Start Translation"
7. Monitor progress
8. Check for translated document with `[TRANSLATED_fr]_` prefix

### Troubleshooting Quick Checks

**Issue: "Document Translation service is not configured"**
- Check: Extension properties are set correctly
- Check: Function App URL is accessible
- Check: ClientId matches Azure AD app

**Issue: "Access denied (403)"**
- Check: API permissions granted in SharePoint Admin
- Check: User has Edit permission on library
- Check: Azure AD app has SharePoint API permissions

**Issue: "Translation failed"**
- Check: Azure Function logs in Application Insights
- Check: Translator resource is active and has quota
- Check: Storage account connection string is correct
- Check: Network connectivity from Function App to Azure services

### View Logs

**Azure Function Logs:**
```bash
# Stream logs from Azure
func azure functionapp logstream my-translation-func

# Or view in Azure Portal
# Function App > Monitoring > Log stream
```

**Application Insights:**
```bash
# View in Azure Portal
# Application Insights > Logs
# Query: traces | where operation_Name contains "Translation"
```

## Cost Estimation

For a typical deployment:

| Service | Estimated Monthly Cost |
|---------|------------------------|
| Azure Translator (S1) | $10/million characters |
| Storage Account | $0.20-$1.00 |
| Function App (Consumption) | $0-$5 (free tier) |
| Application Insights | Free tier sufficient |
| **Total** | **~$10-$20/month** (for moderate use) |

**Note**: Actual costs depend on usage volume. Monitor in Azure Cost Management.

## Next Steps

- [ ] Set up Application Insights alerts for failures
- [ ] Configure Azure Cost Management budget alerts
- [ ] Implement blob storage lifecycle policies for cleanup
- [ ] Create user documentation for your organization
- [ ] Test with various file formats
- [ ] Set up CI/CD pipeline for automated deployments

## Support Resources

- **Azure Translator Documentation**: https://learn.microsoft.com/en-us/azure/ai-services/translator/
- **SPFx Documentation**: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/
- **PnP Community**: https://pnp.github.io/
- **Sample Issues**: Create issue in GitHub repository

## Security Best Practices

- [ ] Store secrets in Azure Key Vault (not App Settings)
- [ ] Enable Managed Identity for Function App
- [ ] Implement rate limiting on Azure Function
- [ ] Set up alerts for suspicious activity
- [ ] Regularly rotate Azure AD app secret
- [ ] Review and minimize API permissions
- [ ] Enable audit logging
- [ ] Implement document size limits

---

**Congratulations!** Your Document Translation extension should now be fully operational. 🎉
