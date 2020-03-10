---
page_type: sample
products:
- office-sp
languages:
- javascript
- typescript
extensions:
  contentType: samples
  technologies:
  - SharePoint Framework
  platforms:
  - react
  createdDate: Mar 03 2020
---
# Document Preview ListView Command Set

## Summary
> This extension will create a command menu named '**_Smart View_**' to view the preview of the images, videos and documents in a side panel without navigating to a new page. Following are the file types supported.

* Videos with .mp4 format is supported
* Images with the following extensions are supported
    * png
    * jpg
    * jpeg
    * gif
* Document with the following extensions are supported
    * doc
    * docx
    * xls
    * xlsx
    * ppt
    * pptx
    * csv
    * pdf - based on the browser compatibility
* Other document types with the following extensions are also supported
    * js
    * txt
    * pdf
    * css

## Preview
![Document-Preview](./assets/Document-Preview.gif)

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/version-GA-green.svg)

## Applies to

* [SharePoint Framework](https:/dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Prerequisites
 
> **@microsoft/generator-sharepoint - 1.10.0**

## Solution

Solution|Author(s)
--------|---------
react-command-document-preview | Sudharsan K.([@sudharsank](https://twitter.com/sudharsank), [Know More](http://windowssharepointserver.blogspot.com/))

## Version history

Version|Date|Comments
-------|----|--------
1.0.0.0|Mar 03 2020|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - `gulp bundle --ship && gulp package-solution --ship`
- Add the .sppkg file to the app catalog and add the **Page Comments** web part to the page.
