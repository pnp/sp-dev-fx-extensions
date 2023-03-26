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
  createdDate: 6/1/2017 12:00:00 AM
---
# React Slider Field Customizer

## Summary
The sample illustrates how to use Office UI Fabric React Slider in Field Customizer with permissions-base inline editing

![React Slider Field Customizer](./assets/slider.png)

## Used SharePoint Framework Version 
SPFx Extensions RC0

## Applies to

* [SharePoint Framework](http://dev.office.com/sharepoint/docs/spfx/sharepoint-framework-overview)

Solution|Author(s)
--------|---------
react-slider-field-customizer | Alex Terentiev ([Sharepointalist Inc.](http://www.sharepointalist.com), [AJIXuMuK](https://github.com/AJIXuMuK))

## Version history

Version|Date|Comments
-------|----|--------
1.0|June 6, 2017|Initial release
1.1|August 30, 2017|Update to RC0

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Features
This project contains SharePoint Framework extensions that illustrates next features:
* field customizer
* usage of Office UI Fabric React
* usage of PnP JS
* inline editing of list items (Users who have EditListItems permissions can edit value by dragging the slider)

**NOTE:** this customizer should be applied to a column with type Number. For the simplicity author assumes that the values of the column are between 0 and 100.
To use with Percentage column the code should be modified to multiply `value` by 100

### Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

## Debug URL for testing
Here's a debug URL for testing around this sample. Notice that this sample is designed to be used with **Number** field type. In below debug URL sample we define the field internal name as **Percent**. Slider in this case is designed to show values between 0 and 100.

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&fieldCustomizers={"Percent":{"id":"f2f6825c-fd37-43f7-a99c-5fe6b39dd7fd","properties":{"sampleText":"Hello!"}}}
```

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-field-slider" />
