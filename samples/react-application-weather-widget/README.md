# Weather Application Customizer Extension

## Summary

SPFx Weather Application Customizer Extension in the top placeholder

![Weather Widget](./src/extensions/assets/weatherwidget.PNG)

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.16.1-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)


## Prerequisites
- To   [openweathermap](https://api.openweathermap.org), create an free account, generate the api key and update it in the service.
- Weather API Key

The App require API Key to call the Weather API. Please go to [openweathermap](https://api.openweathermap.org) and create an account and get your API KEY. This API KY needs to be configured on the weatherService.ts 
  
## Debug URL 
```
?debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fmanifests.js&loadSPFX=true&customActions=%7B"70b3e3d6-b25e-42af-8e95-841e87355635"%3A%7B"location"%3A"ClientSideExtension.ApplicationCustomizer"%2C"properties"%3A%7B"location"%3A"Toronto"%7D%7D%7D
```


## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| react-application-weather-widget |  [Rishabh Shukla](https://github.com/rishabhshukla12)

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.0     | March 11, 2023 | Initial release |

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**



## Features

This extension illustrates the following concepts:

- Display weather ( default set to Toronto) on the top header of the page


## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---


## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
