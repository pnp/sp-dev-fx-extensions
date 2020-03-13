import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { IListChatMessage} from "../../entities/IListChatMessage";

export interface IListNotificationsProps {
  context: ApplicationCustomizerContext;
  listMessages: IListChatMessage[];
  onDismiss:  () =>  void;
  showDialog:boolean;
}
