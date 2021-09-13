# Copy/Move Item(s)

## Summary

This application customizer will display a command button named **Copy/Move Item(s)** in all the custom lists. Using this option, the items can be copied or moved from one list to another within the site.

![React-Command-Copy-Move-Items](./assets/CopyMoveItems.png)

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.11-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

> Nothing is required.

## Solution

Solution|Author(s)
--------|---------
react-command-copy-move-items | Sudharsan K.([@sudharsank](https://twitter.com/sudharsank), [Knowledge Share](https://spknowledge.com/))

## Version history

Version|Date|Comments
-------|----|--------
1.0|September 13, 2021|Initial release

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

> Include any additional steps as needed.

## Features

- Items can be copied or moved on the whole or only selected items.
- Information on the Source and Destination lists are shown including the item count.
- Destination lists can be chosen from the dropdown lists.
- Currently only the below fields are supported for copy or move
    - **Single line of text**
    - **Choice**
    - **Number**
    - **Date and Time**
    - **Yes or No**
- Option to choose the list of fields to be mapped.
- Auto field mapping is done once the destination field is selected (if the internal name of the field is same as source list)
- Technically the copy or move process use the batch method.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
