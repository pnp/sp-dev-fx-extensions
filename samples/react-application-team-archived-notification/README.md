# SPFx Application Customizer for archived notifiier

## Summary
This sample demonstrates how to read is current Team connected to a site set archived. 

![picture of the extension in action, if possible](./assets/screenshot.png)

## Used SharePoint Framework Version 
![1.5.1](https://img.shields.io/badge/version-GA-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)


> Update accordingly as needed.

## Prerequisites
 
> Office 365 Developer tenant on Targeted Release mode.
> Modern team site with Teams functionality added.

## Solution

Solution|Author(s)
--------|---------
react-application-archived-notifier | Matti Paukkonen

## Version history

Version|Date|Comments
-------|----|--------
1.0|July 8, 2018|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- in the command line run:
  - `npm install`
  - `gulp serve --nobrowser`
- Open a modern team site which has Teams activated
- Set team as archived on Microsoft Teams
- append following query string parameters to the home page URL
```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"387bb15a-68d2-474b-8512-5963655f9799":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"testMessage":"Hello as property!"}}}
```

## Features
This is sample is a SharePoint Framework application customizer extensions built using React and Office UI Fabric React. This customizer renders notification, if team linked to site is set as archived. Team archived status is fetched from Microsoft Graph Teams beta API.
Description of the extension with possible additional details than in short summary.

This extension illustrates the following concepts:

- Consuming Microsoft Graph to get archived status of a Team.
- using React to display notification bar on header


## Debug URL for testing
Here's a debug URL for testing around this sample.

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"387bb15a-68d2-474b-8512-5963655f9799":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"testMessage":"Hello as property!"}}}
```

## To deploy
- In the command line navigate to samples/react-application-team-archived-notification and run: 
  - gulp bundle --ship
  - gulp package-solution --ship
- Drag react-application-archived-notification.sppkg onto the App for SharePoint library to tenant's app catalog.
- Check tenant wide deployment option
[Deployment](./assets/deploy.png)
- Navigate to SharePoint admin center preview (https://innofrontier-admin.sharepoint.com/_layouts/15/online/AdminHome.aspx#/webApiPermissionManagement)  and approve Microsoft Graph permissions (Group.Read.All).
- Bind application customizer to target site with PowerShell script example. [ProvisionTeamArchivedNotication.ps1](./ProvisionTeamArchivedNotification.ps1). 

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/readme-template" />
