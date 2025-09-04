# Move Docs 2 Blob

## Summary

This sample demonstrates 'on_behalf_of' authentication to securely move  documents from SharePoint to Azure Blob Storage. It showcases delegated access and integration between SPFx, Azure Functions, and Azure Storage, while addressing the need to clean up repeated or outdated files (like "Final", "Final_Draft", etc.) in SharePoint.

[Document Moved](assets/document_moved.png)

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.21.1-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

> App Registation for Token Delegation

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| folder name | [Peter Paul Kirschner](https://github.com/petkir) |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.0     | September 02, 2025 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

Follow these detailed steps to set up and deploy the complete solution:

### 1. Repository Setup

- **Clone this repository**
- **Navigate to the solution folder**
  - Ensure you're in the root directory containing `MoveDocs2Blob.sln`
  - Verify you can see the `func`, `src`, and `infra` folders

### 2. Azure App Registration (Scripted)

- **Run the PowerShell script to create App Registration**

  ```powershell
  .\Create-AppRegistration.ps1
  ```

- **Save the output values** for later configuration:
  `[app-registration-details.json](app-registration-details.json)`
  - Client ID (Application ID)
  - Tenant ID

- **Why this step?** The app registration enables secure authentication between SharePoint, your SPFx solution, and the Azure Functions backend.

### 3. (optional) Deploy Azure Infrastructure (Bicep) 

only you like to deploy

- **Deploy the infrastructure** using Bicep files in the `infra` folder:

  ```bash
  az login
  az account list --output table
  az account set --subscription "your subscription"
  az group create --name "md2b" --location "westeurope"
  az deployment group create --resource-group "md2b" --template-file infra/main.bicep
  ```

- **Capture deployment outputs** such as:
  - Azure Functions URL
  - Storage Account connection strings
  - Blob storage endpoints
  - Table storage connection strings

- **Update configuration files** with the captured values

- **Why this step?** Creates the necessary Azure resources (Functions, Storage, etc.) that your solution depends on.

### 4. Build the Solution

#### Backend (Azure Functions)

- **Build the .NET solution**:

  ```bash
  cd func
  dotnet build
  ```

  Or use the provided VS Code task: "build (functions)"

#### Frontend (SharePoint Framework)

- **Install dependencies and build SPFx**:

  ```bash
  npm install
  gulp build
  ```

- **Why this step?** Compiles your TypeScript code and prepares the SharePoint Framework components for deployment.

### 5. Configure Environment Settings

- **Update `func/local.settings.json`** with your Azure resource connection strings
- **Update SPFx configuration** with the correct API endpoints and scopes
- **Ensure environment variables** are properly configured for API communication

### 6. Deploy Solutions

#### Deploy Azure Functions

- **Publish the Functions app**:

  ```bash
  cd func
  dotnet publish --configuration Release
  ```

- **Deploy to Azure** using your preferred method (VS Code, Azure CLI, or GitHub Actions)

#### Deploy SharePoint Framework Package

- **Bundle and package the SPFx solution**:

  ```bash
  gulp bundle --ship
  gulp package-solution --ship
  ```

- **Upload the `.sppkg` file** from the `sharepoint/solution` folder to your SharePoint App Catalog

### 7. SharePoint Deployment & Configuration

- **Deploy the SPFx package** to your SharePoint tenant
- **Add the web part/extension** to your SharePoint sites
- **Approve API permissions** in the SharePoint Admin Center:
  - Navigate to API Management
  - Approve requests for Microsoft Graph and your Azure Functions API
- **Test the solution** to ensure documents can be archived to blob storage

### 8. Verify Deployment

- **Test the archive functionality** by selecting documents in SharePoint
- **Check Azure Storage** to confirm documents are being moved correctly
- **Review Azure Functions logs** for any errors or issues
- **Validate table storage** contains proper audit records


## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
