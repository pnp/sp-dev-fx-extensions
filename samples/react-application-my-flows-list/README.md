# My Flows List

## Summary

This application extension allows the user to check list of flows and their current status and details.

![HowItWorks](./assets/HowItWorks.gif)

![List](./assets/List.jpg)

![Details](./assets/Details.jpg)

The application button may be added in two locations. The first one (default) uses standard spfx PlaceholderName.Top region. 

![optionStandard](./assets/optionStandard.jpg)

The second one (not recommended approach as it uses HTML as API) presents the flow icon in the Suite Navigation Placeholder (in order to change the mode set headerButtonRegion to true).

![optionNotRecomended](./assets/optionNotRecomended.jpg)


## Compatibility

![SPFx 1.12.1](https://img.shields.io/badge/SPFx-1.12.1-green.svg)
![Node.js LTS v14 | LTS v12 | LTS v10](https://img.shields.io/badge/Node.js-LTS%20v14%20%7C%20LTS%20v12%20%7C%20LTS%20v10-green.svg) ![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Incompatible](https://img.shields.io/badge/Local%20Workbench-Incompatible-red.svg)
![Hosted Workbench Incompatible](https://img.shields.io/badge/Hosted%20Workbench-Incompatible-red.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

This extensions uses power automate API which needs additional permissions to be added (and approved) for the Extensibility Web Application in AAD. In Order to add that please fallow those steps:
1. Go to the **portal.azure.com** -> **App registrations**,
2. Open the **SharePoint Online Client Extensibility Web Application Principal** app 
3. select **API permissions**,
4. Add new permission and switch tab to **APIs my organization uses**,
5. Find **Microsoft Flow Service**,
6. Add `Flows.Read.All`
7. Grant admin consent and you are ready to go.

## Solution

Solution|Author(s)
--------|---------
react-application-my-flows-list | [Adam Wójcik](https://github.com/Adam-it)

## Version history

Version|Date|Comments
-------|----|--------
1.0|October 3, 2021|Initial release

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - `npm install`
  - `gulp serve`

## Features

Description of the extension that expands upon high-level summary above.

This extension illustrates the following concepts:

- use power automate (flow) api in spfx extension
- use office-ui-fabric-react controls when possible

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Help

We do not support samples, but we this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

You can try looking at [issues related to this sample](https://github.com/pnp/sp-dev-fx-extensions/issues?q=label%3Areact-application-my-flows-list) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this sample](https://github.com/pnp/sp-dev-fx-extensions/discussions?discussions_q=label%3Areact-application-my-flows-list) and see what the community is saying.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=react-application-my-flows-list&authors=@Adam-it&title=react-application-my-flows-list%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=question.yml&sample=react-application-my-flows-list&authors=@Adam-it&title=react-application-my-flows-list%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=suggestion.yml&sample=react-application-my-flows-list&authors=@Adam-it&title=react-application-my-flows-list%20-%20).

react-application-my-flows-list
