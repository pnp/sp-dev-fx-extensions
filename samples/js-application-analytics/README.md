# Google Analytics Application Customizer

## Summary
In this sample is possible to see how to implement Google Analytics through SPFx Extensions Application Customizers

![Google Analytics Application Customizer](./assets/js-application-google-analytics.gif)

## Used SharePoint Framework Version 
![1.3.0](https://img.shields.io/badge/version-1.3.0-green.svg)

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Solution

Solution|Author(s)
--------|---------
js-application-analytics | Giuliano De Luca ([@giuleon](https://twitter.com/giuleon) , [www.delucagiuliano.com](http://www.delucagiuliano.com))

## Version history

Version|Date|Comments
-------|----|--------
1.0|June 09, 2017|Initial release
1.1|September 29, 2017|Updated for SPFx GA 1.3.0

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Update the `pageUrl` properties in the **config/serve.json** file
  - The `pageUrl` should be a modern page
  - This property is only used during development in conjunction with the `gulp serve` command
- in the command line run:
  - `npm install`

## Features
This sample illustrates how to levereage the SharePoint Framework Extensions Applciation Customizer to analyze the usage through Google Analytics of a SharePoint site:

- Application Customizer
- Google Analytics

Don't forget to insert your Google Analytics tracking code something like that 'UA-100713841-5'

## Debug URL for testing
Here's a debug URL for testing around this sample. 

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"e8613642-17ee-4392-a8fd-5c0d6edcdb19":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"testMessage":"Hello as property!"}}}
```

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-application-analytics" />