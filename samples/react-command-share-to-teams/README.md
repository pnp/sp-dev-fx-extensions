# Share List, Folder , or File to Teams


## Summary

This feature adds a list view command that lets a user Share the current List or Library, or any Folder or File in it with a Team. The extension grants the Team Members access to the selected object and adds it as a Tab to the selected Teams Channel.

![picture of the extension in action](assets/preview.png)


## Compatibility

![SPFx 1.14](https://img.shields.io/badge/SPFx-1.14-green.svg)
![Node.js v14 | v12](https://img.shields.io/badge/Node.js-v14%20%7C%20v12-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Incompatible](https://img.shields.io/badge/Hosted%20Workbench-Incompatible-red.svg "Does not work with hosted workbench")

## Applies to

* [SharePoint Framework](https://docs.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
* [Microsoft 365 tenant](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)



## Solution

Solution|Author(s)
--------|---------
react-command-share-to-teams |Russell Gove (@russgove) www.linkedin.com/in/russellgove

## Version history

Version|Date|Comments
-------|----|--------
21.0|September 17, 2022|Initial release

## Prerequisites

This app requires access to the following Graph APIs:
 
 * ChannelMessage.Send
 * Team.ReadBasic.All
 * Channel.ReadBasic.All
 * TeamsTab.ReadWriteForTeam
 * TeamsTab.ReadWriteSelfForTeam
 * TeamsTab.ReadWrite.All
 * Sites.Read.All
 * Files.Read

## Minimal Path to Awesome

* Clone this repository
* in the command line run:
  * `npm install`
  * `gulp serve`


## Features

This feature adds a list view command that lets a user Share the current List or Library, or any Folder or File in it to a Team. 
This is particularly useful if you have a file, or a set of files that need to be accessed or updated by multiple teams. The file(s)
can remain in your central repository, but members of your chosen teams can access the file(s) from within their respective teams. This way you have a 'single source of truth' for all your documents.

Teams has multiple ways to add Tabs for  content that resides in SharePoint with Teams members as outlined in this article: https://docs.microsoft.com/en-us/graph/teams-configuring-builtin-tabs.

This command set enables each of the above  options from within SharePoint.

As noted in the article above, when adding a file tab you have the option of using the Teams Word, Excel, PowerPoint, and PDF built-in tabs (com.microsoft.teamspace.tab.file.staticviewer.word, .excel, .powerpoint, .pdf) or we can use the built in  'SharePoint page and list tabs'(2a527703-1f6f-4559-a332-d8a7d288cd88) to show a SharePoint page that shows the document.

The configuration parameter called 'fileSharingMethod' controls which type of tab is added for files. Setting fileSharingMethod to 'page' causes the app to add file tabs using the 'SharePoint page and list tabs'(teamsAppId 2a527703-1f6f-4559-a332-d8a7d288cd88).A sample is shown here:
![file displayed in page mode](assets/filepage.png)

Setting fileSharingMethod to 'native' causes the app to add file tabs using the Teams Word, Excel, PowerPoint, and PDF built-in tabs (teamsAppId com.microsoft.teamspace.tab.file.staticviewer.word, .excel, .powerpoint, .pdf). A sample is shown here:
![file displayed in native mode](assets/filenative.png)
For non-Office documents, the app will revert to showing the file using the 'SharePoint page and list tabs'(teamsAppId 2a527703-1f6f-4559-a332-d8a7d288cd88)


You can also disable file sharing completely by setting allowFileSharing to false. You can also set the specific file extensions you want to allow sharing be setting the supportedFileTypes property.

The configuration parameters called 'librarySharingMethod' and 'folderSharingMethod' control which type of tab is added for libraries and folders. Setting librarySharingMethod to 'page' causes the app to add library tabs using the 'SharePoint page and list tabs'(teamsAppId 2a527703-1f6f-4559-a332-d8a7d288cd88). A sample is shown here:
![library displayed in page mode](assets/librarypage.png)
Note that in 'page' mode, a limited header bar is shown with the SharePoint commands and the columns can be sorted and filtered and grouped. You can also select which view you would like to show in the Teams Tab. No Open in SharePoint button is shown when viewers in teams.

Setting librarySharingMethod to 'native' causes the app to add file tabs using the Document library tabs built-in tabs (teamsAppId com.microsoft.teamspace.tab.files.sharepoint). The same setup works for folders as well using 'folderSharingMethod'  A sample is shown here:
![library displayed in native mode](assets/libraryNative.png)
Note that in 'native' mode, the SharePoint header bar is replaced with a header bar created by the Teams app and includes the Open in SharePoint button. The columns can be sorted, but not filtered or grouped. You cannot select a 
view when sharing using this method. 


You can also disable library and folder sharing completely by setting allowLibrarySharing and allowFolderSharing to false.

If you do not have permissions to share the selected library, folder, or file, the Share To Teams command will be unavailable because you do not have permission to alter permissions. When you share a library, folder, or file the the app breaks role inheritance on the object and grants the O365 Group backing the Team the permission you selected on the given object,

Also, if you select a team that you do not have permissions to add tabs to you will get an error message stating so:
![library displayed in native mode](assets/noPermissions.png)


Notes: 
1. If the SharePint site does not allow external Sharing, team members outside your domain (guests) will not be able to view the items shared.

2. If you share something with a Teams Private Channel, all members of the Team are granted access to the item.

## Debug URL for testing

Here's a debug URL for testing around this sample.

```
?debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fmanifests.js&loadSPFX=true&customActions=%7B%2202b09893-193a-47bb-85e6-0280fbfd41dc%22%3A%7B%22location%22%3A%22ClientSideExtension.ListViewCommandSet.CommandBar%22%2C%22properties%22%3A%7B%22supportedFileTypes%22%3A%22doc%2C+docx%2C+pdf%2C+ppsx%2C+ppt%2C+pptx%2C+jpg%2C+jpeg%2C+png%2C+xls%2C+xlsx%2C+txt%2C+html%2C+gif%2C+aspx%22%2C%22allowListSharing%22%3Atrue%2C%22allowFolderSharing%22%3Atrue%2C%22allowFileSharing%22%3Atrue%2C%22librarySharingMethod%22%3A%22page%22%2C%22folderSharingMethod%22%3A%22page%22%2C%22fileSharingMethod%22%3A%22native%22%7D%7D%7D
```



## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## Help

We do not support samples, but we this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

You can try looking at [issues related to this sample](https://github.com/pnp/sp-dev-fx-extensions/issues?q=label%3Areact-command-share-to-teams) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this sample](https://github.com/pnp/sp-dev-fx-extensions/discussions?discussions_q=label%3Areact-command-share-to-teams) and see what the community is saying.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=bug-report.yml&sample=Yreact-command-share-to-teams&authors=@russgove&title=react-command-share-to-teams%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=question.yml&sample=react-command-share-to-teams&authors=@russgove&title=react-command-share-to-teams%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-extensions/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&template=suggestion.yml&sample=react-command-share-to-teams&authors=@russgove&title=react-command-share-to-teams%20-%20).

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/readme-template" />
