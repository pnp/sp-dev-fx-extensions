# React Application Intranet Search Box

## Summary
This demonstrates how to use an SPFx Application Customiser to inject an additional search box into the header of each page, which uses the "Search Settings" (at either the Site Collection or Sub-Site level) to determine the redirect page.

This allows you to provide an integrated and branded search box to send users to a "classic" Search Center, or custom page, rather than the OOTB "modern search" page.  

!(assets/IntranetSearchBox.gif)

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/version-GA-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)


## Solution

Solution|Author(s)
--------|---------
js-application-intranet-searchbox | Martin Hatch (@martinhatch | https://martinhatch.com)

## Version history

Version|Date|Comments
-------|----|--------
1.0|16th May 2019|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - `gulp serve`

## Features
This example includes an SPFx "Application Customiser" extension using placeholders to inject content into the page header.

This also makes use of:

- Use of localised strings for multi-lingual support
- Use of compiled SCSS modules for branding and setting dynamic identifiers in JS code
- SP Fabric Core - For using theme colour "variables" in SCSS styles
- SPHttpClient library to retrieve search settings for the site it is running on

## Debug URL for testing
Here's a sample debug URL for easy testing of this sample. 

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"41033513-c4ad-4a2b-939f-176213702ae6":{"location":"ClientSideExtension.ApplicationCustomizer"}}
```