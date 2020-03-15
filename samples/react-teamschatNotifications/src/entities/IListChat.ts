import { IChat } from './IChat';
import { IFacepilePersona } from 'office-ui-fabric-react/lib/Facepile';
export interface IListChat {
  chat: IChat;
  chatMembers: IFacepilePersona[];
  subscriptionId: string;
  hasNotification: boolean;
}
