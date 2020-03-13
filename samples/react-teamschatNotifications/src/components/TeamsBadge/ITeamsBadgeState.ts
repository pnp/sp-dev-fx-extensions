import { IListChatMessage } from "../../entities/IListChatMessage";

export interface ITeamsBadgeState {
 totalNotifications: number;
 showMessages:boolean;
 listMessages:IListChatMessage[];
}
