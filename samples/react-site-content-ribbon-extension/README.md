# Site Content Ribbon Extension

## Summary

Site Content Ribbon Extension is a SharePoint Framework Application Customizer for SharePoint Online that adds a ribbon-style “Site content” action to the SharePoint header and opens a modern, searchable experience for browsing site content directly from the current page.

It helps users quickly discover and navigate lists, document libraries, and other site assets without leaving the page context.

![Ribbon button](sharepoint/assets/site%20content%20ribbon%20button.png)

![Site content panel](sharepoint/assets/site%20content%20panel.png)

![Search and filtering](sharepoint/assets/site%20content%20filter.png)

![Item menu actions](sharepoint/assets/site%20content%20item%20menu%20options.png)

## Compatibility

This sample is optimally compatible with the following environment configuration:

![SPFx 1.23.0](https://img.shields.io/badge/SPFx-1.23.0-green.svg)
![Node.js v22](https://img.shields.io/badge/Node.js-v22-green.svg)
![Toolchain Heft](https://img.shields.io/badge/Toolchain-Heft-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg)
![Hosted Workbench Unsupported](https://img.shields.io/badge/Hosted%20Workbench-Unsupported-red.svg)

## Applies to

- [SharePoint Framework](https://learn.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
- [SharePoint Framework Extensions](https://learn.microsoft.com/sharepoint/dev/spfx/extensions/overview-extensions)
- [Application Customizers](https://learn.microsoft.com/sharepoint/dev/spfx/extensions/get-started/using-page-placeholder-with-application-customizer)
- [Microsoft 365 tenant](https://learn.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)
- SharePoint Online sites

## Contributors

- [Harminder Singh](https://github.com/HarminderSethi)

## Version history

| Version | Date | Comments |
| ------- | ---- | -------- |
| 1.0.0 | June 19, 2026 | Initial sample version |

## Prerequisites

- SharePoint Online tenant
- Modern SharePoint site
- Node.js v22 compatible with SPFx 1.23.0
- Tenant app catalog or site collection app catalog for deployment
- Permissions to install SharePoint Framework solutions
- Appropriate permissions to read site content and use Microsoft Graph for document library drive details when available

## Minimal Path to Awesome

- Clone this repository or download this sample as a ZIP file.
- In the command line, move to the sample folder:

```bash
cd samples/react-site-content-ribbon-extension
```

- Install dependencies:

```bash
npm install
```

- Update the sample page URL in config/serve.json if needed to point to a modern SharePoint Online page in your tenant.
- Start the local debug server:

```bash
heft start --clean
```

- Open the generated SharePoint debug URL in the browser and allow loading debug manifests from localhost.
- Navigate to a SharePoint site page where the extension is available and confirm that the “Site content” action appears in the header.

## Features

### Header-mounted site navigation

Adds a “Site content” action to the SharePoint header for quick access to site assets.

### Searchable content experience

Opens a modern Fluent UI panel with live search, sorting, and a tabular layout for browsing content.

### Rich content metadata

Displays content type, item count, modified date, and description for each result.

### Context actions

Provides menu actions for content items to support lightweight navigation and follow-up actions.

### Microsoft Graph enrichment

Retrieves drive details for document libraries when available to improve the experience.

## Supported contexts

The extension is intended for standard SharePoint Online site pages where the application customizer can run in the header context.

## Build and package

To build the project:

```bash
heft clean
heft build
```

To create a production package:

```bash
heft test --clean --production
heft package-solution --production
```

The generated .sppkg file is created in the sharepoint/solution folder.

## Installation

1. Build the solution package.
2. Upload the generated .sppkg file to the tenant app catalog or a site collection app catalog.
3. Deploy the solution.
4. Navigate to the target SharePoint site.
5. Add the app to the site and confirm the customizer is active.

## Usage

1. Open a SharePoint site page.
2. Select the “Site content” action in the header.
3. Search or browse the content panel to find lists, libraries, and other site assets.
4. Use the available item actions as needed.

## Privacy and data handling

This sample runs entirely in the browser as a SharePoint Framework extension.

- No backend service is used.
- No database or external storage is required for the core experience.
- Microsoft Graph calls are made only when the sample needs document library drive details.

## Known limitations

- The experience is focused on the current SharePoint site context.
- Some content metadata depends on what is available from SharePoint and Microsoft Graph.
- The sample is intended for SharePoint Online and is not a replacement for broader governance or navigation tooling.

## References

- [SharePoint Framework overview](https://learn.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
- [SharePoint Framework extensions overview](https://learn.microsoft.com/sharepoint/dev/spfx/extensions/overview-extensions)
- [Build your first Application Customizer](https://learn.microsoft.com/sharepoint/dev/spfx/extensions/get-started/using-page-placeholder-with-application-customizer)
- [PnPjs documentation](https://pnp.github.io/pnpjs/)

## Disclaimer

THIS CODE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.

## Help

We do not support samples directly, but the community is always willing to help. If you run into issues, please use the GitHub issues for this sample repository to report them or ask questions.

You can try looking at [issues related to this sample](https://github.com/pnp/sp-dev-fx-extensions/issues?q=react-site-content-ribbon-extension) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this sample](https://github.com/pnp/sp-dev-fx-extensions/discussions?discussions_q=react-site-content-ribbon-extension) and see what the community is saying.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=react-site-content-ribbon-extension&authors=@Harminder_Sethi&title=react-site-content-ribbon-extension%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Aquestion&template=question.yml&sample=react-site-content-ribbon-extension&authors=@Harminder_Sethi&title=react-site-content-ribbon-extension%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Aenhancement&template=suggestion.yml&sample=react-site-content-ribbon-extension&authors=@Harminder_Sethi&title=react-site-content-ribbon-extension%20-%20).

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-site-content-ribbon-extension" />