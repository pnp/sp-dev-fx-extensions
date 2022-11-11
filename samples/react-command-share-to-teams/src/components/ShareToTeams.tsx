import { ChatMessage, Drive, DriveItem, TeamsTab } from "@microsoft/microsoft-graph-types";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { IListViewCommandSetExecuteEventParameters } from "@microsoft/sp-listview-extensibility";
import { graphfi, SPFx as SPFxGR } from "@pnp/graph";
import "@pnp/graph/";
import "@pnp/graph/groups";
import "@pnp/graph/onedrive";
import "@pnp/graph/sites";
import { Site } from "@pnp/graph/sites";
import "@pnp/graph/sites/types";
import "@pnp/graph/teams";
import "@pnp/graph/users";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/folders";
import "@pnp/sp/items";
import { IItem } from "@pnp/sp/items";
import "@pnp/sp/lists";
import { IList } from "@pnp/sp/lists";
import "@pnp/sp/security";
import { IBasePermissions, IRoleDefinitionInfo, PermissionKind } from "@pnp/sp/security";
import "@pnp/sp/security/web";
import { ISiteUserProps } from "@pnp/sp/site-users/types";
import "@pnp/sp/site-users/web";
import "@pnp/sp/views";
import { IViewInfo } from "@pnp/sp/views";
import "@pnp/sp/webs";
import { TeamChannelPicker } from "@pnp/spfx-controls-react/lib/TeamChannelPicker";
import { TeamPicker } from "@pnp/spfx-controls-react/lib/TeamPicker";
import { filter, find } from "lodash";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { ChoiceGroup } from "office-ui-fabric-react/lib/ChoiceGroup";
import { Label } from "office-ui-fabric-react/lib/Label";
import { List as FList } from "office-ui-fabric-react/lib/List";
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Panel } from "office-ui-fabric-react/lib/Panel";
import { ITag } from "office-ui-fabric-react/lib/Pickers";
import { Spinner } from "office-ui-fabric-react/lib/Spinner";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import * as React from "react";
import { useEffect } from "react";
import { IShareToTeamsCommandSetProperties } from "../extensions/shareToTeams/ShareToTeamsCommandSet";
import { ShareType } from "../model/model";


// import "@pnp/graph/onedrive";
export interface IShareToTeamsProps {

  onClose: () => void;
  context: BaseComponentContext;
  event: IListViewCommandSetExecuteEventParameters;
  settings: IShareToTeamsCommandSetProperties;
  isOpen: boolean
}
export function ShareToTeamsContent(props: IShareToTeamsProps) {
  const sp = spfi().using(SPFx(props.context));
  const graph = graphfi().using(SPFxGR(props.context));
  const [shareType, setShareType] = React.useState<ShareType>(null);
  //const [shareMethod, setShareMethod] = React.useState<ShareMethod>(0);
  const [item, setItem] = React.useState<any>(null);

  const [canManageTabs, setCanManageTabs] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedTeam, setSelectedTeam] = React.useState<ITag[]>([]);
  const [selectedTeamChannels, setSelectedTeamChannels] = React.useState<ITag[]>([]);
  const [roleDefinitionInfos, setRoleDefinitionInfos] = React.useState<IRoleDefinitionInfo[]>([]);
  const [selectedRoleDefinitionId, setSelectedRoleDefinitionId] = React.useState<number>(null);
  const [folderServerRelativePath, setFolderServerRelativePath] = React.useState<string>(null);
  const [userCanManagePermissions, setUserCanManagePermissions] = React.useState<boolean>(false);
  const [allViews, setAllViews] = React.useState<IViewInfo[]>([]);
  const [selectedViewId, setSelectedViewId] = React.useState<string>(null);
  const [tabName, setTabName] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");
  const [libraryName, setLibraryName] = React.useState<string>("");
  const [library, setLibrary] = React.useState<IList>(null);
  const [chatMessageText, setChatMessageText] = React.useState<string>("");
  const [teamPermissions, setTeamPermissions] = React.useState<IBasePermissions>(null);

  useEffect(() => {

    // declare the data fetching function
    const fetchData = async () => {
      //const sp = spfi().using(SPFx(props.context));
      const urlParams = new URLSearchParams(window.location.search);
      //TODO: save view enhancements to state and reapply isAscending=true sortField=LinkFilename FilterFields1=testcol1 FilterValues1=a%3B%23b FilterTypes1=Text       let locFolderServerRelativePath = urlParams.get("id")
      let folderServerRelativePathFromUrl = urlParams.get("id")
      const viewIdFromUrl = urlParams.get("viewid");
      const locListId = props.context.pageContext.list.id.toString();
      let locItemId: number;
      setLibrary(await await sp.web.lists
        .getById(locListId).expand('RootFolder')());

      //  figure out what type of share we are dealing with
      if (props.event.selectedRows.length === 1) {
        locItemId = parseInt(props.event.selectedRows[0].getValueByName("ID"))
        // they selected an item. Need to see if its a folder or a documnent
        let locItem: IItem = await sp.web.lists
          .getById(locListId)
          .items.getById(locItemId)
          .expand("File", "Folder")
          .select("GUID", "Id", "Title", "EffectiveBasePermissions", "File_x0020_Type", "FileSystemObjectType", "ServerRedirectedEmbedUrl", "File/Name", "File/LinkingUrl", "File/ServerRelativeUrl", "Folder/ServerRelativeUrl", "Folder/Name")
          .expand("File", "Folder")
          ();

        setUserCanManagePermissions(sp.web.hasPermissions(locItem["EffectiveBasePermissions"], PermissionKind.ManagePermissions));

        if (locItem["FileSystemObjectType"] == 1) {
          // its a folder

          setShareType(ShareType.Folder);
          //setShareMethod(ShareMethod.ChannelTab);// cant share a  folder in a chat
          setFolderServerRelativePath(locItem["Folder"]["ServerRelativeUrl"]);

          setTabName(props.context.pageContext.list.title);// see if user has permissions to share this folder
          setTitle(`Sharing folder ${locItem["Folder"]["Name"]} to Teams`);

        } else {
          // its a document
          setItem(locItem);
          setShareType(ShareType.File);
          setTabName(locItem["File"]["Name"]);
          setTitle(`Sharing file ${locItem["File"]["Name"]} to Teams`);
        }
      } else {

        if (folderServerRelativePathFromUrl) {
          // they are within a folder
          setFolderServerRelativePath(folderServerRelativePathFromUrl);

          setShareType(ShareType.Folder);
         // setShareMethod(ShareMethod.ChannelTab);// cant share a  folder in a chat
          await sp.web.getFolderByServerRelativePath(folderServerRelativePathFromUrl)
            .expand("ListItemAllFields/EffectiveBasePermissions")()
            .then(folder => {
              setUserCanManagePermissions(sp.web.hasPermissions(folder["ListItemAllFields"]["EffectiveBasePermissions"], PermissionKind.ManagePermissions));
              setTitle(`Sharing folder ${folder["Name"]} to Teams`);
            });
        } else {
          // they are at the root of the list
          setShareType(ShareType.Library)
          //setShareMethod(ShareMethod.ChannelTab);// cant share a  library in a chat

          await sp.web.lists.getById(locListId).select("Title", "EffectiveBasePermissions")()
            .then(list => {


              const userCanManagePermissions = (sp.web.hasPermissions(list["EffectiveBasePermissions"], PermissionKind.ManagePermissions));
              setUserCanManagePermissions(userCanManagePermissions);
              setTitle(`Sharing list ${list["Title"]} to Teams`);
            });
        }

      }

      setLibraryName(props.context.pageContext.list.title);

      setSelectedViewId(viewIdFromUrl);
      await getListViews(sp, viewIdFromUrl);
      await getRoleDefs(sp);
      setIsLoading(false);
    }

    setIsLoading(true);
    setChatMessageText("");
    fetchData()

      .then(() => { setIsLoading(false) })
      .catch(console.error);
  }, [props.event]);
  async function ensureTeamsUser(sp: SPFI, teamId: string): Promise<ISiteUserProps> {

    // const group = await graph.groups.getById(teamId)();
    const user = await sp.web.ensureUser(getTeamLoginName(teamId));
    console.dir(user);
    return user.data;
  }
  function getTeamLoginName(teamId: string): string {
    return `c:0o.c|federateddirectoryclaimprovider|${teamId}`;
  }

  async function shareToTeams() {
debugger;

    const teamId: string = selectedTeam[0].key as string;
    const channelId: string = selectedTeamChannels[0].key as string;
    const channel = await graph.teams.getById(teamId).channels.getById(channelId);
    const channelTabs = await graph.teams.getById(teamId).channels.getById(channelId).tabs;
    // switch (shareMethod) {
    //   case ShareMethod.ChannelTab:
        let [teamsTab, appUrl] = await getTeamsTabConfig();
        teamsTab.displayName = tabName;
        switch (shareType) {
          case ShareType.Library:
            await grantTeamMembersAcessToLibrary(teamId, selectedRoleDefinitionId);
            break;
          case ShareType.Folder:
            await grantTeamMembersAcessToFolder(teamId, selectedRoleDefinitionId);
            break;
          case ShareType.File:
            await grantTeamMembersAcessToItem(teamId, selectedRoleDefinitionId);
            break;
        }
        await channelTabs.add('Tab', appUrl, teamsTab)
          .then((t) => {
            channel.messages({ body: { content: `I added a new tab named '${tabName}' to this channel.` } });
          })
          .catch((e) => {
            debugger;
            alert(e.message);
          });


    //     break;
    //   // case ShareMethod.ChannelMessage:
    //   //   let chatMessage: ChatMessage = await getChatMessageConfig();

    //   //   switch (shareType) {
    //   //     case ShareType.Library:
    //   //       await grantTeamMembersAcessToLibrary(teamId, selectedRoleDefinitionId);
    //   //       break;

    //   //     case ShareType.Folder:
    //   //       await grantTeamMembersAcessToFolder(teamId, selectedRoleDefinitionId);
    //   //       break;

    //   //     case ShareType.File:
    //   //       await grantTeamMembersAcessToItem(teamId, selectedRoleDefinitionId);
    //   //       break;
    //   //   }

    //   //   channel.messages(chatMessage);
    //   //   break;
    //   default:
    //     alert('Invalid Share Method')
    // }
    props.onClose();
  }
  async function getTeamsTabConfig(): Promise<[TeamsTab, string]> {
    //teams app ids:(https://docs.microsoft.com/en-us/graph/teams-configuring-builtin-tabs)
    //com.microsoft.teamspace.tab.files.sharepoint  documment library tab
    //2a527703-1f6f-4559-a332-d8a7d288cd88 is SharePoint page and list tabs
    //com.microsoft.teamspace.tab.file.staticviewer.word  Note docs are WRONG, entityID needsto be null
    //com.microsoft.teamspace.tab.file.staticviewer.excel
    //com.microsoft.teamspace.tab.file.staticviewer.powerpoint
    //com.microsoft.teamspace.tab.file.staticviewer.pdf
    //
    const teamsTab: TeamsTab = { displayName: tabName };
    switch (shareType) {
      case ShareType.Library:
        switch (props.settings.librarySharingMethod) {
          case "native":
            teamsTab.configuration = {
              contentUrl: `${document.location.origin}${library["RootFolder"]["ServerRelativeUrl"]}`,
            }
            return [teamsTab, 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/com.microsoft.teamspace.tab.files.sharepoint'];
            break;
          case "page":
            let lView = find(allViews, (view) => view.Id === selectedViewId)
            const libContentUrl = `${document.location.origin}${lView.ServerRelativeUrl}`;
            teamsTab.configuration = {
              contentUrl: libContentUrl,
            }
            return [teamsTab, 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/2a527703-1f6f-4559-a332-d8a7d288cd88'];
            break;

        }


      case ShareType.Folder:
        // switch (props.settings.librarySharingMethod) {
        //   case "page":
        let fview = find(allViews, (view) => view.Id === selectedViewId)
        let folderContentUrl = `${document.location.origin}${fview.ServerRelativeUrl}?id=${folderServerRelativePath}`;
        teamsTab.configuration = {
          contentUrl: folderContentUrl,
        }
        return [teamsTab, 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/2a527703-1f6f-4559-a332-d8a7d288cd88'];
      //   break;
      // case "native":
      //   // OK, so this is not working. I would need to give the user api level access to the library. Not worth the effort!
      //   teamsTab.configuration = {
      //     contentUrl: `${document.location.origin}${library["RootFolder"]["ServerRelativeUrl"]}`,
      //   }
      //   return [teamsTab, 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/com.microsoft.teamspace.tab.files.sharepoint'];
      //   break;
      // }
      case ShareType.File:
        switch (props.settings.fileSharingMethod) {
          case "native":

            teamsTab.configuration = {
              contentUrl: `${document.location.origin}${item["File"]["ServerRelativeUrl"]}`,
              entityId: null // dont believe the docs
            }
            var appurl: string = null;
            switch (item['File_x0020_Type']) {
              case "docx":
                appurl = 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/com.microsoft.teamspace.tab.file.staticviewer.word';
                break;
              case "xlsx":
                appurl = 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/com.microsoft.teamspace.tab.file.staticviewer.excel';
                break;
              case "pdf":
                appurl = 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/com.microsoft.teamspace.tab.file.staticviewer.pdf';
                break;
              case "pptx":
                appurl = 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/com.microsoft.teamspace.tab.file.staticviewer.pptx';
                break;
              default:
                // maybe will work for text. works for doc and xls
                appurl = 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/2a527703-1f6f-4559-a332-d8a7d288cd88';
            }

            return [teamsTab, appurl]

          case "page":

            // const sp = spfi().using(SPFx(props.context));
            const roledefinition = find(roleDefinitionInfos, x => x.Id === selectedRoleDefinitionId);
            let fileContentUrl = "";
            if (roledefinition.RoleTypeKind >= 3) { //0-none, 1-guest, 2-reader, 3-contribure, 4-designer, 5-administrator,6 editor https://docs.microsoft.com/en-us/previous-versions/office/sharepoint-csom/ee536725(v=office.15)
              fileContentUrl = await sp.web.lists.getById(props.context.pageContext.list.id.toString())
                .items.getById(item["Id"]).getWopiFrameUrl(1);//update mode in word
            }
            else {
              fileContentUrl = await sp.web.lists.getById(props.context.pageContext.list.id.toString())
                .items.getById(item["Id"]).getWopiFrameUrl(0);//read only in word
            }
            teamsTab.configuration = {
              contentUrl: fileContentUrl,
            }
            return [teamsTab, 'https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/2a527703-1f6f-4559-a332-d8a7d288cd88'];
        }


    }

  }
  // async function getChatMessageConfig(): Promise<ChatMessage> {
  //   debugger;
  //   let chatMessage: ChatMessage = {}
  //   switch (shareType) {
  //     case ShareType.Library:
  //       //alert("cannot share library in chat")
  //       const attachId1 = "1";
  //       chatMessage = {
  //         "body": {
  //           "contentType": "html",
  //           "content": `${chatMessageText} <attachment id="${attachId1}"></attachment>`
  //         },
  //         "attachments": [
  //           {
  //             "id": null,
  //             "contentType": "reference",
  //             "contentUrl": document.location.origin + library["RootFolder"]["ServerRelativeUrl"],
  //             "name": "Test"
  //           }
  //         ]
  //       }
  //       break;
  //     case ShareType.Folder:
  //       alert("cannot share  folder in chat")
  //       break;
  //     case ShareType.File:
  //       const site = graph.sites.getById(props.context.pageContext.site.id.toString());
  //       const drives: Drive[] = await Site(site, "drives?$select=name,id")();
  //       const drivex = find(drives, (d) => { return d.name === libraryName });
  //       const fileLibraryRelativeUrl = item.File.ServerRelativeUrl.replace(library["RootFolder"]["ServerRelativeUrl"], '');
  //       const driveItem: DriveItem = await Site(site, `drives/${drivex.id}/root:${fileLibraryRelativeUrl}`)() as DriveItem;
  //       // driveitem.tag looks like this:"{A24C417C-469A-4CE8-B176-C254D44E67FB},10" (WITH the quotes...wtf)
  //       const attachId = driveItem.eTag.replace("\"", "").split(",")[0].replace("{", "").replace("}", "");
  //       chatMessage = {
  //         "body": {
  //           "contentType": "html",
  //           "content": `${chatMessageText} <attachment id="${attachId}"></attachment>`
  //         },
  //         "attachments": [
  //           {
  //             "id": attachId,
  //             "contentType": "reference",
  //             "contentUrl": document.location.origin + item.File.ServerRelativeUrl,
  //             "name": driveItem.name
  //           }
  //         ]
  //       }
  //       break;
  //   }
  //   return chatMessage;
  // }
  function hasPermissions(existingPermissions: any, requiredPermissions: any) { // high and low are strings , not numbers!
    // see : https://www.w3schools.com/js/js_bitwise.asp
    // and  : https://www.darraghoriordan.com/2019/07/29/bitwise-mask-typescript/
    const eHi = parseInt(existingPermissions["High"], 10);
    const eLo = parseInt(existingPermissions["Low"], 10);
    const rHi = parseInt(requiredPermissions["High"], 10);
    const rLo = parseInt(requiredPermissions["Low"], 10);

    const hasPerms =
      (rHi & eHi) === rHi
      &&
      (rLo & eLo) === rLo;

    return hasPerms;
  }
  async function grantTeamMembersAcessToLibrary(teamId: string, roleDefinitionId: number) {
    debugger;
    //const sp = spfi().using(SPFx(props.context));
    const siteUser = await ensureTeamsUser(sp, teamId);
    const roledefinition = find(roleDefinitionInfos, x => x.Id === roleDefinitionId);

    const teamPermissions = await sp.web.lists
      .getById(props.context.pageContext.list.id.toString()).getUserEffectivePermissions(siteUser.LoginName);
    //const teamHasPermissions = await sp.web.hasPermissions(teamPermissions, roledefinition.RoleTypeKind);// does not work. View-only  Permission 
    //  console.log(teamHasPermissions); 

    const hasem = hasPermissions(teamPermissions, roledefinition.BasePermissions)

    console.log(teamPermissions);
    console.log(roledefinition.BasePermissions);

    debugger;
    if (!hasem) {
      await await sp.web.lists
        .getById(props.context.pageContext.list.id.toString())
        .breakRoleInheritance(true, false);
      await sp.web.lists
        .getById(props.context.pageContext.list.id.toString())
        .roleAssignments.add(siteUser.Id, roleDefinitionId);
    }
  }
  async function grantTeamMembersAcessToFolder(teamId: string, roleDefinitionId: number) {
    //const sp = spfi().using(SPFx(props.context));
    const siteUser = await ensureTeamsUser(sp, teamId);
    const roledefinition = find(roleDefinitionInfos, x => x.Id === roleDefinitionId);
    const folder = await sp.web.getFolderByServerRelativePath(folderServerRelativePath).getItem()
    const teamPermissions = await folder.getUserEffectivePermissions(siteUser.LoginName);
    const teamHasPermissions = await sp.web.hasPermissions(teamPermissions, roledefinition.RoleTypeKind);

    if (!teamHasPermissions) {
      await folder.breakRoleInheritance(true, false);
      await folder.roleAssignments.add(siteUser.Id, roleDefinitionId);
    }
  }
  async function grantTeamMembersAcessToItem(teamId: string, roleDefinitionId: number) {
    // const sp = spfi().using(SPFx(props.context));
    const siteUser = await ensureTeamsUser(sp, teamId);
    const roledefinition = find(roleDefinitionInfos, x => x.Id === roleDefinitionId);
    const selectedItem = await sp.web.lists.getById(props.context.pageContext.list.id.toString())
      .items.getById(item["Id"]);

    const teamPermissions = await selectedItem.getUserEffectivePermissions(siteUser.LoginName);
    const teamHasPermissions = await sp.web.hasPermissions(teamPermissions, roledefinition.RoleTypeKind);

    if (!teamHasPermissions) {
      await selectedItem.breakRoleInheritance(true, false);
      await selectedItem.roleAssignments.add(siteUser.Id, roleDefinitionId);
    }
  }


  async function getRoleDefs(sp) {
    // get the role definitions for the current web -- now full condtrol or designer
    await sp.web.roleDefinitions
      .filter("BasePermissions ne null and Hidden eq false and RoleTypeKind ne 4 and RoleTypeKind ne 5 and RoleTypeKind ne 6")  // 4 is designer, 5 is admin, 6 is editor
      .orderBy("Order", true)
      ().then((roleDefs: IRoleDefinitionInfo[]) => {

        setRoleDefinitionInfos(roleDefs);
      }).catch(err => {

        console.log(err);
      });
  }
  async function getListViews(sp, viewId: string) {
    await sp.web.lists
      .getById(props.context.pageContext.list.id.toString())
      .views().then(views => {

        setAllViews(views.filter(v => v.Hidden === false));
        if (!viewId) {
          const viewFromPageUrl = find(views, (v) => {
            return v.ServerRelativeUrl === decodeURIComponent(document.location.pathname);
          });
          if (viewFromPageUrl) {
            setSelectedViewId(viewFromPageUrl.Id);
          }

          // dunno what view to use, so use the first one
          else {
            setSelectedViewId(views[0].Id);
          }
        }
      });
  }
  if (isLoading) {
    return (
      <Panel
        isOpen={props.isOpen}
        onDismiss={props.onClose}
        headerText={title}

      ><Spinner label="Loading..."></Spinner></Panel>

    )
  }

  const cantManageTabsMessage =
    !canManageTabs && selectedTeam.length > 0 &&
    <MessageBar messageBarType={MessageBarType.error}>
      You do not have permission to create tabs in this team.
    </MessageBar>;
  const existingPermissionsMessage =
    teamPermissions !== null &&
    <div>
      <Label>This Team currently has these permissions on this  {ShareType[shareType]}</Label>
      <FList
        items={filter(roleDefinitionInfos, rd => hasPermissions(teamPermissions, rd.BasePermissions))}
        onRenderCell={(item?, index?: number, isScrolling?: boolean) => {

          return (
            <div>
              {item.Description}
            </div>
          );
        }} />
    </div>;
  const noExistingPermissionsMessage =
    teamPermissions === null &&
    <Label>This Team currently has no permissions on this  {ShareType[shareType]}</Label>;
  const cantShareMessage = !userCanManagePermissions && !isLoading &&
    <MessageBar messageBarType={MessageBarType.blocked}>
      You do not have permission to share this. Please contact a site owner to share.
    </MessageBar>;
  return (
    <Panel
      isOpen={props.isOpen}
      onDismiss={props.onClose}
      headerText={title}
    >
      <div>
        {cantShareMessage}
        {/* {title}<br />
        Teams Permission Hi is {teamPermissions ? teamPermissions.High : ""} low is{teamPermissions ? teamPermissions.Low : ""}<br />
        ShareType is {ShareType[shareType]}<br />
        shareMethod is {ShareMethod[shareMethod]} ({shareMethod})<br />
        Library  is {libraryName}<br />
        folderServerRelativePath is {folderServerRelativePath}<br />
        ViewId is {selectedViewId}<br />
        userCanManagePermissions is {userCanManagePermissions ? "true" : "false"}<br />
        selectedRoleDefinitionId is {selectedRoleDefinitionId}<br />
        selectedTems.lens {selectedTeam.length}<br />
        canManageTabs is {canManageTabs ? "true" : "false"}<br /> */}
        <TeamPicker label={`What Team would you like to share this ${ShareType[shareType]} to?`}
          selectedTeams={selectedTeam}
          appcontext={props.context}
          itemLimit={1}

          onSelectedTeams={async (tagList: ITag[]) => {
            setSelectedTeam(tagList);
            setTeamPermissions(null);
            setSelectedTeamChannels([]); // deselect any channel;s from old team
            setCanManageTabs(true); // avoid flashing message that appears until we figure out if he has permissions
            graph.teams.getById(tagList[0].key.toString())()
              .then(team => {

                if (team.memberSettings.allowCreateUpdateRemoveTabs) {
                  //setSelectedTeam(tagList);
                  setCanManageTabs(true);
                }
                else {
                  graph.groups.getById(tagList[0].key.toString()).expand("owners").select("owners")()
                    .then(group => {
                      // if user is owner of the group, then they can manage tabs
                      for (const owner of group.owners) {
                        if (owner["userPrincipalName"].toLowerCase() === props.context.pageContext.user.loginName.toLowerCase()) {
                          setCanManageTabs(true);
                          return;
                        }
                      }
                      // setSelectedTeam(tagList);
                      setCanManageTabs(false);
                    })
                    .catch(err => { // if you cant get the owners, you ain't an owner
                      debugger
                      //setSelectedTeam(tagList);
                      setCanManageTabs(false);

                    });

                }
              })
              .catch(err => {
                console.log(err);
              });
            // get the teams permissions
            const teamsLoginName = getTeamLoginName(tagList[0].key as string);
            switch (shareType) {
              case ShareType.Library:
                setTeamPermissions(await sp.web.lists
                  .getById(props.context.pageContext.list.id.toString()).getUserEffectivePermissions(teamsLoginName));
                break; //gimme a break!
              case ShareType.File:
                const selectedItem = await sp.web.lists.getById(props.context.pageContext.list.id.toString())
                  .items.getById(item["Id"]);
                debugger;
                setTeamPermissions(await selectedItem.getUserEffectivePermissions(teamsLoginName));
                debugger;
                break; //gimme a break!
              case ShareType.Folder:
                const folder = await sp.web.getFolderByServerRelativePath(folderServerRelativePath).getItem()
                setTeamPermissions(await folder.getUserEffectivePermissions(teamsLoginName));
                break; //gimme a break!
              default:
                setTeamPermissions(null)
            }
          }}
        />
        {cantManageTabsMessage}
        <TeamChannelPicker label={`What Channel would you like to share this ${ShareType[shareType]}  to?`}
          teamId={selectedTeam.length > 0 ? selectedTeam[0].key : null}
          selectedChannels={selectedTeamChannels}
          appcontext={props.context}
          itemLimit={1}
          onSelectedChannels={(tagList: ITag[]) => {
            setSelectedTeamChannels(tagList);
          }} />
        {/* {shareType === ShareType.File &&  // cant share a  folder or library in a chat
          <ChoiceGroup
            label="How would you like to share this?"
            title="View"
            options={[
              { key: "0", text: "In a tab", },
              { key: "1", text: "In a chat", } // could us a sharing link to share this in a chat maybe???
            ]}
            selectedKey={shareMethod.toString()}
            onChange={(e, o) => {
              setShareMethod(parseInt(o.key))
            }}
          />
        } */}
        {(shareType === ShareType.Folder || shareType === ShareType.Library) &&
          <ChoiceGroup
            label="Which view would you like to show in the Teams Tab?"
            title="View"
            options={allViews.map(view => { return { key: view.Id, text: view.Title } })}
            selectedKey={selectedViewId}
            onChange={(e, o) => { setSelectedViewId(o.key) }}
          />
        }
        {existingPermissionsMessage}
        {noExistingPermissionsMessage}

        <ChoiceGroup
          label={`What ${teamPermissions ? "additional" : ""} permission would you like give to the members of the ${selectedTeam.length == 0 ? "" : selectedTeam[0].name} team to this ${ShareType[shareType]} ?`}
          title="View"
          options={roleDefinitionInfos.map((rd) => {
            return { key: rd.Id.toString(), text: `${rd.Name} (${rd.Description})` };
          })}
          selectedKey={selectedRoleDefinitionId ? selectedRoleDefinitionId.toString() : null}
          onChange={(e, o) => {
            setSelectedRoleDefinitionId(parseInt(o.key))
          }}
        />
        {/* {shareMethod == ShareMethod.ChannelTab && */}
          <div>
            <TextField label="What would you like the Title of the Teams Tab to be?" onChange={(e, newValue) => { setTabName(newValue) }} value={tabName} />
            <br />
          </div>
        {/* } */}

        {/* {shareMethod == ShareMethod.ChannelMessage &&
          <div>
            <TextField label="What would you like the text of the Chat Message to be?" onChange={(e, newValue) => { setChatMessageText(newValue) }} value={chatMessageText} />
            <br />
          </div>
        } */}
        <PrimaryButton disabled={!canManageTabs || selectedRoleDefinitionId === null || selectedTeam.length == 0 || selectedTeamChannels.length == 0 || tabName.length == 0} onClick={shareToTeams}> Add Tab to Team</PrimaryButton>
      </div>




    </Panel>
  );

}
