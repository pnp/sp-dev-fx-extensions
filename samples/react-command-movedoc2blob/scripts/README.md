# App Registration Scripts

This folder contains PowerShell scripts to create the Azure AD app registration required for the Documents2BlobMover solution.

## Prerequisites

Before running the scripts, ensure you have:

1. **PowerShell 5.1 or PowerShell 7+**
2. **PnP PowerShell module** installed:

   ```powershell
   Install-Module -Name PnP.PowerShell -Scope CurrentUser
   ```

3. **Azure AD permissions** to create app registrations (Application Administrator or Global Administrator role)

## Scripts

### Create-AppRegistration.ps1

The main script that creates an Azure AD app registration with the required permissions and custom API scope for the Archive Documents solution.

**Permissions configured:**

- Microsoft Graph: `Sites.ReadWrite.All` (Delegated)
- SharePoint Online: Site permissions (via PnP PowerShell)

**Custom API Scope:**

- Creates a custom scope for your application (default: `access_as_user`)
- Allows SharePoint Framework solutions to request tokens for your backend API
- Scope URI format: `api://{AppId}/{ScopeName}`

**Usage:**

```powershell
# Basic usage with default settings
.\Create-AppRegistration.ps1

# Custom app name and scope
.\Create-AppRegistration.ps1 -AppName "My Documents2BlobMover App" -ScopeName "documents.readwrite"

# Full customization
.\Create-AppRegistration.ps1 -AppName "Custom Documents2BlobMover App" -ScopeName "archive.access" -ScopeDescription "Access archive functionality" -RedirectUris @("https://contoso.sharepoint.com/_layouts/15/workbench.aspx")
```

**Default Redirect URIs:**

- `https://{tenant}.sharepoint.com/_layouts/15/workbench.aspx`
- `https://{tenant}-admin.sharepoint.com/_layouts/15/workbench.aspx`
- `https://localhost:4321/temp/workbench.html`

> **Note:** Replace `{tenant}` with your actual tenant name after the app registration is created.

## Post-Creation Steps

After running the script successfully:

1. **Grant Admin Consent**
   - Navigate to Azure Portal > App registrations
   - Find your app registration
   - Go to "API permissions"
   - Click "Grant admin consent for [your tenant]"

2. **Update SharePoint Framework Configuration**
   - Update `config/package-solution.json` with the new Application ID
   - Add webApiPermissionRequests with the custom scope:

     ```json
     "webApiPermissionRequests": [
       {
         "resource": "{your-app-id}",
         "scope": "{your-scope-name}"
       }
     ]
     ```

3. **Configure Backend API**
   - Update your Azure Functions or API to validate tokens from the app registration
   - Set audience to your Application ID
   - Configure issuer validation

4. **Update Redirect URIs**
   - Replace `{tenant}` placeholders with your actual tenant name
   - Add any additional redirect URIs as needed

5. **Test the Application**
   - Deploy your SharePoint Framework solution
   - Test that API calls work with the new app registration

## Troubleshooting

### Common Issues

**Module not found errors:**

```powershell
Install-Module -Name PnP.PowerShell -Scope CurrentUser -Force
```

**Permission denied:**

- Ensure you have sufficient permissions in Azure AD
- Contact your Azure AD administrator

**Redirect URI issues:**

- Ensure redirect URIs match your SharePoint environment
- Update URIs after initial creation if needed

### Getting Help

If you encounter issues:

1. Check the Azure Portal for detailed error messages
2. Verify your permissions in Azure AD
3. Ensure the PnP PowerShell module is up to date:

   ```powershell
   Update-Module PnP.PowerShell
   ```

## Security Considerations

- The script uses delegated permissions, which require user consent
- Admin consent is required for organization-wide access
- Regularly review and audit app permissions
- Consider using the principle of least privilege

## File Output

The script creates:

- `app-registration-details.json` - Contains app registration details for reference

## Sample Files

This folder also includes sample configuration files:

- `sample-package-solution.json` - Example SharePoint Framework package-solution.json configuration
- `example-protected-function.cs` - Example Azure Function showing how to validate the custom scope
