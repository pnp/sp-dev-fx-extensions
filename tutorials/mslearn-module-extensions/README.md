# Extend the SharePoint user interface with SharePoint Framework extensions

## Summary

SharePoint Framework (SPFx) extensions that customize modern SharePoint pages and lists: an application customizer, a field customizer, and a command set. This tutorial contains the completed code for the exercises in the Microsoft Learn module [Extend the SharePoint user interface with SharePoint Framework extensions](https://learn.microsoft.com/training/modules/sharepoint-spfx-extensions/).

Each project folder contains the completed solution of the exercise that builds it.

| Folder | Microsoft Learn exercise | What it shows |
|---|---|---|
| [SPFxAppCustomizer](SPFxAppCustomizer/README.md) | Create an application customizer extension | Application customizer that adds a header and a footer to modern pages. |
| [SPFxFieldCustomizer](SPFxFieldCustomizer/README.md) | Create a field customizer extension | Field customizer that shows **PercentComplete** values as colored bars. |
| [SPFxCommandSet](SPFxCommandSet/README.md) | Customize lists with command set extensions | Command set that adds buttons to the **Work Status** list command bar. |

![Modern SharePoint page with the header and footer added by the application customizer](assets/preview-spfxappcustomizer.png)

![Work Status list with PercentComplete values shown as colored bars](assets/preview-spfxfieldcustomizer.png)

![Work Status list command bar with the command set buttons](assets/preview-spfxcommandset.png)

## Compatibility

| :warning: Important          |
|:---------------------------|
| Every SPFx version is optimally compatible with specific versions of Node.js. In order to be able to Toolchain this sample, you need to ensure that the version of Node on your workstation matches one of the versions listed in this section. This sample will not work on a different version of Node.|
|Refer to <https://aka.ms/spfx-matrix> for more information on SPFx compatibility.   |

This tutorial is optimally compatible with the following environment configuration:

![SPFx 1.24.1](https://img.shields.io/badge/SPFx-1.24.1-green.svg)
![Node.js v22 | v24 | v26](https://img.shields.io/badge/Node.js-v22%20%7C%20v24%20%7C%20v26-green.svg)
![Toolchain: Heft](https://img.shields.io/badge/Toolchain-Heft-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")

## Applies to

* [SharePoint Framework](https://learn.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
* [Microsoft 365 tenant](https://learn.microsoft.com/sharepoint/dev/spfx/set-up-your-development-environment)
* [Microsoft Learn: Extend the SharePoint user interface with SharePoint Framework extensions](https://learn.microsoft.com/training/modules/sharepoint-spfx-extensions/)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](https://aka.ms/m365/devprogram)

## Contributors

* [Andrew Connell](https://github.com/andrewconnell)

## Version history

|Version|Date|Comments|
|-------|----|--------|
|1.0|November 25, 2026|Initial release|

## Prerequisites

* A modern SharePoint Online site, such as **Product Launch Planning**, to test the extensions on

For the **SPFxFieldCustomizer** project:

* A list named **Work Status** with a number column named **PercentComplete**

For the **SPFxCommandSet** project:

* A list named **Work Status** with a few items

## Minimal path to awesome

* Clone this repository, or [download this tutorial as a .ZIP file](https://pnp.github.io/download-partial/?url=https://github.com/pnp/sp-dev-fx-extensions/tree/main/tutorials/mslearn-module-extensions) and unzip it.
* From your command line, change to the folder of the project you want to run, under `tutorials/mslearn-module-extensions`.
* Ensure that you're using a supported Node.js version. If you use nvm, run `nvm use`.
* Set the `SPFX_SERVE_TENANT_DOMAIN` environment variable to your SharePoint Online domain, for example `contoso.sharepoint.com`. If `config/serve.json` contains `<site-name>` or a site path, change it to a site you can test on.
* In the command line, run:
  * `npm install`
  * `npm run start`
* To build a deployable package, run `npm run build`. The package is saved in the `sharepoint/solution` folder.

## Features

This tutorial illustrates the following concepts on top of the SharePoint Framework:

* Adding a header and footer to modern pages with page placeholders
* Deploying an application customizer tenant-wide with the **Tenant Wide Extensions** list
* Rendering a list column with a field customizer
* Adding buttons to a list command bar with a command set and the `listViewStateChangedEvent` event

## Help

We do not support samples, but this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for community members to volunteer their time and help resolve issues.

If you're having issues building the solution, please run [spfx doctor](https://pnp.github.io/cli-microsoft365/cmd/spfx/spfx-doctor/) from within the solution folder to diagnose incompatibility issues with your environment.

You can try looking at [issues related to this tutorial](https://github.com/pnp/sp-dev-fx-extensions/issues?q=label%3A%22sample%3A%20mslearn-module-extensions%22) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this tutorial](https://github.com/pnp/sp-dev-fx-extensions/discussions?discussions_q=mslearn-module-extensions) and see what the community is saying.

If you encounter any issues using this tutorial, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected%2Csample%3A%20mslearn-module-extensions&template=bug-report.yml&sample=mslearn-module-extensions&authors=@andrewconnell&title=mslearn-module-extensions%20-%20).

For questions regarding this tutorial, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Aquestion%2Csample%3A%20mslearn-module-extensions&template=question.yml&sample=mslearn-module-extensions&authors=@andrewconnell&title=mslearn-module-extensions%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Aenhancement%2Csample%3A%20mslearn-module-extensions&template=suggestion.yml&sample=mslearn-module-extensions&authors=@andrewconnell&title=mslearn-module-extensions%20-%20).

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/tutorials/mslearn-module-extensions" />
