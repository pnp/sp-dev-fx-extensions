# SPFx Toastr Application Customizer

## Summary
Sample SharePoint Framework application customizer extension that shows toast notifications configured from a SharePoint list. Demonstrates jQuery module loading, barrel configuration, promise chaining, and localStorage caching.

![Toasts shown on a Communication Site](./assets/spfxToastr-Preview.PNG)

## Used SharePoint Framework version 
![1.4.0](https://img.shields.io/badge/version-1.4.0-green.svg)

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Toastr](http://codeseven.github.io/toastr/)

## Solution

Solution|Author(s)
--------|---------
jquery-application-toastr | Chris Kent ([thechriskent.com](https://thechriskent.com), [@thechriskent](https://twitter.com/thechriskent))

## Version history

Version|Date|Comments
-------|----|--------
1.0|July 9, 2017|Initial release
1.1|August 20, 2017|Updated to use framework 1.1.3
1.2|August 30, 2017|Updated to SPFx Release Candidate 1.2.0
1.3|September 27, 2017|Updated for SPFx GA 1.3.0
1.4|February 1, 2018|Updated to SPFx 1.4.0

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal path to awesome

- Clone this repository
- Update the `pageUrl` properties in the **config/serve.json** file
  - The `pageUrl` should be a modern page
  - This property is only used during development in conjunction with the `gulp serve` command
- In the command line navigate to **samples/jquery-application-toastr** and run:
  - `npm install`
  - `gulp serve`
- In a web browser
  - Follow one of the steps below for **List Deployment**
    - Add some sample list items _(Be sure at least 1 item has a StartDate prior to now and an EndDate later than now)_
  - Choose **Load Debug Scripts** when prompted
  - Stand in awe of the glory of Toast

## Features
SPFx Toastr utilizes Toastr to demonstrate how to display beautiful notifications in a familiar and intuitive manner.

This extension illustrates the following concepts:

- Loading **jQuery** and jQuery based modules from a CDN
- Loading **3rd Party CSS** from a CDN
- Using **Toastr** in an Application Customizer
- Separating logic into a static service
- Accessing components through a custom **barrel**
- Adapting **Office UI Fabric styles**
- Caching data using **localStorage**
- Promise chaining with Exception bubbling
- Theme syntax for applying official colors to custom CSS classes
- Optionally, **PnP Remote Provisioning** PowerShell list deployment _(see below)_

## Debug URL for testing
Here's a debug querystring for testing this sample:

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"a861c815-e425-416d-9520-04bcdf557e27":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{}}}
```

Your URL will look similar to the following (replace with your domain and site address):
```
https://yourtenant.sharepoint.com/sites/yoursite?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"a861c815-e425-416d-9520-04bcdf557e27":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{}}}
```

## List deployment

This solution expects the site to contain a **Toast** list. Here are 2 options to ensure this list exists:

### Option 1: Use the included PnP provisioning template

A PnP Remote Provisioning template has been provided ([ToastList.xml](./assets/ToastList.xml)) along with a PowerShell script to apply the template to your site ([ApplyTemplate.ps1](./assets/ApplyTemplate.ps1)). This is by far the easiest way to get the list on a site but requires some minor setup.

> You can also use this template as part of a [Site Design](https://docs.microsoft.com/en-us/sharepoint/dev/declarative-customization/site-design-pnp-provisioning).

#### Prerequisites

You'll need the [SharePoint PnP PowerShell Cmdlets for SharePoint Online](https://github.com/SharePoint/PnP-PowerShell). It's a very quick install and if you don't have it already, go get it! You'll end up using it for far more than just this sample.

#### Running the PowerShell script

Using a PowerShell console (you can even use the powershell terminal included in Visual Studio Code), navigate to the assets folder in this sample. Run the script like this:

```PowerShell
.\ApplyTemplate.ps1 https://yourtenant.sharepoint.com/sites/yoursite ToastList.xml
```

You'll be prompted for your credentials and then the list will be created. The only thing included in the template is the Toast list. You may receive a warning about the site template not matching but this can be safely ignored since the custom list definition is supported everywhere.

> Read More Here: [Introducing the PnP Provisioning Engine](https://github.com/SharePoint/PnP-Guidance/blob/551b9f6a66cf94058ba5497e310d519647afb20c/articles/Introducing-the-PnP-Provisioning-Engine.md)

### Option 2: Manually create the list

You can always manually create the list using the SharePoint UI:

1. Navigate to the Site Contents page and choose **New** > **List**
2. Name the list _**Toast**_ and click **Create**
3. Add and configure the columns as listed below:

Column | Type | Required | Details
--- | --- | --- | ---
Title | Text | Yes |
Message | Text | Yes |
Severity | Choice | Yes | Info, Warning, Error, Success
StartDate | DateTime | Yes | Date and Time, Default =Today
EndDate | DateTime | Yes | Date and Time, Default =Today+7
Frequency | Choice | Yes | Once, Once Per Day, Always
Enabled | Yes/No | | Default = Yes

## Deploying to your tenant
- In the command line navigate to **samples/jquery-application-toastr** and run:
  - `gulp bundle --ship`
  - `gulp package-solution --ship`
- Open the **samples/jquery-application-toastr/sharepoint** folder
  - Drag the **toastr.sppkg** onto the **Apps for SharePoint** library of your app catalog
  - Check the box for tenant wide deployment and click **Deploy**:
  ![Deploy to Catalog](./assets/DeployToCatalog.png)
- You'll need to add the Custom Action to your site(s) using one of the methods below. You'll also need the list added using one of the options listed above in the List Deployment section

### Adding the custom action to your site

Even if you selected tenant wide deployment for the package, each site will need a Custom Action added to take advantage of the extension.

### Option 1: Use the included PnP provisioning template

A PnP Remote Provisioning template has been provided ([ToastAction.xml](./assets/ToastAction.xml)) along with a PowerShell script to apply the template to your site ([ApplyTemplate.ps1](./assets/ApplyTemplate.ps1)). This is a straightforward way to get the extension on a site but requires some minor setup.

> You can also use this template as part of a [Site Design](https://docs.microsoft.com/en-us/sharepoint/dev/declarative-customization/site-design-pnp-provisioning).

#### Prerequisites

You'll need the [SharePoint PnP PowerShell Cmdlets for SharePoint Online](https://github.com/SharePoint/PnP-PowerShell). It's a very quick install and if you don't have it already, go get it! You'll end up using it for far more than just this sample.

#### Running the PowerShell script

Using a PowerShell console (you can even use the powershell terminal included in Visual Studio Code), navigate to the assets folder in this sample. Run the script like this:

```PowerShell
.\ApplyTemplate.ps1 https://yourtenant.sharepoint.com/sites/yoursite ToastAction.xml
```

You'll be prompted for your credentials and then the action will be added. The only thing included in the template is the Custom Action. Remember, that you'll also need the list with some configured notifications in order to see anything on the site.

> Read More Here: [Introducing the PnP Provisioning Engine](https://github.com/SharePoint/PnP-Guidance/blob/551b9f6a66cf94058ba5497e310d519647afb20c/articles/Introducing-the-PnP-Provisioning-Engine.md)

### Option 2: Use the SPFx Extensions CLI
You can use the [spfx-extensions-cli](https://www.npmjs.com/package/spfx-extensions-cli) to manage your extension custom actions across your sites.

Install the CLI if you haven't already:

`npm install spfx-extensions-cli -g`

Connect to your site (login when prompted):

`spfx-ext --connect "https://yourtenantsharepointcom/sites/yoursite"`

Add the extension:

`spfx-ext add "Toastr Notifications" ApplicationCustomizer site a861c815-e425-416d-9520-04bcdf557e27`

Remember, that you'll also need the list with some configured notifications in order to see anything on the site.

> You can see what extensions you have on your site with `spfx-ext --site`

## Known issues
- UI Fabric Icons are not currently displaying in SPFx Extensions: 
  - [Issue 1279](https://github.com/SharePoint/sp-dev-docs/issues/1279) - Solution has been found, but fix has not yet been implemented

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/jquery-application-toastr" />
