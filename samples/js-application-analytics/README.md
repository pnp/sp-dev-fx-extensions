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

## Compatibility

![SPFx 1.11](https://img.shields.io/badge/SPFx-1.11.0-green.svg) 
![Node.js LTS 10.x](https://img.shields.io/badge/Node.js-LTS%2010.x-green.svg) ![SharePoint Online](https://img.shields.io/badge/SharePoint-Online-yellow.svg)
![Workbench Hosted: Does not work with local workbench](https://img.shields.io/badge/Workbench-Hosted-yellow.svg "Does not work with local workbench")

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Solution

Solution|Author(s)
--------|---------
js-application-analytics | [Giuliano De Luca](https://github.com/giuleon) ([@giuleon](https://twitter.com/giuleon) , [www.delucagiuliano.com](http://www.delucagiuliano.com))
js-application-analytics | [Hugo Bernier](https://github.com/hugoabernier) ([@bernierh](https://twitter.com/bernierh) , [tahoeninjas.blog](https://tahoeninjas.blog))
js-application-analytics | [João Ferreira](https://github.com/joaoferreira) ([@joao12ferreira](https://twitter.com/joao12ferreira) , [HANDS ON tek](https://sharepoint.handsontek.net))

## Version history

Version|Date|Comments
-------|----|--------
1.0|June 09, 2017|Initial release
1.1|September 29, 2017|Updated for SPFx GA 1.3.0
1.2|October 7, 2020|Refactored for SPFx 1.11; Added support for async/legacy modes
1.3|July 1, 2021|Added support for Google Analytics V4

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

If your organization is using Google Analytics V4 you must change the extension's configuration from:

```json
"googleAnalyticsV4": false
```
to:
```json
"googleAnalyticsV4": true
```


## Debug URL for testing

Here's a debug URL for testing around this sample.

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"46050d9b-6925-42e5-812a-c5218d6c85ae":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"trackingId":"UA-100713841-5","disableAsync":true,"googleAnalyticsV4":true}}}
```

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Help

We do not support samples, but we this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=js-application-analytics&authors=@giuleon%20@hugoabernier%20@joaoferreira&title=js-application-analytics%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=question.yml&sample=js-application-analytics&authors=@giuleon%20@hugoabernier%20@joaoferreira&title=js-application-analytics%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=suggestion.yml&sample=js-application-analytics&authors=@giuleon%20@hugoabernier%20@joaoferreira&title=js-application-analytics%20-%20).



<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-application-analytics" />
