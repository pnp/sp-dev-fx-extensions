# News Ticker

## Summary

An SPFx Extension that displays news as a running text at the top of every modern page.

![News Ticker](./assets/react-application-news-ticker.gif)

## Compatibility

![SPFx 1.11](https://img.shields.io/badge/SPFx-1.11.0-green.svg)
![Node.js LTS 10.x](https://img.shields.io/badge/Node.js-LTS%2010.x-green.svg)
![SharePoint Online](https://img.shields.io/badge/SharePoint-Online-yellow.svg)
![Workbench Hosted: Does not work with local workbench](https://img.shields.io/badge/Workbench-Hosted-yellow.svg "Does not work with local workbench")

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

Create list as the data source for the app with below details:
1. List title: **News**
2. Required Columns: 
   - **Title**: single line text
   - **Content**: multiline text (plain text)
   - **PublishDate**: date
3. Required View:
   - Title: **Published News**
   - Configure the view as you like. The app will get the data based on the view. Below is the example:
      - Filter: PublishDate <= [TODAY] AND ExpiryDate > [TODAY]
      - Sort: PublishDate Ascending
      - Limit: 10

## Solution

Solution|Author(s)
--------|---------
react-application-news-ticker | Ari Gunawan ([@arigunawan3023](https://twitter.com/arigunawan3023))

## Version history

Version|Date|Comments
-------|----|--------
1.0|April 19, 2021|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

## Features

This extension illustrates the following concepts:

- Display news as a running text at the top of every modern page where the app installed
- Get news items from a SharePoint list view using PnPJS
- Stop the running text when user hover it

## References

- [SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [PnP JS](https://pnp.github.io/pnpjs/)
- [react-ticker](https://github.com/AndreasFaust/react-ticker)


## Debug URL for testing
Here's a debug URL for testing around this sample. 

```
?debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"4358e70e-ec3c-4713-beb6-39c88f7621d1":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"listTitle":"News","listViewTitle":"Published News"}}}
```

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/react-application-news-ticker" />
