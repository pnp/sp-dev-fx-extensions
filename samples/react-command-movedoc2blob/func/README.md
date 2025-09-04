# Documents2BlobMover - Azure Functions API

## Overview

This Azure Functions project provides REST APIs for moving SharePoint documents to Azure Blob Storage. The solution implements a clean architecture pattern with dependency injection and service-based design for better testability and maintainability.

## Features

### Document Management

- **Automatic Blob Container Creation**: Creates dedicated blob containers for each SharePoint site using URL segments
- **Metadata Storage**: Stores document references, titles, and descriptions in Azure Table Storage
- **Organized Structure**: Documents are stored in folders corresponding to their original document libraries
- **Complete Metadata Preservation**: Stores all document properties as JSON alongside the moved files
- **User Context**: All operations are performed on behalf of the current user

### Management Features

- **Document Library Discovery**: Retrieves all document libraries from SharePoint sites
- **File Enumeration**: Lists all files within specific document libraries
- **Audit Trail**: Tracks when documents were moved and by whom

## Architecture

The solution follows clean architecture principles:

- **HTTP Triggers**: Entry points for API requests
- **Service Layer**: Business logic implementation with interfaces for testing
- **Dependency Injection**: Services are injected for better testability
- **Storage Abstraction**: Separate services for blob and table storage operations

## API Endpoints

### Move Document

Moves a SharePoint document to blob storage.

**Required Parameters:**

- `ListID`: SharePoint list/library identifier
- `ItemID`: Document item identifier  
- `SiteURL`: SharePoint site URL

**Process:**

1. Authenticates using current user context
2. Retrieves document metadata from SharePoint
3. Creates blob container based on site URL
4. Stores document in appropriate folder structure
5. Saves metadata to table storage
6. Creates JSON file with all document properties

### Show Moved Documents

Retrieves moved documents for a SharePoint site.

**Features:**

- Lists all document libraries
- Enumerates moved files per library
- Returns metadata and storage references

## Technology Stack

- **.NET 9.0**: Latest .NET framework
- **Azure Functions v4**: Serverless compute platform
- **Azure Blob Storage**: Document storage
- **Azure Table Storage**: Metadata storage
- **SharePoint REST API**: Document retrieval
- **Application Insights**: Monitoring and diagnostics

## Development Setup

### Prerequisites

- .NET 9.0 SDK
- Azure Functions Core Tools v4
- Azure Storage Account
- SharePoint Online access

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd func
   ```

2. **Install dependencies**

   ```bash
   dotnet restore
   ```

3. **Configure local settings**

   Update `local.settings.json` with your Azure Storage connection strings:

   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "your-storage-connection-string",
       "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated"
     }
   }
   ```

4. **Build the project**

   ```bash
   dotnet build
   ```

5. **Run locally**

   ```bash
   func start
   ```

## Testing

The service layer implements interfaces that enable comprehensive unit testing:

```csharp
// Example service interface for testing
public interface IDocumentMoverService
{
    Task<MoveResult> MoveDocumentAsync(string listId, string itemId, string siteUrl);
    Task<IEnumerable<MovedDocument>> GetMovedDocumentsAsync(string siteUrl);
}
```

## Deployment

### Azure Deployment

1. Create Azure Function App
2. Configure Application Settings
3. Deploy using Azure DevOps or Visual Studio

### Required Configuration

- Azure Storage connection strings
- SharePoint app registration details
- Application Insights instrumentation key

## Storage Structure

### Blob Storage Hierarchy

```text
container-name/
├── document-library-1/
│   ├── document1.pdf
│   ├── document1.json (metadata)
│   └── document2.docx
└── document-library-2/
    ├── document3.xlsx
    └── document3.json (metadata)
```

### Table Storage Schema

- **PartitionKey**: Site URL hash
- **RowKey**: Document unique identifier
- **Properties**: Title, Description, Move Date, User, etc.

## Monitoring

The solution includes Application Insights integration for:

- Request tracking
- Performance monitoring
- Error logging
- Custom telemetry

## Security Considerations

- All operations use user context authentication
- Blob storage access is controlled via SAS tokens
- Table storage implements proper partition strategies
- Function app authentication required for production