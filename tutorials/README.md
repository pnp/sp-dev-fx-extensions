# Getting started with SharePoint Framework Extensions

## Summary

This sub folders contains client-side projects includes the extensions detailed in the Getting Started tutorials. Technically these extensions could have remain in one single solution, but to ensure that they match exactly what's in the tutorials, we have separated them to dedicated solutions. Sub folders contains the following extensions:

| Solution  | Getting Started Walkthrough | Video
| ------------- | ------------- | ------------- |
| app-extension  | [Build your first extension](https://dev.office.com/sharepoint/docs/spfx/extensions/get-started/build-a-hello-world-extension) - Application Customizer  | [Video](https://www.youtube.com/watch?v=0BeS0HukW24&list=PLR9nK3mnD-OXtWO5AIIr7nCR3sWutACpV)  |
| field-extension  | [Building simple field customizer](https://dev.office.com/sharepoint/docs/spfx/extensions/get-started/building-simple-field-customizer)  | [Video](https://www.youtube.com/watch?v=fijOzUmlXrY&list=PLR9nK3mnD-OXtWO5AIIr7nCR3sWutACpV) |
| command-extension  | [Build simple ListView Command Set with Dialog API](https://dev.office.com/sharepoint/docs/spfx/extensions/get-started/building-simple-cmdset-with-dialog-api)  | [Video](https://www.youtube.com/watch?v=iW0LQQqAY0Y&list=PLR9nK3mnD-OXtWO5AIIr7nCR3sWutACpV)  |

You can also other SharePoint Framework related videos from [SharePoint PnP YouTube Channel](https://aka.ms/SPPnP-Videos).

## Used SharePoint Framework Version
![GA](https://img.shields.io/badge/version-1.2-green.svg)

## Applies to

* [SharePoint Framework Extension Developer Preview](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
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