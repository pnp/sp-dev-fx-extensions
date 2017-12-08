# SPFx My Favourites Application Customizer

## Summary
Sample SharePoint Framework application customizer extension that shows favourite links using office ui fabric panel. Fabric UI React components used include - panel, dialog, list and spinner.

> Inspired from ([react-mega-menu](https://github.com/SharePoint/sp-dev-fx-extensions/tree/master/samples/react-mega-menu)) by  Velin Georgiev ([@VelinGeorgiev](https://twitter.com/velingeorgiev))

![My Favourites](./assets/spfx-myfavourites.gif)

## Used SharePoint Framework Version 
![1.3.4](https://img.shields.io/badge/version-1.3.4-green.svg)

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)

## Solution

Solution|Author(s)
--------|---------
react-application-myfavourites | Anoop T ([@anooptells](https://twitter.com/anooptells))

## Version history

Version|Date|Comments
-------|----|--------
1.0|November 29, 2017|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Update the `pageUrl` properties in the **config/serve.json** file
  - The `pageUrl` should be a modern page
  - This property is only used during development in conjunction with the `gulp serve` command
- In the command line navigate to **samples/ react-application-myfavourites** and run:
  - `npm install`
  - `gulp serve`
- In a web browser
  - Follow one of the steps below for **List Deployment**
  - Choose **Load Debug Scripts** when prompted
  - Hope that you will see the buttons at the top!

## Features

This extension illustrates the following concepts:

- Using **React** for building SharePoint Framework client-side solutions.
- Using **Office UI Fabric React** styles for building user experience consistent with SharePoint and Office.
- Adapting **Office UI Fabric styles**
- Caching data using **sessionstorage**
- Theme syntax for applying official colors to custom CSS classes
- Optionally, **PnP Remote Provisioning** PowerShell list deployment _(see below)_

## Debug URL for testing
Here's a debug querystring for testing this sample:

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"5c715e3b-fb6f-43d7-a8a7-52bb5db34e50":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{}}}
```

Your URL will look similar to the following (replace with your domain and site address):
```
https://yourtenant.sharepoint.com/sites/yoursite?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"5c715e3b-fb6f-43d7-a8a7-52bb5db34e50":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{}}}
```

## List Deployment

This solution expects the site to contain a **Favourites** list. This list will hold all the favourites and hence everyone will have write permissions on this list. Here are 2 options to ensure this list exists:

### Option 1: Use the Included PnP Provisioning Template

A PnP Remote Provisioning template has been provided ([FavouritesList.xml](./assets/FavouritesList.xml)) along with a PowerShell script to apply the template to your site ([ApplyTemplate.ps1](./assets/ApplyTemplate.ps1)). This is by far the easiest way to get a list on a site for quick testing but requires some minor setup. Here's how to do it:

#### Prerequisites

You'll need the [SharePoint PnP PowerShell Cmdlets for SharePoint Online](https://github.com/SharePoint/PnP-PowerShell). It's a very quick install and if you don't have it already, go get it! You'll end up using it for far more than just this sample.

#### Running the PowerShell Script

> Thank you Chris Kent ([thechriskent.com](https://thechriskent.com), [@thechriskent](https://twitter.com/thechriskent))

Using a PowerShell console (you can even use the powershell terminal included in Visual Studio Code), navigate to the assets folder in this sample. Run the script like this:

```PowerShell
.\ApplyTemplate.ps1 https://yourtenant.sharepoint.com/sites/yoursite FavouritesList.xml
```

You'll be prompted for your credentials and then the list will be created. You may receive a warning about the site template not matching but this can be safely ignored since the custom list definition is supported everywhere.

Things included in the template are
- The Favourites list
- Updating the security of the Favourites list so that users will have access to items only they create
- Adding "Created By (Author)" as an indexed column

> Read More Here: [Introducing the PnP Provisioning Engine](https://github.com/SharePoint/PnP-Guidance/blob/551b9f6a66cf94058ba5497e310d519647afb20c/articles/Introducing-the-PnP-Provisioning-Engine.md)

### Option 2: Manually Create the List

You can always manually create the list using the SharePoint UI:

1. Navigate to the Site Contents page and choose **New** > **List**
2. Name the list _**Favourites**_ and click **Create**
3. Add and configure the columns as listed below:

Column | Type | Required | Details
--- | --- | --- | ---
Title | Text | Yes |
Description | Multiple lines of text | No |
ItemUrl | Multiple lines of text | No | Can be changed to Url (but needs code change)

4. Under advanced settings of the list, set 
- Read access to "Read items that were created by the user" and 
- Write access to "Create items and edit items that were created by the user"

5. Add "Created By" to the indexed columns (can be found under list settings)

## Improvements

- The code in this sample stores data in a list. Instead of this, the data can stored as a json array in a user profile property. Vardhaman has wrriten a nice blog on [editing user profile properties](http://www.vrdmn.com/2016/08/first-spfx-webpart-getset-single-value.html) Or, if there is any other way to store data that can be added too.

![](https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/react-application-myfavourites)
