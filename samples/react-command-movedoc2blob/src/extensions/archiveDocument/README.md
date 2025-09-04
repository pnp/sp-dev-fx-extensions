# Documents2BlobMover Extension

This SharePoint Framework (SPFx) extension provides document moving functionality for SharePoint document libraries.

## Features

- **Single Move Command**: Shows a "Move to Blob" command in the list view when users have edit permissions and at least one file/folder is selected
- **Dual Action Dialog**: Presents users with two options:
  - **Move Documents**: Calls an Azure Function to move documents to blob storage
  - **Delete (Recycle Bin)**: Moves documents to the SharePoint recycle bin using JavaScript/REST API
- **Permission-Based**: Only shows the command when users have edit permissions on the list
- **Multi-Selection Support**: Supports moving/deleting multiple items at once
- **Folder Support**: Can move/delete folders as well as individual files

## Configuration

### Azure Function URL
You can configure the Azure Function URL through the extension properties:

```json
{
  "azureFunctionUrl": "https://your-function-app.azurewebsites.net/api/MoveDocument"
}
```

If not configured, it defaults to a placeholder URL that you should replace.

### Manifest Configuration
The extension is configured with a single command `MOVE_COMMAND` that shows as "Move to Blob" in the SharePoint list view.

## Azure Function Integration

The extension calls an Azure Function for moving documents with the following request format:

```json
{
  "ListID": "guid-of-the-list",
  "ItemID": "id-of-the-item",
  "SiteURL": "https://your-sharepoint-site"
}
```

The Azure Function should return a move result indicating success/failure.

## Files Structure

- `ArchiveDocumentCommandSet.ts` - Main extension logic
- `ArchiveDocumentCommandSet.manifest.json` - Extension manifest
- `ArchiveDialog.ts` - Custom dialog component
- `loc/` - Localization files

## Usage

1. Navigate to a SharePoint document library
2. Select one or more files/folders
3. The "Move to Blob" command will appear in the command bar (if you have edit permissions)
4. Click "Move to Blob" to see the dialog with move/delete options
5. Choose your action:
   - **Move Documents**: Sends items to Azure Function for moving to blob storage
   - **Delete (Recycle Bin)**: Moves items to SharePoint recycle bin

## Development

The extension uses:
- SharePoint Framework (SPFx)
- TypeScript
- SharePoint REST API for deletion
- Azure Functions for moving documents
- Custom dialog components

## Deployment

Deploy as a standard SPFx extension to your SharePoint app catalog and associate with document libraries where document moving functionality is needed.
