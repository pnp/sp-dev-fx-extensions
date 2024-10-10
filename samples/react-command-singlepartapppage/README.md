# Spfx List View Command Set to configure a Page as Single App Part page

## Summary
Custom Command Set that set a Page layout to use the Single App Part page Layout

![Single App Part Page Command](./assets/demo.gif)


## Compatibility

![SPFx 1.20.0](https://img.shields.io/badge/SPFx-1.20.0-green.svg)
![Node.js v18.18.2](https://img.shields.io/badge/Node.js-v18.18.2-green.svg) 
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Incompatible](https://img.shields.io/badge/Hosted%20Workbench-Incompatible-red.svg "Does not work with hosted workbench")


## Applies to

* [SharePoint Framework Extensions](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions)
* [Office 365 developer tenant](http://dev.office.com/sharepoint/docs/spfx/set-up-your-developer-tenant)

## Solution

Solution|Author(s)
--------|---------
react-command-singleapppartpage|Luis Mañez (MVP, [ClearPeople](http://www.clearpeople.com), @luismanez)
react-command-singleapppartpage - Upgrade to SPFx 1.20.0|Nishkalank Bezawada (MVP, [Bravero AB](https://www.bravero.se/), @NishkalankBezawada)

## Version history

Version|Date|Comments
-------|----|--------
1.0.0|January 29, 2019|Initial release
1.0.0|January 14, 2022|Upgraded to SPFx 1.14
1.0.0|October 09, 2024|Upgraded to SPFx 1.20.0

## Prerequisites

* Office 365 tenant

## Minimal Path to Awesome

* clone this repo
* update file "./config/serve.json pointing to your tenant and site collection
* in the command line run
  * `npm i`
  * `gulp serve`

## Features

This sample illustrates the following concepts on top of the SharePoint Framework:

* spfx command
* using async / await for the async calls


## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Help

We do not support samples, but we this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

You can try looking at [issues related to this sample](https://github.com/pnp/sp-dev-fx-extensions/issues?q=label%3Areact-command-singlepartapppage) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this sample](https://github.com/pnp/sp-dev-fx-extensions/discussions?discussions_q=label%3Areact-command-singlepartapppage) and see what the community is saying.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=react-command-singlepartapppage&authors=@luismanez&title=react-command-singlepartapppage%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=question.yml&sample=react-command-singlepartapppage&authors=@luismanez&title=react-command-singlepartapppage%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=suggestion.yml&sample=react-command-singlepartapppage&authors=@luismanez&title=react-command-singlepartapppage%20-%20).

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-command-singlepartapppage" />
