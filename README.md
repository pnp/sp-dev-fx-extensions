# SPFx Festivals Extension

## Summary
Sample SharePoint Framework application customizer adds a festival animation to the pages. At the moment this extension has capability of display 2 festivals (Christmas and Diwali) however, more can be added very easily.

![Festivals](./demo/festivals.gif)

## Used SharePoint Framework Version 
![1.6](https://img.shields.io/badge/version-1.6-green.svg)

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)

## Solution

Solution|Author(s)
--------|---------
react-application-festivals | Anoop T ([@anooptells](https://twitter.com/anooptells))

## Version history

Version|Date|Comments
-------|----|--------
1.0|Decmber 05, 2018|Initial release

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Update the `pageUrl` properties in the **config/serve.json** file
  - The `pageUrl` should be a modern page
  - This property is only used during development in conjunction with the `gulp serve` command
- In the command line navigate to the js-command-copy-classic-link folder and run:
  - `npm install`
  - `gulp serve --config=Christmas1` or `gulp serve --config=Christmas2` or `gulp serve --config=Diwali` (when it's Diwali :) )

## Features

This extension illustrates the following concepts:

- Use only CSS and HTML to show the required animation.

## Debug URL for testing
Here's a debug querystring for testing this sample:

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"e33e08f3-5c41-4e0b-9221-7131144f9d74":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"festivalName":"Christmas1"}}}
```

Your URL will look similar to the following (replace with your domain and site address):
```
https://yourtenant.sharepoint.com/sites/yoursite?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"e33e08f3-5c41-4e0b-9221-7131144f9d74":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"festivalName":"Christmas"}}}
```

## Credits / Code used from

- [Christmas 1](https://codepen.io/tobyj/pen/QjvEex)
- [Christmas 2](https://codepen.io/rolchau/pen/OaYXpJ)
- [Diwali](https://codepen.io/sidthesloth92/pen/gGZRpz)