import * as React from "react";
import styles from "./TeamsBadge.module.scss";
import { ITeamsBadgeState } from "./ITeamsBadgeState";
import { ITeamsBadgeProps } from "./ITeamsBadgeProps";
import * as signalR from "@microsoft/signalr";
import { HttpTransportType } from "@aspnet/signalr";
import { Log } from "@microsoft/sp-core-library";
import spservices from "../../services/spservices";
import { IChatNotificationMessage } from "../../entities/IChatNotificationMessage";
import { IListChat } from "../../entities/IListChat";
import * as lodash from "lodash";
import * as moment from "moment";
import { IChatMessage } from "../../entities/IChatMessage";
import { IListChatMessage } from "../../entities/IListChatMessage";
import { ListNotifications } from "../ListNotifications/ListNotifications";
import { PnPClientStorage, setup } from "@pnp/common";
import { TEAMS_IMAGE} from '../../common/constants';
import { IChatMember } from "../../entities/IChatMember";
import { IFacepilePersona } from "office-ui-fabric-react";
import { IUser } from "../../entities/IUser";

const storage = new PnPClientStorage();

export default class TeamsBadge extends React.Component<
  ITeamsBadgeProps,
  ITeamsBadgeState
> {

  private functionAppUrl: string = `${this.props.functionAppUrl}/api`;
  private listChats: IListChat[] = [];
  private listMessages: IListChatMessage[] = [];
  private  _isTimerRunning: boolean = false;

  constructor(props: ITeamsBadgeProps) {
    super(props);
    spservices.init(this.props.context, this.props.functionAppUrl);
    this.state = {
      totalNotifications: 0,
      showMessages: false,
      listMessages: []
    };
  }

  /**
   *  componentDidMount Hook
   *
   * @returns {Promise<void>}
   * @memberof TeamsBadge
   */

  public async componentDidMount(): Promise<void> {
    try {
      // Get user current recent chats
      this._getChats();
      //  get messages local storage
      const _listMessages:IListChatMessage[] = storage.local.get('listMessages');
      this.listMessages = _listMessages  ?  _listMessages : [];
      this.setState({totalNotifications: this.listMessages.length, listMessages: this.listMessages});
      // connect to signalR hub to get notifications on Chat Messages
      let signalRConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.functionAppUrl)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 45000])
        .build();
      signalRConnection.keepAliveIntervalInMilliseconds = 5;
      await signalRConnection.start();
      // Listen for new messages
      signalRConnection.on("newMessage", (data: any) => {
        this.getNotification(data.value);
      });

      // activate timer event to  get new chats messages and changes from existing subsscriptions
      this._getNewChats();
    } catch (error) {
      console.error("Error on load extention: ", error);
    }
  }

  // Get new message notification
  /**
   *
   *
   * @private
   * @memberof TeamsBadge
   */
  private getNotification = async (chatNotifications: IChatNotificationMessage[]): Promise<void> => {
    let { totalNotifications, showMessages } = this.state;
    // force close list when new message arrives
    this.setState({ showMessages: false });
    // get list of chats from local storage
    this.listChats = storage.local.get('listChats');
    //await this._getChats();
    //const chatNotifications: IChatNotificationMessage[] = newMessage;
    for (const chatNotificationMessage of chatNotifications) {
      // Get Message @odata.id  = URI return for message
      const chatMessage: IChatMessage = await spservices.getChatMessage(
        chatNotificationMessage.resourceData["@odata.id"]
      );

      /* // teste if message is the current user, notify only for message from other users
      if (
        this.props.context.pageContext.user.displayName ==
        chatMessage.from.user.displayName
      ) {

       // continue;
      } */
     //
      let index: number = lodash.findIndex(this.listChats, {
        subscriptionId: chatNotificationMessage.subscriptionId
      });

      if (index !== -1) {
        let listChatItem: IListChat = this.listChats[index];

        this.listChats[index] = {
          ...this.listChats[index],
          hasNotification: true
        };
        this.listMessages.push({
          chat: listChatItem.chat,
          chatMessage: chatMessage
        });
      //  console.log("listMessages", this.listMessages);
      }
    }
    // save list of messages in local storage
    storage.local.put('listMessages', this.listMessages, moment().add(1,'days').toDate());
    this.setState({
      totalNotifications: this.listMessages.length,
      listMessages: this.listMessages,
      showMessages: showMessages
    });
  }

  /**
   *
   *
   * @private
   * @memberof TeamsBadge
   */
  private _onClickShowMessages = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    this.setState({ showMessages: true });
  }
  /**
   *
   *
   * @returns {React.ReactElement<ITeamsBadgeProps>}
   * @memberof TeamsBadge
   */
  public render(): React.ReactElement<ITeamsBadgeProps> {
    return (
      <div className={styles.divTopContainer}>
        <div className={styles.badgeWrapper}>
          {this.state.totalNotifications > 0 ? (
            <div className={styles.badge}>{this.state.totalNotifications}</div>
          ) : null}
          <div className={styles.teamsIcon} onClick={this._onClickShowMessages}>
            <img
              src={TEAMS_IMAGE}
              width="34px"
              height="34px"
            />
          </div>
        </div>
        {this.state.showMessages ? (
          <ListNotifications
            context={this.props.context}
            listMessages={this.state.listMessages}
            showDialog={this.state.showMessages}
            onDismiss={this._onDismissListMessages}
          />
        ) : null}
      </div>
    );
  }

  /**
   *   OnDismiss List Messages
   *
   * @private
   * @memberof TeamsBadge
   */
  private _onDismissListMessages = () => {
    this.listMessages = [];
    this._getChats();
    storage.local.put('listMessages', [], moment().add(1,'days').toDate());
    this.setState({
      showMessages: false,
      listMessages: [],
      totalNotifications: 0
    });
  }

  /**
   *   timer to check/get new Chats
   *
   * @private
   * @memberof TeamsBadge
   */
  private _getNewChats = () => {
    setInterval(async () => {
      if (!this._isTimerRunning){
        this._isTimerRunning = true;
        await this._getChats();
        this._isTimerRunning = false;
      }
    }, 5000);
  }
  /**
   *  get user Chats and create Chat Message Subscription
   *
   * @private
   * @memberof TeamsBadge
   */
  private _getChats = () => {
    return new Promise((resolve, reject) => {
      this.listChats = [];
      spservices
        .getChats()
        .then(async chats => {
          for (let chat of chats) {
            try {
              let subscriptionId = await spservices.createMessageSubs(chat.id);

              // save subscription id and chatId
              this.listChats.push({
                chat: chat,
                subscriptionId: subscriptionId,
                hasNotification: false,
                chatMembers: await this._getChatMembers(chat.id)
              });

            } catch (error) {
              console.error(
                `Error on create Subscription(webhook) to Chat ${chat.id}, `,
                error
              );
            }
          }
          // save list of active achats in local storage
          storage.local.put( 'listChats',this.listChats, moment().add(1,'days').toDate());
          resolve();
          //   this.setCheckSubsExpirationDateTimer();
        })
        .catch(error => {
          console.error(`Error getting chat for user: `, error);
          reject(error.message);
        });
    });
  }


  private _getChatMembers = async (
    chatId: string
  ): Promise<IFacepilePersona[]> => {
    try {
      const _members: IChatMember[] = await spservices.getChatMembers(chatId);
      let _facepilePersonas: IFacepilePersona[] = [];

      if (_members && _members.length > 2) {
        for (const _member of _members) {
          const userInfo: IUser = await spservices.getUser(_member.userId);
         /*  if (
            _member.displayName ==
            this.props.context.pageContext.user.displayName
          ) {
            continue;
          } */

          _facepilePersonas.push({
            personaName: _member.displayName,
            imageUrl: await spservices.getUserPhoto(userInfo.userPrincipalName)
          });
        }
      }

      return _facepilePersonas;
    } catch (error) {
      console.log("Error get Members ", error);
    }
  }


}
