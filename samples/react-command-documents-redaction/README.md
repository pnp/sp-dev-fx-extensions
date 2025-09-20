# Azure AI Document Redaction Extension

## Summary

This SharePoint Framework (SPFx) extension provides document redaction capabilities using Azure AI Language services. Users can select documents from SharePoint document libraries and automatically redact sensitive information such as PII (Personally Identifiable Information), PHI (Protected Health Information), and custom entity types. The solution includes both a SharePoint Framework list view command set extension and a complete Azure Functions backend for processing.

![Document Redaction Extension in action](./assets/demo.gif)

## Features

- **Batch Document Processing**: Select multiple documents from SharePoint libraries for redaction
- **Azure AI Integration**: Leverages Azure Cognitive Services Language APIs for intelligent PII detection
- **Customizable Redaction**: Configure which entity types to redact (SSN, Phone Numbers, Email Addresses, etc.)
- **Real-time Progress Tracking**: Monitor job progress with live status updates
- **Multiple File Format Support**: Supports PDF, DOCX, PPTX, XLSX, TXT, and HTML files
- **Redaction Options**: Choose between masking characters (\*\*\*) or replacement text
- **Azure Service Bus Integration**: Reliable message processing with automatic retry and dead letter handling
- **Error Handling**: Comprehensive error reporting for failed document processing
- **Security**: Uses delegated permissions and on-behalf-of authentication flow

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.21.1-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

### Development Environment

- [Node.js](https://nodejs.org) v22.x.x (LTS recommended)
- [npm](https://www.npmjs.com/)
- [Visual Studio Code](https://code.visualstudio.com/) or similar editor
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

### Azure Services Required

- Azure Storage Account
- Azure Service Bus Namespace
- Azure Cognitive Services Language Resource
- Azure Functions App (.NET 9 isolated)

## Solution

| Solution                    | Author(s)                                   |
| --------------------------- | ------------------------------------------- |
| azure-ai-document-redaction | [Ramin Ahmadi](https://codingwithramin.com) |

## Version history

| Version | Date               | Comments        |
| ------- | ------------------ | --------------- |
| 1.0     | September 21, 2025 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Setup Instructions

This solution consists of two main components:

1. **SharePoint Framework Extension** - The frontend UI
2. **Azure Functions Backend** - Document processing service

### Part 1: Azure Infrastructure Setup

#### 1. Create Azure Resources

**Create Resource Group:**

```bash
az group create --name rg-document-redaction --location "East US"
```

**Create Storage Account:**

```bash
az storage account create \
  --name storredaction$(date +%s) \
  --resource-group rg-document-redaction \
  --location "East US" \
  --sku Standard_LRS
```

**Create Service Bus Namespace:**

```bash
az servicebus namespace create \
  --name sb-document-redaction \
  --resource-group rg-document-redaction \
  --location "East US" \
  --sku Standard
```

**Create Service Bus Queue:**

```bash
az servicebus queue create \
  --name redaction-jobs \
  --namespace-name sb-document-redaction \
  --resource-group rg-document-redaction
```

**Create Cognitive Services Language Resource:**

```bash
az cognitiveservices account create \
  --name cs-language-redaction \
  --resource-group rg-document-redaction \
  --kind TextAnalytics \
  --sku S \
  --location "East US"
```

**Create Function App:**

```bash
az functionapp create \
  --resource-group rg-document-redaction \
  --consumption-plan-location "East US" \
  --runtime dotnet-isolated \
  --runtime-version 9 \
  --functions-version 4 \
  --name func-document-redaction \
  --storage-account storredaction$(date +%s) \
  --os-type Windows
```

#### 2. Get Connection Strings

**Storage Account:**

```bash
az storage account show-connection-string \
  --name your-storage-account-name \
  --resource-group rg-document-redaction \
  --query connectionString \
  --output tsv
```

**Service Bus:**

```bash
az servicebus namespace authorization-rule keys list \
  --resource-group rg-document-redaction \
  --namespace-name sb-document-redaction \
  --name RootManageSharedAccessKey \
  --query primaryConnectionString \
  --output tsv
```

**Cognitive Services:**

```bash
az cognitiveservices account keys list \
  --name cs-language-redaction \
  --resource-group rg-document-redaction \
  --query key1 \
  --output tsv
```

### Part 2: Azure Functions Backend Setup

#### 1. Clone and Setup Backend

```bash
git clone [your-repository-url]
cd azure-functions-backend
```

#### 2. Configure Application Settings

Create or update `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "SharePoint:ClientId": "{{Client_ID}}",
    "SharePoint:ClientSecret": "{{Client_Secret}}",
    "SharePoint:TenantUrl": "{{Tenant_URL}}",
    "SharePoint:TimeoutSeconds": "300",

    "LanguageService:Endpoint": "{{Endpoint}}",
    "LanguageService:ApiKey": "{{API_KEY}}",
    "LanguageService:RedactionPolicy": "CharacterMask", // CharacterMask, EntityMask, or Redact
    "LanguageService:RedactionCharacter": "*",
    "LanguageService:DefaultLanguage": "en-US",
    "LanguageService:ExcludeExtractionData": true, // Whether to exclude extraction data from the response (.json file containing PII information)
    "LanguageService:MaxFileSizeBytes": "52428800",
    "LanguageService:MaxDocumentsPerJob": "20",
    "LanguageService:JobTimeoutMinutes": "30",
    "LanguageService:SupportedFileTypes:0": ".txt",
    "LanguageService:SupportedFileTypes:1": ".pdf",
    "LanguageService:SupportedFileTypes:2": ".docx",
    "LanguageService:DeleteTempFilesAfterProcessing": "true",

    "Storage:ConnectionString": "{{Connection_String}}",
    "Storage:SourceContainer": "source-documents",
    "Storage:TempContainer": "document-redaction",
    "Storage:RetentionDays": "7",
    "Storage:JobStatusTableName": "jobstatus",

    "ServiceBus:ConnectionString": "",
    "ServiceBus:QueueName": "redaction-jobs"
  }
}
```

#### 3. Install Dependencies and Build

```bash
dotnet restore
dotnet build
```

#### 4. Run Locally (for testing)

```bash
func host start
```

#### 5. Deploy to Azure

**Update Function App Settings:**

```bash
az functionapp config appsettings set \
  --name func-document-redaction \
  --resource-group rg-document-redaction \
  --settings \
  "ServiceBusConnection=your-service-bus-connection-string" \
  "LanguageService__Endpoint=https://your-language-service.cognitiveservices.azure.com/" \
  "LanguageService__Key=your-language-service-key" \
  "StorageOptions__SourceContainer=source-documents" \
  "StorageOptions__TempContainer=temp-documents" \
  "StorageOptions__JobStatusTableName=jobstatus"
```

**Deploy Function Code:**

```bash
func azure functionapp publish func-document-redaction
```

#### 6. Get Function App URL

```bash
az functionapp show \
  --name func-document-redaction \
  --resource-group rg-document-redaction \
  --query defaultHostName \
  --output tsv
```

Your function endpoints will be:

- `https://func-document-redaction.azurewebsites.net/api/redaction/start`
- `https://func-document-redaction.azurewebsites.net/api/redaction/status/{jobId}`

### Part 3: SharePoint Framework Extension Setup

#### 1. Clone and Setup Frontend

```bash
git clone [your-repository-url]
cd spfx-extension
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment

Update `src/extensions/documentRedaction/DocumentRedactionCommandSet.ts`:

```typescript
// Update the API endpoint to your Azure Function URL
private readonly API_BASE_URL = 'https://func-document-redaction.azurewebsites.net/api';
```

#### 4. Build and Package

```bash
gulp build
gulp bundle --ship
gulp package-solution --ship
```

#### 5. Deploy to SharePoint

1. **Upload to App Catalog:**

   - Navigate to your tenant App Catalog
   - Upload the `.sppkg` file from `sharepoint/solution/` folder
   - Click "Deploy" when prompted

2. **Enable on Site Collections:**
   - Go to Site Contents → Add an App
   - Find "Azure AI Document Redaction Extension"
   - Add to your site

#### 6. Activate Extension

**Option A: PowerShell Script (Recommended)**

Create `deploy-extension.ps1`:

```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$SiteUrl
)

Connect-PnPOnline -Url $SiteUrl -Interactive

# Add custom action to activate extension
Add-PnPCustomAction -Name "DocumentRedactionCommandSet" `
    -Title "Document Redaction" `
    -Location "ClientSideExtension.ListViewCommandSet" `
    -ClientSideComponentId "your-extension-guid" `
    -Scope Site

Write-Host "Extension deployed successfully to $SiteUrl" -ForegroundColor Green
```

Run the script:

```powershell
.\deploy-extension.ps1 -SiteUrl "https://yourtenant.sharepoint.com/sites/yoursite"
```

**Option B: Manual Activation**

Add this to your page URL for testing:

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"your-extension-guid":{"location":"ClientSideExtension.ListViewCommandSet"}}
```

## Usage

1. **Navigate to a Document Library** in SharePoint
2. **Select one or more documents** you want to redact
3. **Click "Redact Documents"** from the command bar
4. **Configure redaction options:**
   - Choose entity types to redact (SSN, Phone, Email, etc.)
   - Select masking type (characters or replacement text)
   - Set custom masking character if desired
5. **Click "Start Redaction"** to begin processing
6. **Monitor progress** in the status dialog
7. **Download results** when processing completes

## Configuration Options

### Redaction Settings

| Setting          | Description                         | Default                          |
| ---------------- | ----------------------------------- | -------------------------------- |
| Entity Types     | PII categories to detect and redact | Person, SSN, Phone Number, Email |
| Mask Type        | How to replace detected entities    | MaskCharacter                    |
| Mask Character   | Character used for masking          | \*                               |
| Replacement Text | Custom text for replacements        | [REDACTED]                       |

### Supported File Types

- PDF (.pdf)
- Microsoft Word (.docx)
- Microsoft PowerPoint (.pptx)
- Microsoft Excel (.xlsx)
- Plain Text (.txt)
- HTML (.html)

### File Size Limits

- Maximum file size: 50MB per document
- Maximum documents per job: 25 files
- Maximum total job size: 100MB

## Troubleshooting

### Common Issues

**Extension not appearing in command bar:**

- Verify the extension is properly deployed to App Catalog
- Check that custom action is added to the site
- Ensure you have appropriate permissions

**Redaction jobs failing:**

- Check Azure Function logs in Azure Portal
- Verify all connection strings are correct
- Ensure Cognitive Services quota is not exceeded

**Authentication errors:**

- Verify user has read access to source documents
- Check that delegated permissions are configured correctly

### Debug Mode

For local development:

```bash
# Start SPFx extension
gulp serve --nobrowser

# In another terminal, start Azure Functions
cd azure-functions-backend
func host start
```

Update the API endpoint in your code to point to `http://localhost:7071/api` for local testing.

### Monitoring

**Azure Application Insights:**
Enable Application Insights on your Function App for detailed monitoring and error tracking.

**Service Bus Monitoring:**
Monitor queue depth and dead letter queues in Azure Portal to track processing health.

## Security Considerations

- **Data Privacy**: Processed documents are temporarily stored in Azure Storage and automatically cleaned up
- **Authentication**: Uses SharePoint delegated permissions - users can only redact documents they have access to
- **Network Security**: All communications use HTTPS/TLS encryption
- **Access Control**: Extension respects SharePoint permissions and security trimming

## Cost Optimization

- **Cognitive Services**: Use S0 tier for production workloads
- **Storage**: Lifecycle policies to automatically delete temporary files
- **Service Bus**: Standard tier provides cost-effective messaging
- **Functions**: Consumption plan scales automatically and bills per execution

## Contributing

This project welcomes contributions and suggestions. Before contributing, please read the [contribution guidelines](https://github.com/pnp/sp-dev-fx-extensions/blob/main/CONTRIBUTING.md).

## Support

For questions and support:

- [SharePoint Developer Documentation](https://docs.microsoft.com/en-us/sharepoint/dev/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Azure Cognitive Services Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/)

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/azure-ai-document-redaction" />
