# SPFx Clone ListView Command Set

## Summary
Sample SharePoint Framework listview command set extension that allows users to clone one or more list items. Demonstrates conditional visibility, PnP JS Core requests, PnP JS Core Batching, and field specific formats for rest operations.

![Cloning of list items](./assets/spfxClone-Animation.gif)

## Used SharePoint Framework Version 
![1.3.0](https://img.shields.io/badge/version-1.3.0-green.svg)

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [PnP JavaScript Core](https://github.com/SharePoint/PnP-JS-Core)


## Solution

Solution|Author(s)
--------|---------
js-command-clone | Chris Kent ([thechriskent.com](https://thechriskent.com), [@thechriskent](https://twitter.com/thechriskent))

## Version history

Version|Date|Comments
-------|----|--------
1.0|August 30, 2017|Initial release
1.1|September 26, 2017|Updated for SPFx Extensions GA 1.3.0

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- In the command line navigate to **samples/js-command-clone** and run:
  - `npm install`
  - `gulp serve --nobrowser`
- Adapt the listview command set debug query string from the one below
- In a web browser
  - Navigate to a modern list view on a classic site
  - Add the previously copied debug querystring to the URL
  - Choose **Load Debug Scripts** when prompted
  - Select 1 or more items and choose clone from either the command bar or the context menu
  - Behold the marvels of science

## Features
SPFx Clone utilizes PnP JS Core to quickly copy multiple list items.

This extension illustrates the following concepts:

- Loading **PnP JS Core** from a CDN
- Conditionally showing commands based on the **number of selected rows**
- Conditionally showing commands based on the **user's permission level**
- Requesting **List Field** information
- **Batching Get requests** for list items
- **Field selection** and **Expanded fields** using PnP JS Core
- Adding multiple items in a single **Batch**
- Field specific formats for REST operations including
  - Person
  - Multi Persons
  - Lookups
  - Multi Lookups
  - Multi Choice
  - Projected Fields
  - Taxonomy Fields
  - Multi Taxonomy Fields
  - And all other standard fields


## Debug URL for testing
Here's a debug querystring for testing this sample:

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"bf6645bd-42e4-4a30-aad7-6ff12d61fa1f":{"location":"ClientSideExtension.ListViewCommandSet"}}
```

Your URL will look similar to the following (replace with your domain and site address):
```
https://yourtenant.sharepoint.com/sites/yoursite/Lists/yourlist/AllItems.aspx?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"bf6645bd-42e4-4a30-aad7-6ff12d61fa1f":{"location":"ClientSideExtension.ListViewCommandSet"}}
```

## Let's Get Cloning!

![Dolly n Dolly](./assets/spfxClone-Preview.png)

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-command-clone" />