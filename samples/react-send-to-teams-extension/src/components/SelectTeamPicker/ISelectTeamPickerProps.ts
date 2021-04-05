import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ExtensionContext } from "@microsoft/sp-extension-base";
import { IBasePickerStyles, IPickerItemProps, ISuggestionItemProps, ITag } from "office-ui-fabric-react";
export interface ISelectTeamPickerProps {
  appcontext:  WebPartContext |  ExtensionContext;
  onSelectedTeams: (tagsList:ITag[]) => void;
  selectedTeams: ITag[];
  itemLimit?: number;
  label?:string;
  styles?:IBasePickerStyles ;
}
