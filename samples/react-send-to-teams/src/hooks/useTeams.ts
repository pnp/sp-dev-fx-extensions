import React from "react";
import { ServiceScope } from "@microsoft/sp-core-library";
import { MSGraphClient, MSGraphClientFactory } from "@microsoft/sp-http";
import { PageContext } from "@microsoft/sp-page-context";
import { GlobalStateContext } from "../globalState";
import { Team, User } from "@microsoft/microsoft-graph-types";
import { ITeam } from "./../models";
import { ITeamChannel } from "./../models";
import { ITeamMenber } from "./../models";
import { IChatMessage, Attachment, Body, HostedContents } from "./../models";
import { getGUID } from "@pnp/common";
import { getImageBase64, getUserPhoto } from "../Utils";
import { IUser } from "../models/IUser";
const PROFILE_IMAGE_URL: string = "/_layouts/15/userphoto.aspx?size=S&accountname=";

export const useTeams = (serviceScope: ServiceScope) => {
  let _pageContext = React.useRef<PageContext>();
  let _msgGraphclient = React.useRef<MSGraphClient>();

  const { state, dispatch } = React.useContext(GlobalStateContext);

  const init = React.useCallback(async () => {
    serviceScope.whenFinished(async () => {
      _pageContext.current = serviceScope.consume(PageContext.serviceKey);
      _msgGraphclient.current = await serviceScope
        .consume(MSGraphClientFactory.serviceKey)
        .getClient();
    });
  }, []);

  // constructer
  (async () =>{
      await init();
  })();

  const getMyTeams = React.useCallback(async (filter:string): Promise<ITeam[]> => {
    if (!_msgGraphclient.current) return;
      const teamsResults = await _msgGraphclient.current
      .api(`/me/joinedTeams`)
      .filter(filter ? `startswith(toupper(displayName),toupper('${filter}'))`:'')
      .select('id,displayName')
      .get();
    return teamsResults.value as ITeam[];
  }, []);

  const getTeamMembers = React.useCallback(async (teamId: string): Promise<
    ITeamMenber[]
  > => {
    if (!_msgGraphclient.current) return;
    const usersResults = await _msgGraphclient.current
      .api(`/teams/${teamId}/members`)
      .get();

    return usersResults.value;
  }, []);

  const getTeamOwners = React.useCallback(async (teamId: string): Promise<
  ITeamMenber[]
  > => {
    if (!_msgGraphclient.current) return;
    const usersResults = await _msgGraphclient.current
      .api(`/teams/${teamId}/members`)
      .filter(
        "microsoft.graph.aadUserConversationMember/roles/any(c:c eq 'owner')"
      )
      .get();

    return usersResults?.value as ITeamMenber[];
  }, []);


  const getTeamChannels = React.useCallback(async (teamId: string, filter?:string): Promise<
    ITeamChannel[]
  > => {
    // Get Events using Delta
    if (!_msgGraphclient.current) return;
    const teamsChannelResults = await _msgGraphclient.current
      .api(`/teams/${teamId}/channels`)
      .filter(filter ? `startswith(toupper(displayName),toupper('${filter}'))`:'')
      .get();

    return teamsChannelResults.value as ITeamChannel[];
  }, []);


  const getTeamChannelMessages = React.useCallback(async (teamId: string,channelId:string): Promise<
  IChatMessage[]
> => {
  // Get Events using Delta
  if (!_msgGraphclient.current) return;
  const teamsChannelMessagesResults = await _msgGraphclient.current
    .api(`/teams/${teamId}/channels/${channelId}/messages`)
    .get();

  return teamsChannelMessagesResults.value as IChatMessage[];
}, []);


const sendAdativeCardToTeams =  React.useCallback(async (adaptativeCard: string, teamId:string, channelId:string) => {
  if (!_msgGraphclient.current) return;

const _guid =  getGUID();
 let  adaptativeCardStringify:string = JSON.stringify(adaptativeCard);
 const {cardFieldsWithImages, appContext } = state;
 const siteUrl:string = appContext.pageContext.site.absoluteUrl;
 let hostedContents: HostedContents[] = [];
 let position:number = 1;

  let _body: Body = {
    contentType: "html",
    content: `<attachment id="${_guid}"></attachment>`
  };
// Parse fields that has image (URL imgs and User Fields) to required format of API (Inline photos on Adaptive Card)
  for (const cardFieldWithImage of cardFieldsWithImages){
  switch (cardFieldWithImage.fieldType) {
    case "URL":
      const absoluteImageUrl:string = `${siteUrl}${cardFieldWithImage.fieldValue}`;
      const _base64StringImage = await getImageBase64(absoluteImageUrl);
      hostedContents.push({
        "@microsoft.graph.temporaryId": position.toString(),
        contentBytes : _base64StringImage,
        contentType: "image/png"
      });
      adaptativeCardStringify = adaptativeCardStringify.replace(`${absoluteImageUrl}`, `../hostedContents/${position}/$value`);
      break;
      case "User":
      case "UserMulti":
      for (const user of cardFieldWithImage.fieldValue as any as IUser[]) {
        const absoluteImagePhotoUrl:string = `${siteUrl}${PROFILE_IMAGE_URL}${user.email}` ;
         const _usePhotoB64str: string  = await getUserPhoto(user.email) ;
         position++;
         hostedContents.push({
          "@microsoft.graph.temporaryId": position.toString(),
          contentBytes : _usePhotoB64str,
          contentType: "image/png"
        });
        adaptativeCardStringify = adaptativeCardStringify.replace(`${absoluteImagePhotoUrl}`, `../hostedContents/${position}/$value`);
      }
        break;
    default:
      break;
  }
}
  let _attachment:Attachment[] = [{
       id: _guid,
       contentType: "application/vnd.microsoft.card.adaptive",
       contentUrl: null,
       name: null,
       content:  adaptativeCardStringify,
       thumbnailUrl: null
  }];
// Send Message to Channel
  const sendMessagesResults = await _msgGraphclient.current
    .api(`/teams/${teamId}/channels/${channelId}/messages`)
    .post({
      subject: null,
      body: _body,
      attachments: _attachment,
      hostedContents
    });
},[state.cardFieldsWithImages, state.appContext]);

  return {
    init,
    getMyTeams,
    getTeamMembers,
    getTeamChannels,
    getTeamOwners,
    getTeamChannelMessages,
    sendAdativeCardToTeams
  };
};
