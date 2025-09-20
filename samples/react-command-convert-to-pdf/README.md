# Save and convert as PDF by PnP

## Summary

A global list customizer which adds functionality to all document libraries in SharePoint Online to convert one or more documents in-place to PDF, or download one or more documents as a PDF. When selecting multiple documents for download they will be downloaded as a zip file. The converter uses built in API's of converting to PDF.

![preview](./screenshot.gif "Preview")

## Compatibility

![SPFx 1.21.1](https://img.shields.io/badge/spfx-1.10.0-green.svg) 
![Node.js LTS 18.x | LTS 8.x](https://img.shields.io/badge/Node.js-LTS%206.x%20%7C%20LTS%208.x-green.svg)
![SharePoint Online](https://img.shields.io/badge/SharePoint-Online-red.svg)
![Workbench Hosted: Does not work with local workbench](https://img.shields.io/badge/Workbench-Hosted-yellow.svg "Does not work with local workbench")

## Applies to

* [SharePoint Framework Extensions](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/overview-extensions)

## Solution

Solution|Author(s)
--------|---------
pnp-ext-pdf-convert| Mikael Svenson ([@mikaelsvenson](https://twitter.com/mikaelsvenson))

## Version history

Version|Date|Comments
-------|----|--------
1.0| 2019| Initial release by Puzzlepart
1.1| February 23, 2021| Moved and re-branded to PnP
1.2| October 30, 2022| Upgrade SPFx to version 1.12.1
1.3| October 21, 2024| Upgrade SPFx to version 1.20.1, rewrite it from scratch using Graph API and using the built in converter in Graph, moved to Fluent UI and alot more
1.4| September 03 2025| Added batch operations, progress indicators, multi-language support (EN/FR/ES/DE), ZIP downloads, enhanced error handling

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Installing the solution

- Upload and Deploy the file [pnp-ext-pdf-convert.sppkg](./pnp-ext-pdf-convert.sppkg) to your tenant app catalog. ![TrustSolution](./screenshot-2.png "Trust solution")
    * If created the tenant app catalog can be reached via `https://<tenant>-admin.sharepoint.com/_layouts/15/online/ManageAppCatalog.aspx`.
    * You need to be a SharePoint Administrator to upload this solution.
- Navigate to a document library and select one or more files and you should see the PDF options in the document ribbon.

_Note: It may take a little while before it shows the first time after install._

## Features

### 🔄 Batch Operations
- **Multi-file Selection**: Select multiple documents using Ctrl+Click or Shift+Click
- **Batch Download**: Download multiple files as PDFs in a single ZIP archive
- **Batch Convert**: Convert multiple files to PDF and save them in the same library
- **Smart Validation**: Automatically filters out unsupported file types

### 📊 Progress Tracking
- **Real-time Progress Bar**: Visual progress indicator for batch operations
- **File Status Updates**: See which file is currently being processed
- **Success/Error Indicators**: Clear visual feedback for each file's conversion status
- **Summary Reports**: Detailed completion reports with success and error counts

### 🌐 Multi-language Support
- **English (en-us)**: Default language
- **French (fr-fr)**: Français
- **Spanish (es-es)**: Español  
- **German (de-de)**: Deutsch
- **Dynamic UI**: Command titles update based on selection count

### 💾 Enhanced Downloads
- **ZIP Archives**: Multiple files automatically packaged with timestamp
- **Smart Naming**: Original filenames preserved with .pdf extension
- **Error Recovery**: Failed conversions don't interrupt the batch process

## Supported file formats

csv, doc, docx, odp, ods, odt, pot, potm, potx, pps, ppsx, ppsxm, ppt, pptm, pptx, rtf, xls, xlsx, html

## Debug URL for testing

Here's a debug URL for testing around this sample.

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"ea401ac9-3abc-4e27-b93b-09c9a0587ee9":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar","properties":{}}}
```

![](https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-command-convert-to-pdf)
