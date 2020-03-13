import { IListChatMessage } from "../../entities/IListChatMessage";

export interface IListNotificationsState {
  isLoading: boolean;
  renderMessages:JSX.Element[];
  hasError: boolean;
  messageError: string;
  hideDialog: boolean;

}
