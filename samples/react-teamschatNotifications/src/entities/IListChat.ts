import { IChat } from './IChat';
export interface IListChat {
  chat: IChat;
  subscriptionId: string;
  hasNotification: boolean;
}
