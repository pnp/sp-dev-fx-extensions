# Site Header Toggler

## Summary

With the Modern Pages, majority of the screen's viewport is occupied by the Suite Bar and Header, which doesnt show the actual content of any intranet site.

This application customizer adds a toggle button on all the Modern Pages which will toggle (show/hide) the Site Header, pulling the content to the top and giving more reading space for the users.
![react-command-print](./assets/screenshot.gif)

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/version-1.9.1-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Solution

Solution|Author(s)
--------|---------
js-application-header-toggler | [Ram Prasad Meenavalli](https://twitter.com/ram_meenavalli)

## Version history

Version|Date|Comments
-------|----|--------
1.0|Sep 19, 2019|Initial release

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

* Adding clickable elements in the application customizer placeholders
* Using the data attributes to hide certain elements on the modern page using CSS

## Debug URL for testing
Here's a debug URL for testing around this sample. **Updated based on your manifest id for easy testing of the sample**.

```
?debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"44d11daa-2628-4618-8f0b-0a6cdb71b040":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"testMessage":"Test message"}}}
```

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-application-header-toggler" />