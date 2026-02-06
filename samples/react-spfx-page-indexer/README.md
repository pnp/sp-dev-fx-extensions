# SharePoint Page Indexer

## Summary

An SPFx Application Customizer that automatically indexes SharePoint modern pages, extracting page content, web parts (OOTB & SPFx), and metadata into a centralized SharePoint list for search and reporting purposes.

![Page Indexer](./assets/page-indexer-demo.gif)

## Features

- **Automatic Indexing**: Automatically indexes Site Pages when they load
- **Complete Content Capture**: Uses auto-scroll to capture all lazy-loaded content
- **Web Part Detection**: Identifies and catalogs all SPFx web parts on the page
- **Deduplication**: Intelligent content deduplication to avoid repeated content
- **Word Count**: Calculates total word count for each page
- **Centralized Storage**: Stores all indexed data in a SharePoint lists    
- **Smart Filtering**: Only indexes pages in /SitePages/ library

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.20.0-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

- Node.js v18.17.1 or compatible version
- SharePoint Online environment
- Site Collection Administrator permissions (for deployment)

## Solution

| Solution | Author(s) |
| -------- | --------- |
| react-spfx-page-indexer | [@saiiiiiii](https://github.com/saiiiiiii) |

## Version history

| Version | Date | Comments |
| ------- | ---- | -------- |
| 1.0.0 | February 2025 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Features

### Automatic Page Indexing
The extension automatically indexes SharePoint Site Pages when they load, capturing:
- Page URL and title
- Complete page content (with lazy loading support)
- All SPFx web parts and their content
- Total word count
- Last indexed timestamp

### Smart Content Extraction
- **Auto-scroll**: Automatically scrolls through the page to trigger lazy-loaded content
- **Deduplication**: Removes duplicate web part instances
- **Clean output**: Stores content once without repetition

### PageIndex List Structure
The extension creates a "PageIndex" list with these fields:
- **PageId**: Unique identifier (indexed)
- **PageUrl**: Hyperlink to the page
- **PageTitle**: Title of the page
- **PageContent**: Extracted content (multiline text)
- **TotalWordCount**: Word count (number)
- **WebPartsData**: JSON data of web parts (multiline text)
- **WebPartsCount**: Number of web parts (number)
- **LastIndexed**: Timestamp (datetime)

## Configuration

The extension works out-of-the-box with these default settings:
- **Indexing delay**: 6 seconds after page load
- **Auto-scroll speed**: 500px every 150ms
- **Scroll timeout**: 10 seconds maximum
- **Image loading timeout**: 5 seconds

To customize, modify the following files:
- `GraphService.ts`: Adjust scroll speed and timeouts
- `PageIndexerService.ts`: Change indexing delay and retry logic

## Indexing Policy

**WILL INDEX:**
- ✅ Pages in `/SitePages/` library
- ✅ Modern SharePoint pages (.aspx)

**WILL NOT INDEX:**
- List views and forms
- Settings pages
- Layout pages
- System pages

## Architecture

### Key Components

**PageIndexerApplicationCustomizer.ts**
- Entry point for the extension
- Initializes PnPjs and services
- Provides global debug interface

**PageIndexerService.ts**
- Manages indexing workflow
- Handles page navigation detection
- Implements retry logic

**GraphService.ts**
- Extracts page content and metadata
- Implements auto-scroll for lazy loading
- Detects and catalogs SPFx web parts

**ListService.ts**
- Manages SharePoint list operations
- Creates and maintains PageIndex list
- Handles CRUD operations

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp)
- [PnPjs Documentation](https://pnp.github.io/pnpjs/)

## Help

We do not support samples, but this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for community members to volunteer their time and help resolve issues.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/react-spfx-page-indexer/issues/new).

## Support

This is an open source project and community provided support is available via GitHub issues.

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-spfx-page-indexer" />