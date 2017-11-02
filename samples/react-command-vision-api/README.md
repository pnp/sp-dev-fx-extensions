# Image Metadata from Cognitive Services Vision API List View Command Set

## Summary
Custom Command Set that gets metadata information from MS Cognitive Services Vision API for the selected Image

![Custom Command Set that gets metadata information from MS Cognitive Services Vision API for the selected Image](./assets/react-command-vision-api.png)

## Used SharePoint Framework Version

![SPFx v1.3.4](https://img.shields.io/badge/SPFx-1.3.4-green.svg)

## Applies to

* [SharePoint Framework Extensions Developer Preview](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Office 365 developer tenant](http://dev.office.com/sharepoint/docs/spfx/set-up-your-developer-tenant)

## Solution

Solution|Author(s)
--------|---------
react-command-vision-api|Luis Mañez (MVP, [ClearPeople](http://www.clearpeople.com), @luismanez)

## Version history

Version|Date|Comments
-------|----|--------
1.0.0|September 30, 2017|Initial release
2.0.0|November 11, 2017|Storing API Key as Tenant property. Image model. React custom Dialog component

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Prerequisites

* Office 365 Developer tenant First Release (this sample uses [sfpx Tenant Properties](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/tenant-properties))
* Library with Images
* Cognitive Services Vision API Key (more info [https://azure.microsoft.com/en-us/services/cognitive-services/](https://azure.microsoft.com/en-us/services/cognitive-services/))

## Minimal Path to Awesome

* register a Cognitive Services Vision API in your Azure subscription
* ensure your tenant is configured as "First Release"
* install latest PowerShell SharePoint Online commands
* configure a Tenant Property called "VisionAPIKey" with the API Key value:

```ps
Connect-SPOService -Url https://yourtenant-admin.sharepoint.com

Set-SPOStorageEntity -Site "https://yourtenant.sharepoint.com/sites/appcatalog" -Key "VisionAPIKey" -value YOUR_API_KEY_VALUE -Description "Key to use Vision API" -Comments "spfx demo"
```

To ensure the Property has been added, you can run:

```ps
Get-SPOStorageEntity -Site "https://yourtenant.sharepoint.com/sites/appcatalog" -Key "VisionAPIKey"
```

* clone this repo

* in the command line run
  * `npm i`
  * `gulp serve-info --nobrowser`
* copy the list view command set debug query string parameters:

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"e109ab75-a728-418c-85c6-7430363e348d":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```
* in the web browser
  * navigate to the library with images (**note**: command only works with images. You will get an error if you try the command with any other file)
  * to the URL of the list add the previously copied debug query string parameters

## Features

Sample SharePoint Framework list view command set calling the Cognitive Services Vision API and showing the information extracted from the Image.

This sample illustrates the following concepts on top of the SharePoint Framework:

* using Vision API to get the image Tags
* how to get the download url of the selected file
* using async / await for the async calls
* get a tenant property using SP REST API (**_api/web/GetStorageEntity('key')**)
* custom Dialog component

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-command-vision-api" />
