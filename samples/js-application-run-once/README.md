# Run Once SharePoint Framework application customizer

## Summary

Sample SharePoint Framework application customizer showing how you can run code once, and then remove the customizer at the end. The code as-is expects to be installed as a site scoped custom action.

## Used SharePoint Framework Version

![SPFx v1.3.0](https://img.shields.io/badge/SPFx-1.3.0-green.svg)

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)

## Solution

Solution|Author(s)
--------|---------
js-application-run-once|Mikael Svenson (MVP, [Puzzlepart](https://puzzlepart.com), @mikaelsvenson)

## Version history

Version|Date|Comments
-------|----|--------
1.0.0|October 10, 2017|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - `gulp serve --nobrowser`

When debugging, the customizer won't be removed, as it's not installed - but you can trace the code to see how it works. I order to test properly, you need to package and deploy the customizer and add it to a site collection.


## Features
This extension checks if the person logged in is a site administrator, and if so runs some logic. At the end it removes the custom action from the site.

## Debug URL for testing
The debug URL will be written in the console once running `gulp serve --nobrowser`
Here's a debug URL for testing around this sample. 

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"205392f2-f511-49b0-a698-a976a8f8028a":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"property":"this is data"}}}
```

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-application-run-once" />