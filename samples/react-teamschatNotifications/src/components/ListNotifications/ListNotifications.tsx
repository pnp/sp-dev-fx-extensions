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

initializeIcons();

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

      for (const message of listMessages) {
        const facepilePersonas = await this._getChatMembers(message.chat.id);
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
          <div
            className={styles.card}
            onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              event.preventDefault();
              window.open(
                `https://teams.microsoft.com/_#/conversations/${message.chat.id}?ctx=chat`
              );
            }}
          >
            {facepilePersonas.length > 0 ? (
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
                    message.chatMessage.attachments.length == 0 && (
                      <Text
                        styles={{
                          root: { marginTop: 15, color: palette.themeDarker }
                        }}
                        variant="mediumPlus"
                      >
                        {message.chatMessage.body.content}
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
                    })}
                </>
              )}
            </div>
          </div>
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
   *
   * @private
   * @memberof ListNotifications
   */
  private _checkMessageContent = async (
    message: IListChatMessage
  ): Promise<string | JSX.Element | JSX.Element[]> => {
    console.log("message", message.chatMessage.body);
    // return message.chatMessage.body.content;
    try {
      if (message.chatMessage.body.contentType == "html") {
        const isEmoji: number = message.chatMessage.body.content.indexOf(
          "http://schema.skype.com/Emoji"
        );
        if (isEmoji !== -1) {
          return message.chatMessage.body.content;
        } else {
          // test if is Gif image present
          const _isGif = message.chatMessage.body.content.indexOf(".gif");

          if (_isGif != -1) {
            const _imgParents = $(message.chatMessage.body.content)
              .find("img")
              .removeAttr("width")
              .removeAttr("height")
              .width("100%")
              .height("100%")
              .parents();
            const _topParent = _imgParents.length - 1;
            return $(_imgParents[_topParent]).html();
          }
          // test if have Attachments with text in HTMNL Message

          const _hasAttachments = message.chatMessage.body.content.indexOf(
            "<attachment"
          );
          if (_hasAttachments != -1) {
            // find parent div that contains the  attachment information

            const _imgParents = $(message.chatMessage.body.content)
              .find("div")
              .html();
            return _imgParents;
          }

          // is autocolant image get image and src to render custom image
          const _img: any = $(message.chatMessage.body.content).find("img");

          if (_img && _img.length > 0) {
            const dataURI = await services.getHostedContentImage(_img[0].src);
            return `<img src=${dataURI} width='100%'>`;
          }
          // Has anchor
          const _anchor: any = $(message.chatMessage.body.content).find("a");
          if (_anchor && _anchor.length > 0) {
            const _renderLink = `<div class=${styles.link}><a href=${_anchor[0].href}  onclick="event.stopPropagation();" title=${_anchor[0].href} rel="noreferrer noopener" target="_blank">${_anchor[0].href}</a></div>`;
            return _renderLink;
          }
          // other content
          return "<div>This Message has multimedia content, click to open</div>";
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  /**
   *
   *
   * @private
   * @memberof ListNotifications
   */
  private _getChatMembers = async (
    chatId: string
  ): Promise<IFacepilePersona[]> => {
    try {
      const _members: IChatMember[] = await services.getChatMembers(chatId);
      let _facepilePersonas: IFacepilePersona[] = [];

      if (_members && _members.length > 2) {
        for (const _member of _members) {
          const userInfo: IUser = await services.getUser(_member.userId);
          if (
            _member.displayName ==
            this.props.context.pageContext.user.displayName
          ) {
            continue;
          }

          _facepilePersonas.push({
            personaName: _member.displayName,
            imageUrl: await services.getUserPhoto(userInfo.userPrincipalName)
          });
        }
      }

      return _facepilePersonas;
    } catch (error) {
      console.log("Error get Members ", error);
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
                marginLeft: 'auto',
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
