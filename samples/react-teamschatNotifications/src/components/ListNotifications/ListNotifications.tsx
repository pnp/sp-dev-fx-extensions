import * as React from "react";
import styles from "./ListNotifications.module.scss";
import * as strings from "TeamsChatNotificationsApplicationCustomizerStrings";
import services from "../../services/spservices";
import { IListNotificationsProps } from "./IListNotificationsProps";
import { IListNotificationsState } from "./IListNotificationsState";
import * as moment from "moment";
import * as $ from "jquery";
import { Stack, IStackTokens } from "office-ui-fabric-react/lib/Stack";
import { getTheme } from "office-ui-fabric-react/lib/Styling";
import * as loadash from "lodash";
import { IListChatMessage } from "../../entities/IListChatMessage";
import { Link } from "office-ui-fabric-react/lib/Link";
import {
  IPersonaSharedProps,
  PersonaSize,
  Persona,
  IPersonaProps
} from "office-ui-fabric-react/lib/Persona";
import { Label } from "office-ui-fabric-react/lib/Label";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import {
  Dialog,
  DialogType,
  DialogFooter
} from "office-ui-fabric-react/lib/Dialog";
import { IUser } from "../../entities/IUser";
import { Text } from "office-ui-fabric-react/lib/Text";

import {
  Facepile,
  IFacepilePersona,
  IFacepileProps
} from "office-ui-fabric-react/lib/Facepile";
import { IChatMember } from "../../entities/IChatMember";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { initializeIcons } from "@uifabric/icons";
import { Image } from "office-ui-fabric-react/lib/Image";
import { Attachment } from "../Attachment/Attachment";
import { PnPClientStorage } from "@pnp/pnpjs";
import { IListChat } from "../../entities/IListChat";
import * as lodash from "lodash";
import * as cheerios from 'cheerio';

initializeIcons();

const storage = new PnPClientStorage();
const theme = getTheme();
const { palette, fonts } = theme;
const stackTokens: IStackTokens = { childrenGap: 20 };

/**
 *
 *
 * @export
 * @class ListNotifications
 * @extends {React.Component<IListNotificationsProps, IListNotificationsState>}
 */
export class ListNotifications extends React.Component<
  IListNotificationsProps,
  IListNotificationsState
> {
  private _renderMessages: JSX.Element[] = [];

  constructor(props: IListNotificationsProps) {
    super(props);
    // services.init(this.props.context);
    this.state = {
      isLoading: false,
      hasError: false,
      messageError: undefined,
      renderMessages: [],
      hideDialog: !this.props.showDialog
    };
  }

  /**
   *
   *
   * @memberof ListNotifications
   */
  public componentDidMount = (): void => {
    this.setState({
      isLoading: true
    });
    this._loadMessages();
  };

  /**
   *
   *
   * @param {IListNotificationsProps} prevProps
   * @param {IListNotificationsState} prevState
   * @memberof ListNotifications
   */
  public componentDidUpdate(
    prevProps: IListNotificationsProps,
    prevState: IListNotificationsState
  ): void {}

  /**
   *
   *
   * @private
   * @memberof ListNotifications
   */
  private _loadMessages = async () => {
    try {
      let { listMessages } = this.props;
      this._renderMessages = [];
      const listChats: IListChat[] = storage.local.get("listChats");
      for (const message of listMessages) {
        // totalNotifications++;
        let index: number = lodash.findIndex(listChats, {
          chat: { id: message.chat.id }
        });

        const chatItem =  listChats && listChats.length > 0 ? listChats[index] : null;
        const facepilePersonas = chatItem ? chatItem.chatMembers : null;
        const userInfo: IUser = await services.getUser(
          message.chatMessage.from.user.id
        );
        let personaCardProps: IPersonaSharedProps = {} as IPersonaSharedProps;
        let photoUrl: string = undefined;
        if (userInfo) {
          photoUrl = await services.getUserPhoto(userInfo.userPrincipalName);
        }
        personaCardProps = {
          text: message.chatMessage.from.user.displayName,
          imageUrl: photoUrl,
          size: PersonaSize.size40,
          secondaryText: moment(message.chatMessage.createdDateTime).format(
            "D, MMM YYYY HH:mm:ss"
          )
        };

        const _message: any = await this._checkMessageContent(message);

        this._renderMessages.push(
          <>
            <div
              onClick={event => {
                event.preventDefault();
                window.open(
                  `https://teams.microsoft.com/_#/conversations/${message.chat.id}?ctx=chat`
                );
              }}
            >
              <div className={styles.card}>
                {facepilePersonas && facepilePersonas.length > 0 ? (
                  <div className={styles.facepileWarapper}>
                    <Facepile
                      personas={facepilePersonas}
                      personaSize={PersonaSize.size24}
                      maxDisplayablePersonas={8}
                      styles={{ root: { marginBottom: 15 } }}
                    />
                  </div>
                ) : null}
                <div className={styles.cardWrapper}>
                  <Persona
                    {...personaCardProps}
                    styles={{ root: { marginBottom: 10 } }}
                  />
                  <div
                    style={{
                      margin: 15,
                      height: 1,
                      borderBottomColor: palette.neutralQuaternaryAlt,
                      borderBottomWidth: 1,
                      borderBottomStyle: "solid"
                    }}
                  ></div>
                  {message.chatMessage.body.contentType == "html" ? (
                    <>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: _message
                        }}
                      />
                      {message.chatMessage.attachments.length > 0 &&
                        message.chatMessage.attachments.map(attachment => {
                          return (
                            <Attachment
                              fileUrl={attachment.contentUrl}
                              name={attachment.name}
                            />
                          );
                        })}
                    </>
                  ) : (
                    <>
                      {message.chatMessage.body.contentType == "text" &&
                         (
                          <Text
                            styles={{
                              root: {
                                marginTop: 15,
                                color: palette.themeDarker
                              }
                            }}
                            variant="mediumPlus"
                          >
                            { message.chatMessage.body.content.substr(0,message.chatMessage.body.content.indexOf('<attachment'))}
                          </Text>
                        )}
                      {message.chatMessage.body.contentType == "text" &&
                        message.chatMessage.attachments.length > 0 &&

                        message.chatMessage.attachments.map(attachment => {
                          return (
                            <Attachment
                              fileUrl={attachment.contentUrl}
                              name={attachment.name}
                            />
                          );
                        })

                        }
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      }

      this.setState({
        isLoading: false,
        renderMessages: this._renderMessages,
        hasError: false,
        messageError: ""
      });
    } catch (error) {
      console.log("error", error);
      this.setState({
        isLoading: false,
        renderMessages: this._renderMessages,
        hasError: true,
        messageError: error.message
      });
    }
  };

  /**
   *
   * @private
   * @memberof ListNotifications
   */
  private _checkMessageContent = async (
    message: IListChatMessage
  ): Promise<string | JSX.Element | JSX.Element[]> => {
    console.log("message", message.chatMessage);
    //
    try {
      if (message.chatMessage.body.contentType == "html") {
      const _ch = cheerios.load(message.chatMessage.body.content);
      _ch('a').attr('href','#').attr('onclick',`window.open('${_ch('a').attr('href')}'`).addClass(`${styles.link}`);
      _ch('img[itemtype!="http://schema.skype.com/Emoji"]').css("width", "100%").css("height","100%");
    // is sticker image get src to convert DataBase64
      const _imgSrc:any = _ch('img[src*="$value"]').attr('src');
      let  _returnHtml = '';

      if ( _imgSrc && _imgSrc.length > 0  ) {
        const dataURI = await services.getHostedContentImage(_imgSrc);
        if (dataURI) {
          _ch('img[src*="$value"]').attr('src',dataURI);
        } else {
          // if can't get image send default message to click to open
          _returnHtml = "<div>Please click to see message</div>";
          _ch('img[src*="$value"]').replaceWith(_returnHtml);
        }
      }
      // Return Message!
      return  _ch.html();
      }else{
        return "<div>Please click to see message</div>";
      }

    } catch (error) {
      console.log("Error getting HTML Content", error);
      return "<div>Please click to see message</div>";
    }
  };

  /**
   *
   *
   * @returns {React.ReactElement<IListNotificationsProps>}
   * @memberof ListNotifications
   */
  public render(): React.ReactElement<IListNotificationsProps> {
    const { hideDialog } = this.state;
    return (
      <div>
        <Dialog
          hidden={hideDialog}
          onDismiss={this.props.onDismiss}
          dialogContentProps={{
            type: DialogType.largeHeader,
            title: strings.DialogTitle
          }}
          modalProps={{
            isBlocking: false,
            isDarkOverlay: false,

            styles: {
              main: {
                maxWidth: 400,
                maxHeight: 650,
                position: "absolute",
                marginLeft: "auto",
                top: 90
              }
            }
          }}
        >
          <div className={styles.listMessages}>
            <Stack tokens={stackTokens}>
              {this.state.isLoading ? (
                <Spinner size={SpinnerSize.small}></Spinner>
              ) : this.state.hasError ? (
                <Label style={{ color: "red" }}>
                  {this.state.messageError}
                </Label>
              ) : this.state.renderMessages.length > 0 ? (
                this.state.renderMessages
              ) : (
                <Stack
                  horizontal
                  tokens={{ childrenGap: 10 }}
                  horizontalAlign="center"
                  style={{ alignItems: "center" }}
                >
                  <Icon iconName="Info" style={{ fontSize: 22 }} />
                  <Label>{strings.NoMessages}</Label>
                </Stack>
              )}
            </Stack>
          </div>
        </Dialog>
      </div>
    );
  }
}
