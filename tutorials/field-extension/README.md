# Custom percent value presentation using a field customizer

## Summary
This is reference solution around the Field Customizer which is built using the SharePoint Framework tutorials available from [dev.office.com/sharepoint](http://dev.office.com/sharepoint). 

* [Getting started with SharePoint Framework Extensions](http://aka.ms/spfx-extensions)

![picture of the extension in action, if possible](./assets/screenshot.png)


## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/version-1.1.1-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Prerequisites
 
During developer preview, SPFx Extensions only work in developer tenants. You can get dev tenant by joining on the [Office 365 Dev Program](https://dev.office.com/devprogram).

## Solution

Solution|Author(s)
--------|---------
Field-Extension | Vesa Juvonen, Microsoft

## Version history

Version|Date|Comments
-------|----|--------
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
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&fieldCustomizers={"Percent":{"id":"49ecc6e9-10b5-4bd0-90a5-eae0b8e0cd7c","properties":{"sampleText":"Hello!"}}}
```
Full URL to request would be something like following:

```
contoso.sharepoint.com/Lists/Contoso/AllItems.aspx?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&fieldCustomizers={"Percent":{"id":"49ecc6e9-10b5-4bd0-90a5-eae0b8e0cd7c","properties":{"sampleText":"Hello!"}}}
```

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/tutorials/field-extension" />