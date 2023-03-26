# title of the sample

> Use the human-friendly title here. No need to repeat the words `React`, `SPFx`, `extension` or `SharePoint` unless it is absolutely necessary. The name of the sample should already provide that information.
> GOOD 👍:
> Kitten Video Injection
> BAD 👎:
> react-command-kittenvideoinjection
> SPFx Kitten Videos Command Extension for SharePoint using React
>
> DELETE THIS PARAGRAPH BEFORE SUBMITTING

## Summary

Short summary on functionality and used technologies.

![picture of the extension in action](assets/preview.png)

> Please provide a high-quality screenshot of your extension below. It should be stored in a folder called `assets`.
> If possible, use a resolution of 1920x1080.
> If your extension requires the user to configure it, please use a screenshot of the extension as it appears after it has been configured.
> You can add as many screen shots as you'd like to help users understand your extension without having to download it and install it.
> DELETE THIS PARAGRAPH BEFORE SUBMITTING

## Compatibility

![SPFx 1.14](https://img.shields.io/badge/SPFx-1.14-green.svg)
![Node.js v14 | v12](https://img.shields.io/badge/Node.js-v14%20%7C%20v12-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Incompatible](https://img.shields.io/badge/Hosted%20Workbench-Incompatible-red.svg "Does not work with hosted workbench")

> Don't worry if you're unsure about the compatibility matrix above. We'll verify it when we approve the PR.
> ![SPFx 1.13.1](https://img.shields.io/badge/SPFx-1.13.1-green.svg)
> ![Node.js LTS v14 | LTS v12 | LTS v10](https://img.shields.io/badge/Node.js-LTS%20v14%20%7C%20LTS%20v12%20%7C%20LTS%20v10-green.svg)
> 
> If using SPFx 1.12.1, update the SPFx and Node.js tags accordingly:
> ![SPFx 1.12.1](https://img.shields.io/badge/SPFx-1.12.1-green.svg)
> ![Node.js LTS v14 | LTS v12 | LTS v10](https://img.shields.io/badge/Node.js-LTS%20v14%20%7C%20LTS%20v12%20%7C%20LTS%20v10-green.svg)
>
> If using an older version of SPFx, update the SPFx and Node.js compatibility tag accordingly:
> SPFx 1.11
> ![SPFx 1.11](https://img.shields.io/badge/SPFx-1.11.0-green.svg)
> ![Node.js LTS 10.x](https://img.shields.io/badge/Node.js-LTS%2010.x-green.svg)
>
> SPFx 1.4.1
> ![SPFx 1.4.1](https://img.shields.io/badge/SPFx-1.4.1-green.svg)
> ![Node.js LTS 6.x | LTS 8.x](https://img.shields.io/badge/Node.js-LTS%206.x%20%7C%20LTS%208.x-green.svg)
>
> DELETE THIS PARAGRAPH BEFORE SUBMITTING

## Applies to

* [SharePoint Framework](https://docs.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
* [Microsoft 365 tenant](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/m365devprogram)

> Update accordingly as needed.
> DELETE THIS PARAGRAPH BEFORE SUBMITTING

## Contributors
<!--
We use this section to recognize and promote your contributions. Please provide one author per line -- even if you worked together on it.

We'll only use the info you provided here. Make sure to include your full name, not just your GitHub username.

Provide a link to your GitHub profile to help others find more cool things you have done.

If you provide a link to your Twitter profile, we'll promote your contribution on social media.

If you do not update this information, you will not be listed 😞
-->

* [Author Name](LinkToYourGitHubProfile)

## Version history

Version|Date|Comments
-------|----|--------
1.1|August 10, 2023|Update comment
1.0|June 29, 2023|Initial release

## Prerequisites

<!--
Any special pre-requisites? Include any lists, permissions, offerings to the demo gods, or whatever else needs to be done for this web part to work.

Please describe the steps to configure the pre-requisites. Feel free to add screen shots, but make sure that there is a text description of the steps to perform.
 
-->

## Minimal Path to Awesome

<!-- 
PRO TIP:

For commands, use the `code syntax`

For button labels, page names, dialog names, etc. as they appear on the screen, use **Bold**

Don't use "click", use "select" or "use"

As tempting as it may be, don't just use images to describe the steps. Let's be as inclusive as possible and think about accessibility.

-->

* Clone this repository (or [download this solution as a .ZIP file](https://pnp.github.io/download-partial/?url=https://github.com/pnp/sp-dev-fx-extensions/tree/main/samples/YOUR-SOLUTION-NAME) then unzip it)
* in the command line run:
  * `npm install`
  * `gulp serve`

> Include any additional steps as needed.
> DELETE THIS PARAGRAPH BEFORE SUBMITTING

## Features

Description of the extension with possible additional details than in short summary.
This extension illustrates the following concepts:

* topic 1
* topic 2
* topic 3

## Debug URL for testing

Here's a debug URL for testing around this sample.

```
?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={"7c5a85c1-8b1e-4370-8198-642908faee60":{"location":"ClientSideExtension.ApplicationCustomizer","properties":{"testMessage":"Hello as property!"}}}
```

> Update based on your manifest id for easy testing of the sample
> Note that better pictures and documentation will increase the sample usage and the value you are providing for others. Thanks for your submissions inadvance! You rock ❤.
> DELETE THIS PARAGRAPH BEFORE SUBMITTING

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Help

<!--
You can just search and replace this page with the following values:

Search for:
YOUR-SOLUTION-NAME

Replace with your sample folder name. E.g.: react-my-cool-sample

Search for:
@YOURGITHUBUSERNAME

Replace with your GitHub username, prefixed with an "@". If you have more than one author, use %20 to separate them, making sure to prefix everyone's username individually with an "@".

Example:
@hugoabernier

Or:
@hugoabernier%20@VesaJuvonen%20@PopWarner
-->

We do not support samples, but we this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

You can try looking at [issues related to this sample](https://github.com/pnp/sp-dev-fx-extensions/issues?q=label%3AYOUR-SOLUTION-NAME) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this sample](https://github.com/pnp/sp-dev-fx-extensions/discussions?discussions_q=label%3AYOUR-SOLUTION-NAME) and see what the community is saying.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=YOUR-SOLUTION-NAME&authors=@YOURGITHUBUSERNAME&title=YOUR-SOLUTION-NAME%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=question.yml&sample=YOUR-SOLUTION-NAME&authors=@YOURGITHUBUSERNAME&title=YOUR-SOLUTION-NAME%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=suggestion.yml&sample=YOUR-SOLUTION-NAME&authors=@YOURGITHUBUSERNAME&title=YOUR-SOLUTION-NAME%20-%20).

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/YOUR-SOLUTION-NAME" />
