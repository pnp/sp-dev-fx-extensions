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

## Compatibility

| :warning: Important          |
|:---------------------------|
| Every SPFx version is optimally compatible with specific versions of Node.js. In order to be able to Toolchain this sample, you need to ensure that the version of Node on your workstation matches one of the versions listed in this section. This sample will not work on a different version of Node.|
|Refer to <https://aka.ms/spfx-matrix> for more information on SPFx compatibility.   |

This sample is optimally compatible with the following environment configuration:

![SPFx 1.20.0](https://img.shields.io/badge/SPFx-1.20.0-green.svg)
![Node.js v18](https://img.shields.io/badge/Node.js-v18-green.svg)
![Toolchain: Gulp](https://img.shields.io/badge/Toolchain-Gulp-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Compatible](https://img.shields.io/badge/Hosted%20Workbench-Compatible-green.svg)
![Compatible with Remote Containers](https://img.shields.io/badge/Remote%20Containers-Compatible-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://learn.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

- Node.js v18.17.1 or compatible version
- SharePoint Online environment
- Site Collection Administrator permissions (for deployment)

## Contributors

- [@saiiiiiii](https://github.com/saiiiiiii)

## Version history

| Version | Date | Comments |
| ------- | ---- | -------- |
| 1.0.0 | February 2025 | Initial release |

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

- [Getting started with SharePoint Framework](https://learn.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp)
- [PnPjs Documentation](https://pnp.github.io/pnpjs/)

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Help

We do not support samples, but we this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

You can try looking at [issues related to this sample](https://github.com/pnp/sp-dev-fx-extensions/issues?q=label%3Areact-application-page-indexer) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this sample](https://github.com/pnp/sp-dev-fx-extensions/discussions?discussions_q=label%3Areact-application-page-indexer) and see what the community is saying.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=react-application-page-indexer&authors=@saiiiiiii&title=react-application-page-indexer%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=question.yml&sample=react-application-page-indexer&authors=@saiiiiiii&title=react-application-page-indexer%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=suggestion.yml&sample=react-application-page-indexer&authors=@saiiiiiii&title=react-application-page-indexer%20-%20).

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-spfx-page-indexer" />