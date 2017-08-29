# Custom ListView Command Set with Dialog capability

## Summary
This is reference solution around the ListView Command Set extensions which is built using the SharePoint Framework tutorials available from [dev.office.com/sharepoint](http://dev.office.com/sharepoint). Tutorial also shows how to use Dialogs with the toolbar buttons.

* [Getting started with SharePoint Framework Extensions](http://aka.ms/spfx-extensions)

![picture of the extension in action, if possible](./assets/screenshot.png)


## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/version-1.2.0-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Prerequisites
 
During Release Candidate (RC) status, SPFx Extensions only work in first release or dev tenants. You can get a dev tenant free by joining on the [Office 365 Dev Program](https://dev.office.com/devprogram).


## Solution

Solution|Author(s)
--------|---------
Command-Extension | Vesa Juvonen, Microsoft

## Version history

Version|Date|Comments
-------|----|--------
1.1|August 29, 2017|Updated to Release Candidate version
1.0|June 6, 2017|Initial release

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

```
?loadSpfx=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"f482fa3c-0720-4936-a0dd-6e6941ef8945":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```
Full URL to request would be something like following:

```
contoso.sharepoint.com/Lists/Orders/AllItems.aspx?loadSpfx=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"f482fa3c-0720-4936-a0dd-6e6941ef8945":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/tutorials/command-extension" />
