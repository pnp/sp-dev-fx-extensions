import * as React from "react";
import { IShowAdaptiveCardProps } from "./IShowAdaptiveCardProps";
import * as adaptiveCards from "adaptivecards";
import { Stack } from "@fluentui/react/lib/Stack";
import * as markdownit from "markdown-it";
import { FontType, Spacing, TextSize, TextWeight } from "adaptivecards";
import { IUser } from "../../models/IUser";
import { EGlobalStateTypes, GlobalStateContext } from "../../globalState";
import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { useTeams } from "./../../hooks";
import { ITermLabel } from "../../models/ITermLabel";
import {
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Text,
} from "@fluentui/react";
import { IMessageInfo } from "../../models/IMessageInfo";
import strings from "SendToTeamsCommandSetStrings";

export const ShowAdaptiveCard: React.FunctionComponent<IShowAdaptiveCardProps> = (
  props: React.PropsWithChildren<IShowAdaptiveCardProps>
) => {
  const containerRef = React.useRef<HTMLDivElement>(undefined);
  const cardRef = React.useRef<any>();
  const { state, dispatch } = React.useContext(GlobalStateContext);
  const { sendAdativeCardToTeams } = useTeams(state.serviceScope);
  const { appContext } = state;
  const {
    title,
    subtitle,
    text,
    itemImage,
    fields,
    onSendCard,
    onCancelPanel,
  } = props;

  const { messageInfo } = state;

  React.useEffect(() => {
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.lastChild);
    }

    if (!title && !subtitle && !text && !itemImage && !fields && !fields.length)
      return;

    const adaptiveCard = new adaptiveCards.AdaptiveCard();
    adaptiveCard.version = new adaptiveCards.Version(1, 2);

    // Handle parsing markdown from HTML
    adaptiveCards.AdaptiveCard.onProcessMarkdown = _onProcessMarkdownHandler;

    const cardTitle: adaptiveCards.TextBlock = _addTitle(title);
    const cardSubtitle: adaptiveCards.TextBlock = _addSubTitle(subtitle);
    const image: adaptiveCards.Image = _addImage(itemImage);
    const cardText: adaptiveCards.TextBlock = _addTextMessage(text);

    adaptiveCard.addItem(cardTitle);
    adaptiveCard.addItem(cardSubtitle);
    adaptiveCard.addItem(image);
    adaptiveCard.addItem(cardText);

    let _cardListFieldLabel: any[] = [];
    let _cardListField: any[] = [];

    if (fields && fields.length) {
      for (let index = 0; index < fields.length; index++) {
        const column = fields[index];
        let fieldValue = column.fieldValue;
        const fieldType = column.fieldType;
        if (
          fieldType === "URL" &&
          (fieldValue as string).match(/\.(jpg|jpeg|png|gif)$/)
        )
          continue;
        _cardListFieldLabel[index] = _addFieldLabel(column);
        _cardListField[index] = _addListField(
          fieldValue,
          fieldType,
          appContext.pageContext.site.absoluteUrl
        );
        adaptiveCard.addItem(_cardListFieldLabel[index]);
        adaptiveCard.addItem(_cardListField[index]);
      }
    }
    // Create JSON Adaptive Card
    const _card = adaptiveCard.toJSON();
    // Parse the card payload
    adaptiveCard.parse(_card);
    // Render the card to an HTML element:
    cardRef.current = _card;
    const renderedCard = adaptiveCard.render();
    // Empty the div so we can replace it
    containerRef.current.appendChild(renderedCard);
  }, [props]);

  const onSendMessage = React.useCallback(
    async () => {
      const { selectedTeam, selectedTeamChannel } = state;
      let sendMessageInfo: IMessageInfo = {
        isShow: false,
        messageProps:{messageBarType: MessageBarType.error},
        message: "",
      };
      try {
        dispatch({
          type: EGlobalStateTypes.SET_IS_SENDING_MESSAGE,
          payload: true,
        });
        await sendAdativeCardToTeams(cardRef.current,selectedTeam[0].key as string,selectedTeamChannel[0].key as string);
        onSendCard();
      } catch (error) {
        console.log(error);
        dispatch({
          type: EGlobalStateTypes.SET_IS_SENDING_MESSAGE,
          payload: false,
        });
        sendMessageInfo = {
          isShow: true,
          messageProps:{messageBarType: MessageBarType.error},
          message: strings.ErrorMessageOnSendingMessage,
        };
        dispatch({
          type: EGlobalStateTypes.SET_MESSAGE,
          payload:  sendMessageInfo,
        });
      }
    },
    [
      state.selectedTeam,
      state.selectedTeamChannel,
      cardRef.current,
      sendAdativeCardToTeams,
    ]
  );

  const onRenderFooterContent = React.useCallback(() => {
    let enableSend: boolean = false;
    const {
      selectedTeam,
      selectedTeamChannel,
      selectedTitle,
      isSendingMessage,
    } = state;
    if (
      selectedTeam &&
      selectedTeamChannel &&
      selectedTitle &&
      !isSendingMessage
    ) {
      enableSend = true;
    }
    return (
      <>
        <Stack
          tokens={{ childrenGap: 10 }}
          horizontal
          horizontalAlign="end"
          verticalAlign="center"
        >
          <PrimaryButton disabled={!enableSend} onClick={onSendMessage}>
            {isSendingMessage ? (
              <Stack horizontal horizontalAlign="center">
                <Spinner size={SpinnerSize.small} />
              </Stack>
            ) : (
              strings.SendButtonLabel
            )}
          </PrimaryButton>
          <DefaultButton
            onClick={() => {
              onCancelPanel();
            }}
          >
            {strings.CancelButtonLabel}
          </DefaultButton>
        </Stack>
      </>
    );
  }, [
    state.selectedTeam,
    state.selectedTeamChannel,
    state.selectedTitle,
    state.isSendingMessage,
    onSendMessage,
    onCancelPanel,
  ]);

  return (
    <>
      <Stack
        verticalAlign="center"
        tokens={{ childrenGap: 30 }}
        styles={{ root: { width: "100%" } }}
      >
        <div ref={containerRef} style={{ width: "100%" }} />
        {onRenderFooterContent()}
        {messageInfo.isShow && (
          <MessageBar
            {...messageInfo.messageProps}
            messageBarType={MessageBarType.error}>
            <Text>{state.messageInfo.message}</Text>
          </MessageBar>
        )}
      </Stack>
    </>
  );
};

// Functions
const _addListField = (
  fieldValue: any,
  fieldType: string,
  siteUrl: string
): adaptiveCards.TextBlock | adaptiveCards.ColumnSet => {
  let _fieldValue: adaptiveCards.TextBlock = new adaptiveCards.TextBlock();

  _fieldValue.spacing = Spacing.None;
  _fieldValue.maxLines = 20;
  _fieldValue.wrap = true;
  _fieldValue.fontType = FontType.Default;
  _fieldValue.size = TextSize.Default;

  switch (fieldType) {
    case "DateTime":
      _fieldValue.text = fieldValue;
      return _fieldValue;
    case "URL":
      if (!(fieldValue as string).match(/\.(jpg|jpeg|png|gif)$/)) {
        _fieldValue.text = `[${fieldValue}](${fieldValue})`;
        return _fieldValue;
      }
      break;
    case "TaxonomyFieldType":
      _fieldValue.text = fieldValue.Label;
      return _fieldValue;
    case "TaxonomyFieldTypeMulti":
      const _fieldValueMetadataMulti: ITermLabel[] = fieldValue as ITermLabel[];
      const terms: string[] = [];
      for (const term of _fieldValueMetadataMulti) {
        terms.push(term.Label);
      }
      _fieldValue.text = terms.join(",");
      return _fieldValue;
    case "MultiChoice":
      const _fieldValueMultiChoice: string[] = fieldValue as any;
      fieldValue = _fieldValueMultiChoice.join(",");
      _fieldValue.text = fieldValue;
      return _fieldValue;
    case "User":
    case "UserMulti":
      return _addUserField(fieldValue, siteUrl);
    default:
      _fieldValue.text = fieldValue;
      break;
  }
  return _fieldValue;
};

const _addUserField = (
  fieldValue: IUser[],
  siteUrl: string
): adaptiveCards.ColumnSet => {
  const _userField: IUser[] = fieldValue;
  let columnset = new adaptiveCards.ColumnSet();
  columnset.spacing = Spacing.None;

  let firstColumn = new adaptiveCards.Column();
  (firstColumn.width as any) = "45px";
  let secondColumn = new adaptiveCards.Column();
  for (const user of _userField) {
    let proFileImage = new adaptiveCards.Image();
    let columnTextName = new adaptiveCards.TextBlock();
    let columnTextEmail = new adaptiveCards.TextBlock();
    proFileImage.size = adaptiveCards.Size.Small;
    proFileImage.pixelWidth = 40;
    proFileImage.spacing = Spacing.Small;
    proFileImage.style = adaptiveCards.ImageStyle.Person;
    proFileImage.url = `${siteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${user.email}`;
    // user.picture !== "" ? user.picture : DEFAULT_PERSONA_IMAGE;
    columnTextName.text = user.value;
    columnTextName.maxLines = 2;
    columnTextName.wrap = true;
    columnTextName.size = TextSize.Default;
    columnTextName.spacing = Spacing.Small;
    //
    columnTextEmail.text = `[${user.email}](mailto:${user.email})`;
    columnTextEmail.maxLines = 2;
    columnTextEmail.wrap = true;
    columnTextEmail.size = TextSize.Default;
    columnTextEmail.spacing = Spacing.None;

    firstColumn.addItem(proFileImage);
    secondColumn.addItem(columnTextName);
    secondColumn.addItem(columnTextEmail);
  }
  columnset.addColumn(firstColumn);
  columnset.addColumn(secondColumn);

  return columnset;
};

const _addFieldLabel = (field: any): adaptiveCards.TextBlock => {
  let _fieldLabel = new adaptiveCards.TextBlock();

  _fieldLabel.maxLines = 1;
  _fieldLabel.wrap = false;
  _fieldLabel.text = field.fieldDIsplayName;
  _fieldLabel.fontType = FontType.Default;
  _fieldLabel.size = TextSize.Default;
  _fieldLabel.weight = TextWeight.Bolder;

  return _fieldLabel;
};

const _addImage = (itemImage: string): adaptiveCards.Image => {
  let image = new adaptiveCards.Image();
  image.url = itemImage;
  return image;
};
const _addTitle = (title: string): adaptiveCards.TextBlock => {
  let cardTitle = new adaptiveCards.TextBlock();
  cardTitle.text = title;
  cardTitle.maxLines = 2;
  cardTitle.wrap = true;
  cardTitle.size = TextSize.Large;

  return cardTitle;
};

const _addSubTitle = (subTitle: string): adaptiveCards.TextBlock => {
  let cardSubtitle = new adaptiveCards.TextBlock();
  cardSubtitle.maxLines = 2;
  cardSubtitle.wrap = true;
  cardSubtitle.isSubtle = true;
  cardSubtitle.spacing = Spacing.None;
  cardSubtitle.text = subTitle;
  return cardSubtitle;
};

const _onProcessMarkdownHandler = (md: string, result: any) => {
  // Don't stop parsing if there is invalid Markdown -- there's a lot of that in sample Adaptive Cards templates
  try {
    result.outputHtml = new markdownit().render(md);
    result.didProcess = true;
  } catch (error) {
    console.error("Error parsing Markdown", error);
    result.didProcess = false;
  }
};

const _addTextMessage = (text: string): adaptiveCards.TextBlock => {
  let cardTextMessage = new adaptiveCards.TextBlock();
  // Message
  cardTextMessage.text = text;
  cardTextMessage.maxLines = 10;
  cardTextMessage.wrap = true;
  return cardTextMessage;
};
