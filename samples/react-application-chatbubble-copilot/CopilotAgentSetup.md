# Deploy a Microsoft Copilot Studio Copilot as a SharePoint Component with Single Sign-On (SSO)

This guide provides a comprehensive walkthrough for deploying a Microsoft Copilot Studio Copilot as a SharePoint Framework (SPFx) component with Single Sign-On (SSO) functionality. Follow these steps to ensure a seamless integration.

---

## Overview

Deploying the Copilot as a SharePoint SPFx component involves the following:

1. Configuring Microsoft Entra ID authentication for your Copilot.
2. Registering your SharePoint site as a canvas app to enable SSO.
3. Building, configuring, and packaging the SPFx component.
4. Deploying the component to SharePoint, configuring properties, and validating its functionality.

Each step is explained in detail, with examples, prerequisites, and troubleshooting tips.

---

## Step 1: Configure Microsoft Entra ID Authentication for the Copilot

Authentication is a critical step in ensuring the Copilot operates securely within your organization. This involves setting up API permissions, defining custom scopes, and validating the integration with the Copilot Studio authoring environment.

### Prerequisites:

- Access to the Azure portal with administrative privileges.
- Existing app registration for the Copilot or the ability to create a new one.
- Familiarity with Microsoft Entra ID concepts such as scopes, API permissions, and redirect URIs.

### Detailed Steps:

1. **Create or Update App Registration for the Copilot**:
   - Log in to the Azure portal.
   - Navigate to **Azure Active Directory** > **App registrations**.
   - Select your existing Copilot app registration or create a new one by clicking **New registration**.
   - Specify the following details:
     - **Name**: Provide a meaningful name (e.g., "Copilot Authentication App").
     - **Supported account types**: Choose "Accounts in this organizational directory only".
     - **Redirect URI**: Leave blank for now; this will be configured later.

2. **Define API Permissions**:
   - Go to the **API permissions** tab in the app registration.
   - Add permissions for Microsoft Graph:
     - **Delegated permissions**: `Sites.Read.All`, `Sites.ReadWrite.All`, and any others required for your use case.
   - If using custom APIs, click **Add a permission** > **APIs my organization uses** and locate your custom API.
   - Select the appropriate custom scope, e.g., `api://YOUR-APP-ID/SPO.Read`.
   - Grant admin consent for the permissions by clicking **Grant admin consent for [Your Tenant Name]**.

3. **Create a Custom Scope** (if applicable):
   - Navigate to the **Expose an API** tab.
   - Define a custom scope that matches your application's requirements:
     - **Scope name**: e.g., `SPO.Read`.
     - **Who can consent**: Admins only.
     - **Admin consent display name**: Provide a clear name, e.g., "Read access to SharePoint Online".
     - **Admin consent description**: Describe the scope, e.g., "Allows reading data from SharePoint Online".
   - Save the scope and note its full URI, e.g., `api://YOUR-APP-ID/SPO.Read`.

4. **Configure Token Exchange URL**:
   - Under **Authentication** > **Advanced settings**, populate the Token Exchange URL:
     ```plaintext
     https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
     ```
   - This URL will facilitate the secure exchange of tokens between the Copilot and custom applications.

5. **Validate Authentication in Copilot Studio**:
   - Open Copilot Studio and navigate to the authoring canvas.
   - Sign in to verify that authentication is working correctly. If "Require users to sign in" is enabled, the canvas should automatically prompt for authentication.
   - Test Generative Answers with SharePoint or OneDrive data sources to confirm proper permissions.

**Resources**:
- [Microsoft Entra ID Authentication Guide](https://learn.microsoft.com/en-us/power-virtual-agents/configuration-authentication-azure-ad)
- [Using SharePoint or OneDrive Data for Generative Answers](https://learn.microsoft.com/en-us/power-virtual-agents/nlu-generative-answers-sharepoint-onedrive)

---

## Step 2: Register Your SharePoint Site as a Canvas App

A canvas app acts as the hosting environment for the Copilot and is critical for enabling SSO. This step involves creating a new app registration in Microsoft Entra ID for your SharePoint site.

### Prerequisites:

- SharePoint Online site URL where the Copilot will be hosted.
- Administrative access to Microsoft Entra ID.

### Detailed Steps:

1. **Create a New App Registration**:
   - In the Azure portal, go to **Azure Active Directory** > **App registrations** > **New registration**.
   - Fill in the following details:
     - **Name**: Provide a clear name, e.g., "SharePoint Copilot Canvas".
     - **Supported account types**: Choose "Accounts in this organizational directory only".
     - **Redirect URI**: Add the SharePoint site URL:
       ```plaintext
       https://mytenant.sharepoint.com/sites/MySite
       https://mytenant.sharepoint.com/sites/MySite/
       ```
       Ensure you include both versions (with and without trailing slash) for compatibility.

2. **Add API Permissions**:
   - Navigate to the **API permissions** tab.
   - Add permissions for the custom API created in Step 1.
   - Search for the custom API under "APIs my organization uses" and select the appropriate scope.

3. **Document Key Details**:
   - Note down the following details for future use:
     - **Application (Client) ID**
     - **Directory (Tenant) ID**

4. **Validate Redirect URI**:
   - Ensure the SharePoint site URL matches the registered redirect URIs.
   - If you encounter authentication errors, verify the URI format and trailing slash consistency.

**Resources**:
- [Configure Single Sign-On with Microsoft Entra ID](https://learn.microsoft.com/en-us/power-virtual-agents/configure-sso?tabs=webApp#create-app-registrations-for-your-custom-website)

### Validation:

1. **Verify Installation**:
   - Navigate to the SharePoint site and ensure the Copilot button appears.
   - Click the button to launch the chat interface.

2. **Test SSO**:
   - Confirm users are signed in automatically and can interact with the Copilot seamlessly.

---

## Troubleshooting

- **Authentication Errors**: Verify app registration settings, including redirect URIs and API permissions.
- **Component Deployment Issues**: Check the `.sppkg` file, ensure the App Catalog is enabled, and review SharePoint logs for errors.

---

By completing these steps, you have successfully deployed a Microsoft Copilot Studio Copilot as a SharePoint SPFx component with SSO.

