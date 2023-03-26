---
page_type: sample
products:
- office-sp
languages:
- javascript
- typescript
extensions:
  contentType: samples
  technologies:
  - SharePoint Framework
  platforms:
  - react
  createdDate: 8/1/2017 12:00:00 AM
---
# React Custom Command Bar Command Set Customizer

## Summary
The sample illustrates how to display custom Command Bar when Command Set Button is pressed.

![React Slider Field Customizer](./assets/command-bar.png)

## Used SharePoint Framework Version 
SPFx Extensions RC0

## Applies to

* [SharePoint Framework](http://dev.office.com/sharepoint/docs/spfx/sharepoint-framework-overview)

Solution|Author(s)
--------|---------
react-command-custom-command-bar | Alex Terentiev ([Sharepointalist Inc.](http://www.sharepointalist.com), [AJIXuMuK](https://github.com/AJIXuMuK))

## Version history

Version|Date|Comments
-------|----|--------
1.0|July 25, 2017|Initial release
1.1|August 29, 2017|Update to RC0

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Features
This project contains SharePoint Framework extensions that illustrates next features:
* command set customizer
* usage of Office UI Fabric React
* rendering custom Office UI Fabric command bar items
* rendering custom Office UI Fabric Button icons

## Building and debugging the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp server --nobrowser
```

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

On your SharePoint tenant:

* go to any modern page or modern list/document library and add next query string to the url:
```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"811872a6-3a3b-4e58-8dca-c54c6cf4f9b6":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```

![](https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-command-custom-command-bar)
