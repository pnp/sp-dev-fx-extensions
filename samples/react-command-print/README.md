# Print List Item Command View Set

## Summary
This sample shows how you can print list items using different templates, site admin can add, edit or remove templates and users can print items based on those templates.

![react-command-print](./assets/screenshot.gif)

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/version-1.7-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Solution

Solution|Author(s)
--------|---------
react-command-print | Ramin Ahmadi

## Version history

Version|Date|Comments
-------|----|--------
1.0|Dec 05, 2018|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
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
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"83a96197-2c0f-4966-8532-de37b0624ef0":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"testMessage":"Hello as property!"}}}
```

> Notice that better pictures and documentation will increase the sample usage and the value you are providing for others. Thanks for your submissions advance.

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/react-command-print" />
