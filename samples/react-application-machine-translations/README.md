# Machine Translations Extension

## Summary

This application customizer lets you translate the text on a SharePoint page using the [Translator Text API](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/) of Microsoft Azure. 

The extension will determine the language of the page using the page description. A drop-down is provided with available languages (that are configurable). All content inside Text Web parts will be translated to the specified language

![](./assets/sample.gif)

## Compatibility

![SPFx 1.12.1](https://img.shields.io/badge/SPFx-1.12.1-green.svg)

![Node.js LTS v14 | LTS v12 | LTS v10](https://img.shields.io/badge/Node.js-LTS%20v14%20%7C%20LTS%20v12%20%7C%20LTS%20v10-green.svg) 

![SharePoint Online](https://img.shields.io/badge/SharePoint-Online-red.svg)

![Workbench Hosted](https://img.shields.io/badge/Workbench-Hosted-yellow.svg)


## Applies to

* [SharePoint Framework](https://docs.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
* [Microsoft 365 tenant](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)


## Prerequisites

To make this sample work, you will need a valid API key for the Translator Text API. [These](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/translator-text-how-to-signup) instructions can help to set-up the Azure resource and obtain the API key. Each subscription has 1 free tier available which lets you translate 2M characters per month.

## Solution

Solution|Author(s)
--------|---------
react-application-machine-translations | [Robin Agten](https://twitter.com/AgtenRobin)
react-application-machine-translations | [Michal Romiszewski](https://twitter.com/romiszewski) -- Update

## Version history

Version|Date|Comments
-------|----|--------
1.1|July 23, 2020|Update TranslationService, SPFx to 1.12.1 and PnPjs to 2.7.0
1.0|March 28, 2020|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - `gulp serve --nobrowser`
- Open your SharePoint developer site and append the provided debug url (see later on)


## Features

This extension illustrates the following concepts:

- Configurable available languages
- Uses Microsoft Azure Translator Text API
- Uses [PnPjs 2.7.0](https://pnp.github.io/pnpjs/) to get page web parts

## Debug URL for testing

Here's a debug URL for testing around this sample (global translator resource).

```
?debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"aa40cc51-6498-4c01-91d4-b5f8d2fe1e8b":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"supportedLanguages":["en","nl","fr"],"translatorApiKey":"_TRANSLATOR_API_KEY_"}}}
```
 - Replace \_TRANSLATOR_API_KEY_ with your API key
 - Update the supportedLanguages list with languages that you want to expose. A full list of supported languages can be found [here](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/language-support)

Here's a debug URL for testing around this sample (regional translator resource).

```
?debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"aa40cc51-6498-4c01-91d4-b5f8d2fe1e8b":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"supportedLanguages":["en","nl","fr"],"translatorApiKey":"_TRANSLATOR_API_KEY_","translatorApiRegion":"_TRANSLATOR_API_REGION_"}}}
```
- Replace \_TRANSLATOR_API_REGION_ with the region of the translator resource eg.: "westeurope", "eastus", "eastasia" etc.

![](./assets/azure_translator_service.png)

 ## Package and deploy

  - Update the following properties in the `elements.xml` and `ClientSideInstance.xml` file under `sharepoint/assets` (See debug url for more info):
    - supportedLanguages
    - translatorApiKey
    - (optional) translatorApiRegion
  - Run `gulp bundle --ship`
  - Run `gulp package-solution --ship`
  - Upload the `machine-translation-extension.sppkg` file under `sharepoint/solution` to the app catalog of your tenant


<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/react-application-machine-translations" />
