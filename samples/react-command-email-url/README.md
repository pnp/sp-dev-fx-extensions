## react-command-email-url

In SharePoint there used to be a 'copy shortcut' option in the right-click menu on a document. This featrue is not avilable currently. Now we need to go to the share sub-menu to get a link to the document, but what is offered there is the docidredir link, not the full path.

This SPFx extension opens a dialog where the user can see the document full path. The Email Link button helps the user to share the link via default email client.

![react-command-email-url](./assets/Snip20170622_2.png)
![react-command-email-url](./assets/Snip20170622_3.png)
![react-command-email-url](./assets/Snip20170622_6.png)

## Used SharePoint Framework Version 
SPFx Extensions Dev Preview

## Applies to

* [SharePoint Framework](http://dev.office.com/sharepoint/docs/spfx/sharepoint-framework-overview)
* [Office 365 developer tenant](http://dev.office.com/sharepoint/docs/spfx/set-up-your-developer-tenant)

Solution|Author(s)
--------|---------
react-command-email-url|Joseph Velliah (SPRIDER, @sprider)

## Version history

Version|Date|Comments
-------|----|--------
1.0|June 12, 2017|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

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
?loadSpfx=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"0af576ed-1e72-4602-bea9-543c60f5fa09":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```
Full URL to request would be something like following:

```
https://tenant.sharepoint.com/Shared%20Documents/Forms/AllItems.aspx?loadSpfx=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"0af576ed-1e72-4602-bea9-543c60f5fa09":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```

## Features
This project contains SharePoint Framework extensions that illustrates next features:
* Command extension
* Office UI Fabric React

> Notice. This sample is designed to be used in debug mode and does not contain automatic packaging setup for the "production" deployment.

### Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

