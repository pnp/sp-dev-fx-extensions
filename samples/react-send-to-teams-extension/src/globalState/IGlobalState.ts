
import { ServiceScope } from "@microsoft/sp-core-library";
import { ICardFields, ITeam, ITeamChannel } from "../models";
import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { ITag } from "office-ui-fabric-react/lib/Pickers";
import { IDropdownOption } from "office-ui-fabric-react/lib/Dropdown";
import { IMessageInfo } from "../models/IMessageInfo";

// Global State (Store)
export interface IGlobalState {
  serviceScope: ServiceScope;
  teams: ITeam[];
  teamsChannels:ITeamChannel[];
  hasError:boolean;
  appContext?:ListViewCommandSetContext;
  searchValue?:string;
  filter?:string;
  selectedTeam: ITag[];
  selectedTeamChannel:ITag[];
  messageInfo: IMessageInfo;
  selectedFieldKeys: string[];
  selectedTitle:IDropdownOption;
  selectedSubTitle:IDropdownOption;
  selectedText:string;
  selectedImage:IDropdownOption;
  adaptiveCard:string;
  cardFieldsWithImages:ICardFields[];
  isSendingMessage:boolean;
}
