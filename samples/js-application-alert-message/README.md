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
  createdDate: 04/30/2020 12:00:00 AM
---
# JS Application Alert Message

## Summary
This application customizer will display the alert message based on the items from the list. The list items are filtered based on the '**IsActive**','**StartDate**' and '**ExpiryDate**'. The messages were displayed at the '**Top**' placeholder with an animation effect.

## Pre-requisites
Create a custom list with a name '**Alerts**' and with the fields. Maintain the **_field names_** as mentioned below and all the fields are **_mandatory_**.
* **`Title`** - Default title field with the type '**Single line of Text**'
* `StartDate` - '**Datetime**' field with date only option.
* `ExpiryDate` - '**Datetime**' field with date only option.
* `IsActive` - '**Yes or No**' field with the default set to Yes.
* `Sequence` - '**Number**' field with no decimals.

## Properties

* **_animationType_**: Animation effect based on the type. Follow this [Animate.css](https://daneden.github.io/animate.css/) for different animation effects.

### _Note_
* Used PnPJS library for fetching the items from the '**Alerts**' list.

## Preview
![JS-Application-Alert-Message](./assets/GlobalAlerts.gif)

## Used SharePoint Framework Version 
![1.10.0](https://img.shields.io/badge/version-1.10.0-green.svg)

## Applies to

* [SharePoint Framework](https:/dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Prerequisites
 
**@microsoft/generator-sharepoint - 1.10.0**

## Solution

Solution|Author(s)
--------|---------
js-application-alert-message | Sudharsan K.([@sudharsank](https://twitter.com/sudharsank), [Know More](http://windowssharepointserver.blogspot.com/))

## Version history

Version|Date|Comments
-------|----|--------
1.0.0.0|Apr 30 2020|Initial release
1.0.0.1|July 09 2020|Minor issue fix. Added CodeTour.

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - `gulp bundle --ship && gulp package-solution --ship`
- Add the `.sppkg` file to the app catalog and add the **'_Quick Poll_'** web part to the page.

#### Local Mode
This solution doesn't work on local mode.
