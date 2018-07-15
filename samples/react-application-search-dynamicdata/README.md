## react-application-search-dynamicdata

This example shows how to connect Spfx extensions with Spfx Webparts using Dynamic Data Feature

![Web parts placed on a modern SharePoint page showing information about your search in extensions](./assets/samplepnpExtensions.gif)

An associated [blog post](http://blogs.encamina.com/desarrollandosobresharepoint/2018/07/03/spfx-dynamic-data-app-extension/) is available to give you more details about this sample implementation.

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/drop-1.5.0--plusbeta-blue.svg)

## Applies to

* [SharePoint Framework](http://dev.office.com/sharepoint/docs/spfx/sharepoint-framework-overview)
* [Office 365 developer tenant](http://dev.office.com/sharepoint/docs/spfx/set-up-your-developer-tenant)

## Solution

Solution|Author(s)
--------|---------
react-application-search-dynamicdata|Adrián Díaz (MVP, ENCAMINA, @AdrianDiaz81)

## Version history

Version|Date|Comments
-------|----|--------
1.0|July 15, 2018|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

* clone this repo
* move to right folder
* in the command line run:
  * `npm install`
  * `gulp bundle --ship`
  * `gulp package-solution --ship`
* from the _sharepoint/solution_ folder, deploy the .sppkg file to the App catalog in your tenant
* in the site where you want to test this solution
  * add the app named react-application-search-dynamicdata
  * edit a page
  * add the web part named: SearchWebPartWebPart
  * configure the SearchWebPartWebPart:
    * as _Data source_, choose the SearchExtensionApplicationCustomizer option
    * as _Data property_, choose the Text option


## Features

This example contains an SPFX Extension the type of Application Customizerso, with a Webpart to show the capabilities of the dynamic types.

Web parts in this solution illustrate the following concepts on top of the SharePoint Framework:

* making extensions a dynamic data source
* subscribing to dynamic data source notifications from a web part
* persisting dynamic data subscription information in web part properties

