# Spfx Applications Customiser CSS Injection

## Summary
This sample shows how to inject a custom Cascading Style Sheet (CSS) on modern pages.

![Sample super ugly CSS to illustrate custom CSS injection](./assets/sampleresults.png)

__Note__: This code is provided as a sample only. Keep in mind that Microsoft may change page elements and styles at any time, rendering your custom CSS useless. It is preferrable to use well-known HTML element placeholders.

When you need to make minor cosmetic changes to modern pages (e.g.:  match your corporate branding guidelines) and cannot use placeholders,you can create a custom CSS and inject on every modern page.

In this example, we deploy the CSS in a shared location; this allows us to change the CSS file at any time without re-deploying or re-configuring the application customizer.

You can deploy the application customizer with different settings to point to different CSS files.


## Used SharePoint Framework Version

![SPFx v1.4.1](https://img.shields.io/badge/SPFx-1.4.1-green.svg)

## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Office 365 developer tenant](http://dev.office.com/sharepoint/docs/spfx/set-up-your-developer-tenant)

## Solution

Solution|Author(s)
--------|---------
react-application-injectcss|Hugo Bernier ([Tahoe Ninjas](http://tahoeninjas.blog), @bernierh)

## Version history

Version|Date|Comments
-------|----|--------
1.0.0|07 May, 2018|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

* clone repo
* create a custom CSS file that meets your needs. For example, this CSS will make the site logos round and will add an ugly red colour at the top of every page.

```
.ms-compositeHeader {
    background-color: red;
}

.ms-siteLogoContainerOuter {
    border-radius: 50%;
    border-width: 3px;
}

.ms-siteLogo-actual {
    border-radius: 50%;
}
```
* upload the CSS file to a shared location on your SharePoint tenant. For example, in the `Styles Library` of the root site collection.
* get the URL to your custom CSS. For example: `/Style%20Library/custom.css`

* update _serve.json_ pointing to your site collection home page change the `cssurl` property with the URL to your custom CSS.
* run _gulp serve_

## Deployment to Production

* located the `elements.xml` file, in the `sharepoint` > `assets` folder
* change the `ClientSideComponentProperties` to point to your custom CSS URL.
* run _gulp bundle --ship_
* run _gulp package-solution --ship_
* upload the `react-application-injectcss.sppkg` from the `sharepoint` folder to your App catalog.
* when prompted to deploy to all sites, choose the option that suits your needs.

## Features

Sample SharePoint Framework application customiser injecting a custom CSS in the HTML header.

This sample illustrates the following concepts on top of the SharePoint Framework:

* HTML manipulation