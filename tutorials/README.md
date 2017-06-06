# Getting started with SharePoint Framework Extensions

## Summary

This sub folders contains client-side projects includes the extensions detailed in the Getting Started tutorials. Technically these extensions could have remain in one single solution, but to ensure that they match exactly what's in the tutorials, we have separated them to dedicated solutions. Sub folders contains the following extensions:

| Solution  | Getting Started Walkthrough | Video
| ------------- | ------------- | ------------- |
| app-extension  | [Build your first extension](#) - Application Customizer  | Video coming soon  |
| field-extension  | [Building simple field customizer](#)  | Video coming soon  |
| command-extension  | [Build simple ListView Command Set with Dialog API](#)  | Video coming soon  |

You can also other SharePoint Framework releated videos from [SharePoint PnP YouTube Channel](https://aka.ms/SPPnP-Videos).

## Used SharePoint Framework Version
![GA](https://img.shields.io/badge/version-GA-green.svg)

## Applies to

* [SharePoint Framework Extension Developer Preview](http://dev.office.com/sharepoint/docs/spfx/sharepoint-framework-overview)
* [Office 365 developer tenant](http://dev.office.com/sharepoint/docs/spfx/set-up-your-developer-tenant)

## Solution

| Solution  | Author(s) |
| ------------- | ------------- |
| web-part-tutorials  | Microsoft SharePoint Framework Team   |

## Version history

| Version  | Date | Comments |
| ------------- | ------------- | ------------- |
| 1.0.0  | June 6th 2017   | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED AS IS WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

----------

## Build and run the tutorials

To build and run this client-side project, you will need to clone and build the tutorials project.

Clone this repo by executing the following command in your console:

```
git clone https://github.com/SharePoint/sp-dev-fx-extensions.git
```

Navigate to the cloned repo folder which should be the same as the repo name:

```
cd sp-dev-fx-extensions
```

Navigate to the `tutorials` folder:

```
cd tutorials
```

Navigate to the `specific extension` folder:

```
cd 'subfolder'
```


Now run the following command to install the npm packages:

```
npm install
```

This will install the required npm packages and dependencies to build and run the client-side project.

Once the npm packages are installed, run the command to start debugging extension in SharePoint Online:

```
gulp serve --nobrowser
```
<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/tutorials" />