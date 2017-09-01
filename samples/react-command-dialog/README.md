# Custom Dialog Sample with Command View Set

## Summary
This sample shows how to create Custom Dialogs using `@microsoft/sp-dialog` package in the context of Command View Set. You can use also custom dialogs with client-side web parts or with any SharePoint Framework component types.

This sample shows how to build a custom dialog using Office UI Fabric React components and then show that in the UI of dialog. 

![react-command-dialog](./assets/screenshot.png)

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/version-1.2-green.svg)

## Applies to

* [SharePoint Framework](http://dev.office.com/sharepoint/docs/spfx/sharepoint-framework-overview)
* [Office 365 tenant](http://dev.office.com/sharepoint/docs/spfx/set-up-your-developer-tenant)

## Solution

Solution|Author(s)
--------|---------
React-Command-Dialog | Microsoft

## Version history

Version|Date|Comments
-------|----|--------
1.0|June 27, 2017|Initial version
1.1|September 1, 2017|Updated with v1.2 framework

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Move to folder where this readme exists
- In the command window run:
  - `npm install`
  - `gulp serve --nobrowser`
- Use following query parameter in the SharePoint site to get extension loaded without installing it to app catalog

## Debug URL for testing
Here's a debug URL for testing around this sample. 

```
?loadSpfx=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"64f3b86a-e6f4-4ae9-9bd9-0c0d0b0afaba":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```
Full URL to request would be something like following:

```
contoso.sharepoint.com/Lists/Orders/AllItems.aspx?loadSpfx=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"64f3b86a-e6f4-4ae9-9bd9-0c0d0b0afaba":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```

## Features
This project contains SharePoint Framework extensions that illustrates next features:
* Command extension
* Custom dialog control using `@microsoft/sp-dialog` package

> Notice. This sample is designed to be used in debug mode and does not contain automatic packaging setup for the "production" deployment.

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/react-command-dialog" />
