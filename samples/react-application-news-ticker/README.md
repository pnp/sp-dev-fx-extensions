# News Ticker

## Summary

An SPFx Extension that displays news as a running text at the top of every modern page.

![News Ticker](./assets/react-application-news-ticker.gif)

## Compatibility

![SPFx 1.21.1](https://img.shields.io/badge/SPFx-1.21.1-green.svg)
![Node.js LTS v22](https://img.shields.io/badge/Node.js-LTS%20v22-green.svg)
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
   - `RssUrl`: single line text (plain text)
   - `PublishDate`: date
   - `ExpiryDate`: date
3. Required View:
   - Title: `Published News`
   - Configure the view as you like. The app will get the data based on the view. Below is the example:
      - Filter: `PublishDate <= [TODAY] AND ExpiryDate > [TODAY]`
      - Sort: `PublishDate Ascending`
      - Limit: `10`

## Contributors

- [Ari Gunawan](https://github.com/AriGunawan)
- [Sudharsan Kesavanarayanan](https://github.com/sudharsank)
- [Nicolas Kheirallah](https://github.com/NicolasKheirallah)

## Version history

Version|Date|Comments
-------|----|--------
1.0|April 19, 2021|Initial release
1.1|October 17, 2021|Update SPFx version to 1.12.1
1.2|August 27, 2021|Fixed failed upgrade and update SPFx version to 1.15.2
1.3|October 24, 2024|Upgraded to SPFX 1.20, React 17 , Node 18! Rewrite the code to use Graph API, Also coded a native Ticker instead of another module as it's was no longer maintained! Also refactored a lot of the code
2.0|July 4, 2025|Added RSS feed integration support for external news sources, Major UI/UX improvements: Removed icons for cleaner design, replaced bullet separators with pipe characters, fixed hover behavior to pause instead of blanking, optimized CSS with min-height constraints, fixed memory leaks with proper event listener, improved performance
2.1|September 8, 2025|Updated to SPFX 1.21. and Typescript 5.3

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - `npm install`
  - `gulp serve`

## Features

This extension illustrates the following concepts:

- Display news as a running text at the top of every modern page where the app installed
- Get news items from SharePoint lists across multiple sites (current site, home site, hub site) using Microsoft Graph API
- **RSS Feed Integration** - Fetch and display news from external RSS feeds with automatic date filtering
- Native React ticker component with smooth animations and accessibility support
- Pause animation on hover while maintaining content visibility
- Clean, minimalist design with pipe separators and no icons
- Memory leak prevention with proper event listener cleanup
- Configurable speed, direction, and visual styling options
- Accessibility features including reduced motion preference support
- **RSS Content Processing** - Automatic HTML sanitization and content extraction from RSS feeds

## References

- [SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)

## Debug URL for testing

Here's a debug URL for testing around this sample.

```shell
?debugManifestsFile=https://localhost:4321/temp/manifests.js
```

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Help

We do not support samples, but we this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

You can try looking at [issues related to this sample](https://github.com/pnp/sp-dev-fx-extensions/issues?q=label%3Asample%3Areact-application-news-ticker) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this sample](https://github.com/pnp/sp-dev-fx-extensions/discussions?discussions_q=label%3Asample%3Areact-application-news-ticker) and see what the community is saying.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=react-application-news-ticker&authors=@AriGunawan&title=react-application-news-ticker%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=question.yml&sample=react-application-news-ticker&authors=@AriGunawan&title=react-application-news-ticker%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=suggestion.yml&sample=react-application-news-ticker&authors=@AriGunawan&title=react-application-news-ticker%20-%20).

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-application-news-ticker" />
