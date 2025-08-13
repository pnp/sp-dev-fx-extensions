# SharePoint PDF Converter

![preview](./screenshot.gif "Preview")

A SharePoint Framework extension that brings powerful PDF conversion capabilities to your SharePoint Online document libraries. Convert documents to PDF, download files as PDF, preserve metadata, and more - all with a modern, responsive UI.

## Compatibility

![SPFx 1.20](https://img.shields.io/badge/spfx-1.20.0-green.svg)
![Node.js LTS 18.x](https://img.shields.io/badge/Node.js-LTS%2018.x-green.svg)
![SharePoint Online](https://img.shields.io/badge/SharePoint-Online-red.svg)
![Workbench Hosted: Does not work with local workbench](https://img.shields.io/badge/Workbench-Hosted-yellow.svg "Does not work with local workbench")

## Key Features

### PDF Conversion
- Convert documents to PDF with customizable quality settings (low, medium, high)
- Support for multiple file formats: Word, Excel, PowerPoint, CSV, RTF, and more
- Powered by Microsoft Graph API V3 for efficient processing

### Advanced Options
- **Batch Processing**: Convert multiple documents simultaneously
- **Metadata Preservation**: Keep important document properties during conversion
- **Custom Destinations**: Choose where to save your converted files
- **Email Integration**: Send PDFs via email with custom subject lines

### Modern Experience
- **Fluent UI Design**: Clean, modern interface following Microsoft design language
- **Responsive Layout**: Works on desktop and mobile devices
- **Dark/Light Mode**: Support for different visual preferences
- **Accessibility**: Designed with accessibility in mind
- **Multi-language Support**: English, French, Spanish, German included

## How It Works

The extension adds two commands to your document library ribbon:

1. **Download as PDF**: Converts selected document(s) and downloads to your device
2. **Convert to PDF**: Transforms document(s) to PDF and saves in SharePoint

When triggered, a customizable options panel allows you to:
- Set conversion quality
- Enable/disable metadata preservation
- Send email notifications
- Select custom save locations

![Options Dialog](./options-dialog.png)

## Quick Start Guide

### Installation

1. Download the [pnp-ext-pdf-convert.sppkg](./pnp-ext-pdf-convert.sppkg) file
2. Upload to your tenant app catalog
   - URL: `https://<tenant>-admin.sharepoint.com/_layouts/15/online/ManageAppCatalog.aspx`
   - Requires SharePoint Administrator rights
3. Trust the solution when prompted
   ![Trust Solution](./screenshot-2.png)
4. Navigate to any document library to begin using the commands

### Usage

1. Select one or more supported documents in a library
2. Click either "Download as PDF" or "Convert to PDF" from the ribbon
3. Configure your preferences in the options dialog
4. Start the conversion
5. View progress and results in the status dialog

## Supported File Formats

- **Word Documents**: doc, docx, rtf
- **Excel Spreadsheets**: xls, xlsx, csv
- **PowerPoint Presentations**: ppt, pptm, pptx, pps, ppsx, ppsxm, pot, potm, potx
- **OpenDocument Formats**: odp, ods, odt
- **Other**: html

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | 2019 | Initial release by Puzzlepart |
| 1.1 | Feb 2021 | Re-branded to PnP |
| 1.2 | Oct 2022 | Updated to SPFx 1.12.1 |
| 1.3 | Oct 2024 | Complete rewrite with Graph API, SPFx 1.20.1, Fluent UI |
| 1.4 | Mar 2025 | Feature-complete version with metadata preservation, multi-language support, email integration, and more |

## For Developers

### Required Permissions

The extension requires these Microsoft Graph API permissions:
- Files.ReadWrite
- Sites.ReadWrite.All
- Mail.Send (for email features)

### Debug URL

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"ea401ac9-3abc-4e27-b93b-09c9a0587ee9":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar","properties":{}}}
```

### Technical Implementation

- Utilizes SPFx Command Set Extensions
- Leverages Microsoft Graph API for file operations
- React components with Fluent UI
- TypeScript for type safety
- Responsive design principles

## Solution 

| Solution | Author(s) |
|----------|-----------|
| pnp-ext-pdf-convert | Mikael Svenson ([@mikaelsvenson](https://twitter.com/mikaelsvenson)) |
| pnp-ext-pdf-convert | Nicolas Kheirallah ([@NicolasKheirallah](https://twitter.com/NicolasKheirallah)) |

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

![](https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-command-convert-to-pdf)