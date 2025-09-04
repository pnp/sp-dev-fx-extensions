# Notification Application Customizer with Webhooks

This project demonstrates a SharePoint Framework (SPFx) Application Customizer that uses webhooks to display notifications when a SharePoint list changes. It leverages PnPjs, React, and the SPFx List Subscription API.

## Solution in action

### Light theme
![Light theme sample](<assets/Light theme.gif>)

### Dark theme
![Dark theme sample](<assets/Dark theme.gif>)

### Alternative light theme
![Alternative light theme sample](<assets/Alternative light theme.gif>)

## Features

- Subscribes to SharePoint list changes using webhooks
- Displays notifications in a custom Toast component at the bottom of the page
- Handles theme changes for better visibility in both light and dark modes
- Fetches and displays the latest item and its editor when a change occurs

## Prerequisites

- [PnP PowerShell](https://pnp.github.io/powershell/) installed.
- Entra App Registration with appropriate permissions. Can be created using [this guide](https://pnp.github.io/powershell/articles/registerapplication.html).
- Permissions to perform management operation on the SPO site in order to configure the application customizer.

## Configuration

### 1. Deploy the Application Customizer

Deploy the solution package to your SharePoint App Catalog and add the app to your site.

### 2. Configure the Application Customizer Properties

You can configure the Application Customizer properties (such as the `listId`) using PnP PowerShell.
To connect to your SharePoint site use the following command:

```powershell
Connect-PnPOnline -Url "https://<YOUR-TENANT>.sharepoint.com/sites/yoursite" -ClientId "<YOUR-ENTRA-APP-REG-ID> -Interactive
```

Once connected, you can add the Application Customizer with the required properties:

```powershell
Add-PnPApplicationCustomizer -Title "Notification Customizer" -ClientSideComponentId "<YOUR-COMPONENT-GUID>" -ClientSideComponentProperties "{`"listId`":`"<YOUR-LIST-GUID>`"}" 
```

> Replace:
>- '<YOUR-TENANT>' with your tenant name.
>- `<YOUR-COMPONENT-GUID>` with the ClientSideComponentId of your Application Customizer (from the manifest).
>- `<YOUR-LIST-GUID>` with the GUID of the SharePoint list to monitor.

## How it Works

1. The Application Customizer subscribes to list changes using the List Subscription API.
2. When a change is detected, it fetches the latest item and the user who modified it.
3. A Toast notification is rendered at the top of the page, styled for visibility in both light and dark themes.

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.21.1-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Contributors

* [Guido Zambarda](https://github.com/guidozam)

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.0     | August 30, 2025 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- Ensure the `./config/serve.json` file is configured to point to your SharePoint site and list.
- in the command-line run:
  - `npm install`
  - `gulp serve`
- Open your SharePoint Online site in the browser and test the extension by adding or modifying items in the configured list.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
- [PnP PowerShell](https://pnp.github.io/powershell/)
- [Getting started with Application Customizer](https://learn.microsoft.com/en-gb/sharepoint/dev/spfx/extensions/get-started/build-a-hello-world-extension)

![](https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-application-customizer-notification)