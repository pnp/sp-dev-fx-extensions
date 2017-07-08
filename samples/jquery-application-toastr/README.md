# SPFx Toastr

## Summary
Short summary on functionality and used technologies.

[picture of the extension in action, if possible]

## Used SharePoint Framework Version 
![1.1.1](https://img.shields.io/badge/version-1.1.1-orange.svg)

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Office 365 Developer tenant](http://dev.office.com/sharepoint/docs/spfx/set-up-your-developer-tenant)
* [Toastr](http://codeseven.github.io/toastr/)

## Prerequisites
 
* Office 365 Developer tenant

## Solution

Solution|Author(s)
--------|---------
jquery-application-toastr | Chris Kent ([thechriskent.com](https://thechriskent.com), [@thechriskent](https://twitter.com/thechriskent))

## Version history

Version|Date|Comments
-------|----|--------
1.0|July 8, 2017|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- In the command line run:
  - `npm install`
  - `gulp serve-info --nobrowser`
- Copy the application customizer debug query string from the console output _(or adapt the one below)_
- In a web browser
  - Navigate to a modern site, or a modern view on a classic site
  - Follow one of the steps below for **List Deployment**
  - Add the previously copied debug querystring to the URL
  - Choose Allow Debug Manifests when prompted

### List Deployment

## Features
Description of the extension with possible additional details than in short summary.
This extension illustrates the following concepts:

- topic 1
- topic 2
- topic 3

## Debug URL for testing
Here's a debug URL for testing around this sample:

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"a861c815-e425-416d-9520-04bcdf557e27":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{}}}
```

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/jquery-application-toastr" />