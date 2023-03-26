# Add Folders Command

## Summary

Sample SharePoint Framework list view command set extension to create folders that can be all at the current location (parallel) or nested (one after another).

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
react-list-addfolders | Michaël Maillot ([@michael_maillot](https://twitter.com/michael_maillot))

## Version history

Version|Date|Comments
-------|----|--------
1.0|January 17, 2021|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Update the `pageUrl` properties in the **config/serve.json** file
  - The `pageUrl` should be a modern page
  - This property is only used during development in conjunction with the `gulp serve` command
- In the command line navigate to the `react-command-addfolders` folder and run:
  - `npm install`
  - `gulp serve`
- If you have `spfx-fast-serve` already installed, run `npm run serve` instead of `gulp serve`

## Features

This extension illustrates the following concepts:

- Adding folders nested or not (batching process if not)
- Working on both libraries and lists
- Checking permissions and enable folder creation option
- Checking folder name regarding SharePoint / OneDrive specs
- Including a disposable Coachmark for guidance
- Available in English and French
- Developing the sample using React Hooks, Fluent UI and [spfx-fast-serve](https://github.com/s-KaiNet/spfx-fast-serve)

## Debug URL for testing

Here's a debug URL for testing around this sample.

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"5c2a88cb-baf3-4e91-bfc2-4c6add795219":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-command-addfolders" />
