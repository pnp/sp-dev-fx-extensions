# Get a direct link to a document or folder

## Summary

Sample SharePoint Framework (SPFx) solution which gives the end-user the ability to just get a regular, simple link to a document or folder in the modern SharePoint document libraries. This is done using a CommandSet.

![Image of the Prototype](https://jonasbjerke.files.wordpress.com/2019/01/copydirectlink.png?w=450)

## SharePoint Framework version

![SPFx v1.7.1](https://img.shields.io/badge/SPFx-1.7.1-green.svg)

## Applies to

* [SharePoint Framework Extensions Developer](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Office 365 developer tenant](http://dev.office.com/sharepoint/docs/spfx/set-up-your-developer-tenant)
* Office 365 tenant on a site collection with the modern user interface

## Solution

Solution|Author(s)
--------|---------
react-command-direct-link|Jonas Bjerke Hansen, [JonasBjerke.wordpress.com](https://jonasbjerke.wordpress.com), [@jbjerkehansen](https://twitter.com/jbjerkehansen))

## Version history

Version|Date|Comments
-------|----|--------
1.0.0|Januar 6, 2019|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Prerequisites

* Office 365 tenant with a modern site collection and a document library

## Minimal Path to Awesome

* clone this repo
* in the command line run
  * `npm i`
  * `gulp serve --nobrowser`
* open a document library in a modern site
* append the following query string parameters to the page URL

```text
?loadSpfx=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"7f6fdb10-39dc-402a-a99f-0ba942b19614":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}}
```

## Features

The solution is built with:
* A SPFx Extension (v.1.7.1) with tenant wide deployment option
* A React component inside an Extension
* Additional Office UI Fabric Components, such as Icon, TextField, Button and Callout to ensure a consistent UX
* CSS animations on the CheckMark icon
* Copy to clipboard functionality using JavaScript

For a more detailed walkthrough, please visit this [blogpost](https://jonasbjerke.wordpress.com/2019/01/06/extending-sharepoint-let-users-get-a-regular-link-to-a-document-or-folder/).

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/react-command-direct-link" />
