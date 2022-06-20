# News Ticker

## Summary

An SPFx Extension that displays news as a running text at the top of every modern page.

![News Ticker](./assets/react-application-news-ticker.gif)

## Compatibility

![SPFx 1.14.0](https://img.shields.io/badge/SPFx-1.14.0-green.svg)
![Node.js LTS v14 | LTS v12 | LTS v10](https://img.shields.io/badge/Node.js-LTS%20v14%20%7C%20LTS%20v12%20%7C%20LTS%20v10-green.svg) 
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Incompatible](https://img.shields.io/badge/Hosted%20Workbench-Incompatible-red.svg "Does not work with hosted workbench")

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

Create list as the data source for the app with below details:
1. List title: `News`
2. Required Columns: 
   - `Title`: single line text
   - `Content`: multiline text (plain text)
   - `PublishDate`: date
3. Required View:
   - Title: `Published News`
   - Configure the view as you like. The app will get the data based on the view. Below is the example:
      - Filter: `PublishDate <= [TODAY] AND ExpiryDate > [TODAY]`
      - Sort: `PublishDate Ascending`
      - Limit: `10`

## Solution

Solution|Author(s)
--------|---------
react-application-news-ticker | [Ari Gunawan](https://github.com/AriGunawan) ([@arigunawan3023](https://twitter.com/arigunawan3023))
react-application-news-ticker | [Sudharsan Kesavanarayanan](https://github.com/sudharsank) (NTT Ltd, [@sudharsank](https://twitter.com/sudharsank))

## Version history

Version|Date|Comments
-------|----|--------
1.0|April 19, 2021|Initial release
1.1|October 17, 2021|Update SPFx version to 1.12.1


## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - `npm install`
  - `gulp serve`

> Include any additional steps as needed.

## Features

This extension illustrates the following concepts:

- Display news as a running text at the top of every modern page where the app installed
- Get news items from a SharePoint list view using PnPJS
- Stop the running text when user hover it

## References

- [SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [PnP JS](https://pnp.github.io/pnpjs/)
- [react-ticker](https://github.com/AndreasFaust/react-ticker)


## Debug URL for testing
Here's a debug URL for testing around this sample. 

```
?debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"4358e70e-ec3c-4713-beb6-39c88f7621d1":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"listTitle":"News","listViewTitle":"Published News"}}}
```

## Disclaimer
**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Help

We do not support samples, but we this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

You can try looking at [issues related to this sample](https://github.com/pnp/sp-dev-fx-extensions/issues?q=label%3Areact-application-news-ticker) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this sample](https://github.com/pnp/sp-dev-fx-extensions/discussions?discussions_q=label%3Areact-application-news-ticker) and see what the community is saying.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=react-application-news-ticker&authors=@YOURGITHUBUSERNAME&title=react-application-news-ticker%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=question.yml&sample=react-application-news-ticker&authors=@YOURGITHUBUSERNAME&title=react-application-news-ticker%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=suggestion.yml&sample=react-application-news-ticker&authors=@YOURGITHUBUSERNAME&title=react-application-news-ticker%20-%20).
