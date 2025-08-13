# Print List Item Command View Set

## Summary

This sample shows how you can print list items using different templates, site admin can add, edit or remove templates and users can print items based on those templates.

![react-command-print](./assets/screenshot.gif)

## Compatibility

![SPFx 1.16.1](https://img.shields.io/badge/version-1.16.1-green.svg)
![Node.js 14.x](https://img.shields.io/badge/Node.js-14.x-green.svg)
![SharePoint Online](https://img.shields.io/badge/SharePoint-Online-yellow.svg)
![Workbench Hosted: Does not work with local workbench](https://img.shields.io/badge/Workbench-Hosted-yellow.svg "Does not work with local workbench")

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Solution

Solution|Author(s)
--------|---------
react-command-print | Ramin Ahmadi
react-command-print | Ari Gunawan ([@arigunawan3023](https://twitter.com/arigunawan3023))
react-command-print | Nishkalank Bezawada ([@im_nishkalank](https://twitter.com/im_nishkalank))

## Version history

Version|Date|Comments
-------|----|--------
1.0|Dec 05, 2018|Initial release
1.1|May 02, 2021|Replace typestyle with mergeStyles (Ari Gunawan)
1.2|October 30, 2024|Upgraded to SPFx v1.16.1 (Nishkalank Bezawada)

## Minimal Path to Awesome

- Clone this repository
- Create the "Print Settings List" list with below columns
  - ListId: Single line of text
  - Header: Multiline of text
  - Footer: Multiline of text
  - Columns: Multiline of text
  - HeaderAdvancedMode: Yes/No
  - FooterAdvancedMode: Yes/No
  - SkipBlankColumns: Yes/No
- In the command line run:
  - `npm install`
  - update _serve.json_ pointing to your site collection home page
  - `gulp serve`

## Features

This sample illustrates the following concepts on top of the SharePoint Framework:

* Add/Update/Remove print templates
* Customizable header and footer
* Ignore blank columns
* Grouping columns by adding sections

Next version features:

* Send the template to emails.
* Convert to PDF.
* Print multiple items.

## Debug URL for testing

Here's a debug URL for testing around this sample. **Updated based on your manifest id for easy testing of the sample**.

```
?debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"83a96197-2c0f-4966-8532-de37b0624ef0":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar","properties":{}}} 
```

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**


<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-command-print" />
