# share-to-teams - Command Set

## Summary

Share to teams helps us to share files along with folders in document library it also alows us to share pages in the site pages library and last but not the least it allows sharing list items to teams channels or group.

To achieve this we have taken help of the js file provided by microsoft for creating share to teams button for third-party websites. For more details check this [link](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/build-and-test/share-to-teams)

![picture of the extension in action](./assets/SendToTeams.gif)
![picture of the extension in action](./assets/sendToTeams1.png)
![picture of the extension in action](./assets/sendToTeams2.png)
![picture of the extension in action](./assets/sendToTeams3.png)
![picture of the extension in action](./assets/sendToTeams4.png)

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.11-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

> The tenant where the solution is deployed should have access to Microsoft Teams.

## Solution

Solution|Author(s)
--------|---------
Share To Teams | Kunj Sangani (@sanganikunj)

## Version history

Version|Date|Comments
-------|----|--------
1.0|August 14, 2021|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

## Features

This extension illustrates the following concepts:

- Sharing Files and Folders in document library to Teams
- sharing List items to Teams
- sharing site pages to Teams

This would help in collaborating as everyone in group/team can comment and provide some feedback directly into Teams

## Debug URL for testing
Here's a debug URL for testing around this sample. 

```
?debugManifestsFile=https://localhost:4321/temp/manifests.js&loadSPFX=true&customActions={"7b8edeba-e2b4-4992-a1f3-62184b16dcd6":{"location":"ClientSideExtension.ListViewCommandSet.CommandBar"}
```

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
- [Share to Teams](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/build-and-test/share-to-teams)

<img src="https://telemetry.sharepointpnp.com/sp-dev-fx-extensions/samples/js-send-to-teams" />
