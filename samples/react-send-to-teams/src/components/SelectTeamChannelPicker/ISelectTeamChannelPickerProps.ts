import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ExtensionContext } from "@microsoft/sp-extension-base";
import { IBasePickerStyles, IPickerItemProps, ISuggestionItemProps, ITag } from "office-ui-fabric-react";
export interface ISelectTeamChannelPickerProps {
  teamId:string | number;
  appcontext:  WebPartContext |  ExtensionContext;
  onSelectedChannels: (tagsList:ITag[]) => void;
  selectedChannels?: ITag[];
  itemLimit?: number;
  label?:string;
  styles?:IBasePickerStyles ;

}
