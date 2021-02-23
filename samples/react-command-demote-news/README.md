# Demote News to page Command

## Summary

Sample SharePoint Framework list view command set extension to demote a previously promoted News page.

![preview](assets/preview.gif)

## Compatibility

![SPFx 1.11](https://img.shields.io/badge/spfx-1.11.0-green.svg) 
![Node.js LTS 10.x](https://img.shields.io/badge/Node.js-LTS%2010.x-green.svg) 
![SharePoint Online](https://img.shields.io/badge/SharePoint-Online-red.svg) 
![Workbench Hosted](https://img.shields.io/badge/Workbench-Hosted-yellow.svg)


## Applies to

* [SharePoint Framework Extensions](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/overview-extensions)

## Solution

Solution|Author(s)
--------|---------
pnp-demote-news| Mikael Svenson ([@mikaelsvenson](https://twitter.com/mikaelsvenson))

## Version history

Version|Date|Comments
-------|----|--------
1.0| February 22, 2021|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Update the `pageUrl` properties in the **config/serve.json** file
  - The `pageUrl` should be the URL of a Site Pages library
  - This property is only used during development in conjunction with the `gulp serve` command
- In the command line navigate to the `react-command-addfolders` folder and run:
  - `npm install`
  - `gulp serve`
- If you have `spfx-fast-serve` already installed, run `npm run serve` instead of `gulp serve`

## Features

This extension illustrates the following concepts:

- How to demote a previously promoted News page
- Available in English

## Debug URL for testing

Here's a debug URL for testing around this sample.
//https://techmikael.sharepoint.com/teams/comm3/SitePages/Forms/ByAuthor.aspx?debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fmanifests.js&loadSPFX=true&customActions=%7B%2224cdd3e2-07e4-4a93-becf-5f39071a8497%22%3A%7B%22location%22%3A%22ClientSideExtension.ListViewCommandSet.CommandBar%22%2C%22properties%22%3A%7B%7D%7D%7D
```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"24cdd3e2-07e4-4a93-becf-5f39071a8497":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar","properties":{}}
```

![](https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/react-command-demote-news)
