# React Field Attachment Info

## Summary

This field customizer will display the attachment related information for a listitem. The default attachment field will display only an icon, but this component will display some info of the attachments which will help the business users to access the files easily.

### Features

* Display **_Total_** count of attachments mapped to an item.
* Display **_List of Attachments_** with **_link_** to the files.
* Display **_No Attachments_** message with an **_icon_** for the item without the attachments

## Properties

1. **_showTotal_**: This property will allow the users to view the count of attachments mapped to the list item.

2. **_showAttachmentList_**: This property will allow the users to view the full list of attachments to the list item.

3. **_showNoAttachmentMsg_**: This property will allow the users to enable or disable the **'No Attachments'** message.

### _Note_
* Used PnPJS library for fetching the attachments mapped to the listitem.
* For each item, a transaction call is made to fetch the attachments.
* **_Do not use it on large lists_**

## Preview
![React-Field-Attachment-Info](./assets/react-field-attachment-info.png)

## Used SharePoint Framework Version 
![1.10.0](https://img.shields.io/badge/version-1.10.0-green.svg)

## Applies to

* [SharePoint Framework](https:/dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Prerequisites
 
> **@microsoft/generator-sharepoint - 1.10.0**

## Solution

Solution|Author(s)
--------|---------
react-field-attachment-info | Sudharsan K.([@sudharsank](https://twitter.com/sudharsank), [Know More](http://windowssharepointserver.blogspot.com/))

## Version history

Version|Date|Comments
-------|----|--------
1.0.0.0|Apr 2 2020|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - `gulp bundle --ship && gulp package-solution --ship`
- Add the .sppkg file to the app catalog and add the **'_Quick Poll_'** web part to the page.

#### Local Mode
This solution doesn't work on local mode.

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/react-field-attachment-info" />
