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
- In the command line navigate to the `react-command-demote-news` folder and run:
  - `npm install`
  - `gulp serve`
- If you have `spfx-fast-serve` already installed, run `npm run serve` instead of `gulp serve`

## More Complete Path to Awesome

The requirements to get the command in this repository up and running need care and attention. Prepare the device to be used as follows (Windows 10 VM recommended)
- Install Node.js LTS 10.x from https://nodejs.org/download/release/v10.24.1/.
- Install Python 2.7.18 (or later version of Python 2.7). Version 2.7.18 can be downloaded from https://www.python.org/downloads/release/python-2718/
- Install Chocolatey using the PowerShell command  
`Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))`
- Install the Visual C++ build tools using the command  
`choco install visualcpp-build-tools -y`
- Set the version for the build tools using the command  
`npm config set msvs_version 2017`
- Follow the instructions in the 'Minimal Path to Awesome' section above to clone the repository and install the package dependencies.
- Test in your environment

## Features

This extension illustrates the following concepts:

- How to demote a previously promoted News page
- Available in English

## Debug URL for testing

Here's a debug URL for testing around this sample.

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"24cdd3e2-07e4-4a93-becf-5f39071a8497":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar","properties":{}}
```

![](https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-command-demote-news)
