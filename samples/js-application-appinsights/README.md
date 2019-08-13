# Injecting Javascript with Sharepoint Framework Extensions - Azure Application Insights

## Summary
Sample SharePoint Framework extension projects injecting Javascript code to enable Azure App Insights monitoring and statistics.
This sample implements the code needed for browser usage analysis, as described here: https://docs.microsoft.com/azure/azure-monitor/app/usage-overview

![Application Insights Customizer Customizer](https://github.com/SharePoint/sp-dev-fx-extensions/blob/master/samples/js-application-appinsights/assets/appinsights-1.png)

## Used SharePoint Framework Version 
![drop](https://img.shields.io/badge/version-GA-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)
* [Office 365 tenant](https://dev.office.com/sharepoint/docs/spfx/set-up-your-development-environment)

## Prerequisites
 An [Azure Application Insights](https://go.microsoft.com/fwlink/?linkid=2091003) resource

## Solution

Solution|Author(s)
--------|---------
js-application-appinsights  | Version 1: Luis Valencia (MVP)<br />Version 2: Guillaume Sellier (Premier Field Engineer - Microsoft)

## Version history

Version|Date|Comments
-------|----|--------
2.0|July 29, 2019|Rebuilt the sample to make it work with SPFx 1.8.2
1.0|June 11, 2017|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- In `src\extensions\appInsights\AppInsightsApplicationCustomizer.ts`, update the variable `appInsightsKey` with your Azure Application Insights Instrumentation Key
- In `config\serve.json`, update your debug site url
- In the command line run:
  - `npm install`
  - `gulp serve`
- Navigate on your site
- After a few seconds, usage data will be visible in Application Insights


## Features
This extension injects javascript needed to track pages in Sharepoint Online with Azure Application Insights

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-application-appinsights" />