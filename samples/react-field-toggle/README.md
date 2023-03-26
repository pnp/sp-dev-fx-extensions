---
page_type: sample
products:
- office-sp
languages:
- javascript
- typescript
extensions:
  contentType: samples
  technologies:
  - SharePoint Framework
  platforms:
  - react
  createdDate: 8/1/2017 12:00:00 AM
---
# React Toggle Field Customizer

## Summary
In this sample is possible to see how to implement Office UI Fabric React Toggle for the field yes/no through SPFx Extensions Field Customizers to modify in a quick way (inline editing) a list without opening the list item. 

![Office UI Fabric React Toggle SPFx Field Customizer](./assets/react-field-toggle.gif)

## Used SharePoint Framework Version 
![1.3.0](https://img.shields.io/badge/version-1.3.0-green.svg)

## Applies to

* [SharePoint Framework](https://dev.office.com/sharepoint)

## Solution

Solution|Author(s)
--------|---------
react-field-toggle | Giuliano De Luca ([@giuleon](https://twitter.com/giuleon) , [www.delucagiuliano.com](http://www.delucagiuliano.com))

## Version history

Version|Date|Comments
-------|----|--------
1.0|June 17, 2017|Initial release
1.1|October 04, 2017|Updated to GA 1.3.0

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
Update the `pageUrl` properties in the **config/serve.json** file
  - The `pageUrl` should be a list view in your tenant
  - This property is only used during development in conjunction with the `gulp serve` command
- In the command line navigate to **samples/react-field-toggle** and run:
  - `npm install`
  - `gulp serve`

## Features
This sample illustrates how to leverage the SharePoint Modern UI and extending the capabilities through the SharePoint Framework Extensions Field Customizer to modify in a quick way a list:

- Field Customizer
- Office UI Fabric

## Debug URL for testing
Here's a debug URL for testing around this sample. Notice that this sample is designed to be used with **Boolean** field type. In below debug URL sample we define the field internal name as **SPFxActive**.

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&fieldCustomizers={"SPFxActive":{"id":"972be477-1d2a-4656-a83a-63eb02552556","properties":{"sampleText":"Hello!"}}}
```

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-field-toggle" />
