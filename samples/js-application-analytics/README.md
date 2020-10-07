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
  createdDate: 6/1/2017 12:00:00 AM
---
# Google Analytics Application Customizer

## Summary

This sample demonstrates how to implement Google Analytics in Modern SharePoint Pages through SPFx Extensions Application Customizers

![Google Analytics Application Customizer](./assets/js-application-google-analytics.gif)

## Used SharePoint Framework Version

![SPFx 1.11.0](https://img.shields.io/badge/version-1.11.0-green.svg)

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Solution

Solution|Author(s)
--------|---------
js-application-analytics | Giuliano De Luca ([@giuleon](https://twitter.com/giuleon) , [www.delucagiuliano.com](http://www.delucagiuliano.com))
js-application-analytics | Hugo Bernier ([@bernierh](https://twitter.com/bernierh) , [tahoeninjas.blog](https://tahoeninjas.blog))

## Version history

Version|Date|Comments
-------|----|--------
1.0|June 09, 2017|Initial release
1.1|September 29, 2017|Updated for SPFx GA 1.3.0
1.2|October 7, 2020|Refactored for SPFx 1.11; Added support for async/legacy modes

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- - In the command line run:
  - `npm install`
- Update the `pageUrl` properties in the **config/serve.json** file
  - The `pageUrl` should be a modern page
  - This property is only used during development in conjunction with the `gulp serve` command
- Update the `trackingId` property to your Google Analytics Tracking ID
- If you wish to support legacy browsers (or browsers that do not support the `async` attribute on `script` elements), change the `disableAsync` property to `true`
- Test the extension by typing:
    - `gulp serve`

## Features

This sample illustrates how to leverages the SharePoint Framework Extensions Application Customizer functionality to inject Google Analytics on a SharePoint site:

- Application Customizer
- Google Analytics

Don't forget to insert your Google Analytics tracking code something like that 'UA-100713841-5'

### Support for legacy browsers

The standard Google Analytics embedded tag ensures the analytics script will be loaded and executed asynchronously on all browsers. However, it has the disadvantage of not allowing modern browsers to preload the script.

This extension uses the Google Analytics alternative `async` tag method to add support for preloading, which will provide a small performance boost on modern browsers, but can degrade to synchronous loading and execution on IE 9 and older mobile browsers that do not recognize the async script attribute.

If your organization does not primarily use modern browsers to access your SharePoint tenant, you can default to the non-asynchronous script loading method by changing the extension's configuration from:

```json
"disableAsync": false
```
to:
```json
"disableAsync": true
```

Doing so will revert the Google Analytics embedded tag to the legacy method.

## Debug URL for testing

Here's a debug URL for testing around this sample.

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"46050d9b-6925-42e5-812a-c5218d6c85ae":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"trackingId":"UA-100713841-5","disableAsync":true}}}
```

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-application-analytics" />
