# SharePoint Page Indexer

## Summary

An SPFx Application Customizer that automatically indexes SharePoint modern pages, extracting page content, web parts (OOTB & SPFx), and metadata into a centralized SharePoint list for search and reporting purposes.

![Page Indexer](./assets/page-indexer-demo.gif)

## Features

- **Automatic Indexing**: Automatically indexes Site Pages when they load
- **Complete Content Capture**: Uses auto-scroll to capture all lazy-loaded content
- **Web Part Detection**: Identifies and catalogs all web parts on the page
- **Deduplication**: Intelligent content deduplication to avoid repeated content
- **Word Count**: Calculates total word count for each page
- **Centralized Storage**: Stores all indexed data in a SharePoint list
- **Smart Filtering**: Only indexes pages in /SitePages/ library

## Upcoming Features

- 🔜 **Image Indexing**: Automatic extraction and indexing of images from pages (coming soon)

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

## Minimal Path to Awesome

- Clone this repository
- In the command-line run:
  - `npm install`
  - `gulp serve`
- To deploy:
  - `gulp bundle --ship`
  - `gulp package-solution --ship`
  - Upload the `.sppkg` file to your App Catalog
  - Install the app on your site

## Features Details

### PageIndex List
The extension automatically creates a "PageIndex" list with these fields:
- **PageId**: Unique identifier
- **PageUrl**: Link to the page
- **PageTitle**: Page title
- **PageContent**: Extracted content
- **TotalWordCount**: Word count
- **WebPartsData**: JSON data of web parts
- **WebPartsCount**: Number of web parts
- **LastIndexed**: Timestamp

### Indexing Policy

**WILL INDEX:**
- ✅ Pages in `/SitePages/` library
- ✅ Modern SharePoint pages (.aspx)

**WILL NOT INDEX:**
- List views and forms
- Settings pages
- Layout pages
- System pages

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp)
- [PnPjs Documentation](https://pnp.github.io/pnpjs/)

## Help

If you encounter any issues while using this sample, [create a new issue](https://github.com/saiiiiiii/react-spfx-page-indexer/issues/new).

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-spfx-page-indexer" />