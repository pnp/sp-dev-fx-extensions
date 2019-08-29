# Injecting Javascript with Sharepoint Framework Extensions - Azure Application Insights

## Summary
Sample SharePoint Framework extension project injecting Javascript code to enable Azure App Insights monitoring and statistics.
This sample implements the code needed for browser usage analysis, as described here: https://docs.microsoft.com/azure/azure-monitor/app/usage-overview

![Application Insights Customizer Customizer](https://github.com/SharePoint/sp-dev-fx-extensions/blob/master/samples/js-application-appinsights/assets/appinsights-1.png)

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/SPFx-1.9.1-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Prerequisites
 An [Azure Application Insights](https://go.microsoft.com/fwlink/?linkid=2091003) resource

## Solution

Solution|Author(s)
--------|---------
js-application-appinsights  |- Version 2: Guillaume Sellier (Premier Field Engineer - Microsoft)<br />- Version 1: Luis Valencia (MVP)

## Version history

Version|Date|Comments
-------|----|--------
2.1|August 28, 2019|- Store the Application Insights instrumentation key as a component property so that it is not pushed to the CDN with the JS files<br />- Made the solution compatible with tenant wide deployment<br />- Updated the solution to target SPFx 1.9.1
2.0|July 29, 2019|Rebuilt the sample to make it work with SPFx 1.8.2
1.0|June 11, 2017|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Update your Azure Application Insights Instrumentation Key (see next section for the locations of the key)
- In the command line run:
  - `npm install`
  - For debugging:
    - `gulp serve`
  - To generate the production package:
    - `gulp bundle --ship`
    - `gulp package-solution --ship`
    - Install the package on a site or tenant wide
- Navigate on your site
- After a few seconds, usage data will be visible in Azure Application Insights

## How it works
This extension injects the Application Insights javascript code along with the specified instrumentation key in the head of the webpage.
<br />
The actual code is in `src\extensions\appInsights\AppInsightsApplicationCustomizer.ts`.
<br />
The instrumentation key of the Azure Application Insights resource to use is stored in several locations:
* When running a gulp serve and running the page in debug mode, the key that is stored in `config\serve.json` is passed to the page as querystring.
* When the extension is installed on a site, the key in `sharepoint\assets\elements.xml` is used.
* When deployed tenant wide, the key in `sharepoint\assets\ClientSideInstance.xml` is used.
    * In tenant wide deployments, you can easily edit the key in the Tenant Wide Extensions list of your tenant app catalog.
> <b>Note</b>: If you put your key directly in `src\extensions\appInsights\AppInsightsApplicationCustomizer.ts` instead of using parameters, it could be pushed to the Office 365 Public CDN along with the JS files if it is enabled on your tenant.

## Features
This extension injects javascript needed to track pages in SharePoint Online with Azure Application Insights

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-application-appinsights" />
