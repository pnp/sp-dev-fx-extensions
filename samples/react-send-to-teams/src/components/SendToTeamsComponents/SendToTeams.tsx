import {
  DefaultButton,
  FontIcon,
  Panel,
  PrimaryButton,
  Stack,
  Text,
  TextField,
  ITag,
  IDropdownOption,
  Dropdown,
  IDropdownProps,
  PanelType,
} from "office-ui-fabric-react";
import * as React from "react";
import { ISendToTeamsProps } from ".";
import {
  EGlobalStateTypes,
} from "./../../globalState";

import { useBoolean } from "@uifabric/react-hooks";
import { useSendToTeamsStyles } from "./SendToTeamsStyles";
import { SelectTeamPicker } from "./../SelectTeamPicker";
import { SelectTeamChannelPicker } from "./../SelectTeamChannelPicker";
import { ShowAdaptiveCard } from "./../ShowAdaptiveCard";
import { ICardFields } from "./../../models";
import _, { pullAllBy, pullAllWith } from "lodash";
import {
  GlobalStateContext,
} from "./../../globalState";
// load current theme
const theme = window.__themeState__.theme;
const {
  componentClasses,
  fieldStackStylesHeader,
  fieldStackStylesInput,
  textFieldStyles,
  textHeaderStyles,
  dropDownStyles,
} = useSendToTeamsStyles(theme);


const iconStyles = { color: theme.themePrimary, fontSize: 18 };
const onRenderTitle = (options: IDropdownOption[]): JSX.Element => {
  const option = options[0];

  return (
    <Stack
      horizontal
      horizontalAlign="start"
      verticalAlign="center"
      tokens={{ childrenGap: 10 }}
    >
      {option.data && option.data.icon && (
        <FontIcon
          style={iconStyles}
          iconName={option.data.icon}
          aria-hidden="true"
          title={option.data.icon}
        />
      )}
      <Text variant="medium" block>
        {option.text}
      </Text>
    </Stack>
  );
};
const onRenderPlaceholder = (props: IDropdownProps): JSX.Element => {
  return (
    <Stack
      horizontal
      horizontalAlign="start"
      verticalAlign="center"
      tokens={{ childrenGap: 10 }}
    >
      <FontIcon style={iconStyles} iconName={"TextField"} aria-hidden="true" />

      <Text variant="medium" block>
        {props.placeholder}
      </Text>
    </Stack>
  );
};

const onRenderOption = (option: IDropdownOption): JSX.Element => {
  return (
    <Stack
      horizontal
      horizontalAlign="start"
      verticalAlign="center"
      tokens={{ childrenGap: 10 }}
    >
      {option.data && option.data.icon && (
        <FontIcon
          style={iconStyles}
          iconName={option.data.icon}
          title={option.data.icon}
        />
      )}
      <Text variant="medium" block>
        {option.text}
      </Text>
    </Stack>
  );
};

export const SendToTeams: React.FunctionComponent<ISendToTeamsProps> = (
  props: React.PropsWithChildren<ISendToTeamsProps>
) => {
  const cardFields = React.useRef<ICardFields[]>([]);

  const { context, event, showPanel } = props;
  const [isOpen, { setFalse: dismissPanel }] = useBoolean(showPanel);
  // Use Reducar to state management
  // const [state, dispatch] = React.useReducer(reducer, initialState); */
  const { state, dispatch } = React.useContext(GlobalStateContext);

  const onRenderFooterContent = React.useCallback(() => {
    let enableSend: boolean = false;
    if (state.selectedTeam && state.selectedTeamChannel && selectedTitle) {
      enableSend = true;
    }
    return (
      <>
        <Stack
          tokens={{ childrenGap: 10 }}
          horizontal
          horizontalAlign="start"
          verticalAlign="center"
        >
          <PrimaryButton
            disabled={!enableSend}
            onClick={(ev) => {
              console.log("card", state.adaptiveCard);
            }}
          >
            Send
          </PrimaryButton>
          <DefaultButton onClick={dismissPanel}>Cancel</DefaultButton>
        </Stack>
      </>
    );
  }, [dismissPanel, state]);

  const _onSelectedTeams = React.useCallback((taglist: ITag[]) => {
    dispatch({
      type: EGlobalStateTypes.SET_SELECTED_TEAM,
      payload: taglist,
    });
  }, []);

  const _onSelectedTeamChannel = React.useCallback((taglist: ITag[]) => {
    dispatch({
      type: EGlobalStateTypes.SET_SELECTED_TEAM_CHANNEL,
      payload: taglist,
    });
  }, []);

  const {
    selectedTeam,
    selectedTeamChannel,
    selectedFieldKeys,
    selectedImage,
    selectedSubTitle,
    selectedTitle,
    selectedText,
    cardFieldsWithImages,
  } = state;


  const allListViewColumnsOptions = React.useMemo(() => {
    const _dropDownOoptions: IDropdownOption[] = [];
    const listColumns = context.listView.columns;

    for (const column of listColumns) {
      const _fieldValue = event.selectedRows[0].getValueByName(
        column.field.internalName
      );
      _dropDownOoptions.push({
        key: column.field.internalName,
        text: column.field.displayName,
        data: {
          icon: "TextField",
          fieldType: column.field.fieldType,
          fieldInternalName: column.field.internalName,
          value: _fieldValue,
        },
      });
    }
    return _dropDownOoptions;
  }, [context.listView.columns, event.selectedRows]);


  const titleDropDownFieldOption = React.useMemo(() => {
    const dropDownOoptions: IDropdownOption[] =
       allListViewColumnsOptions.filter((v,i)=> {
        return  v.data.fieldType === "Text" ||  v.data.fieldType === "Note" ||  v.data.fieldType === "DateTime" || v.data.fieldType === "Computed";
       });
    return dropDownOoptions;
  }, [allListViewColumnsOptions]);

  const ImageUrlDropDownFieldOption = React.useMemo(() => {
    const _dropDownOoptions: IDropdownOption[] = [];
    const _cardFields = context.listView.columns;
    for (const column of _cardFields) {
      const _fieldValue = event.selectedRows[0].getValueByName(
        column.field.internalName
      );
      if (
        (column.field.fieldType === "URL" &&
          _fieldValue.match(/\.(jpg|jpeg|png)$/)) ||
        column.field.fieldType === "User" ||
        column.field.fieldType === "UserMulti"
      ) {
        cardFieldsWithImages.push({
          fieldDIsplayName: column.field.displayName,
          fieldInternalName: column.field.internalName,
          fieldType: column.field.fieldType,
          fieldValue: _fieldValue,
        });
      }
      if (
        column.field.fieldType !== "URL" ||
        !_fieldValue.match(/\.(jpg|jpeg|png)$/)
      )
        continue;
      _dropDownOoptions.push({
        key: column.field.internalName,
        text: column.field.displayName,
        data: {
          icon: "TextField",
          fieldType: column.field.fieldType,
          value: `${context.pageContext.site.absoluteUrl}${_fieldValue}`,
        },
      });
    }
    console.log(cardFieldsWithImages);
    dispatch({
      type: EGlobalStateTypes.SET_CARDFIELDS_WITH_IMAGES,
      payload: cardFieldsWithImages,
    });
    return _dropDownOoptions;
  }, []);

  const _onChangeMultiField = React.useCallback(
    (
      ev: React.FormEvent<HTMLDivElement>,
      item: IDropdownOption,
      Index: number
    ) => {
      console.log(item);
      cardFields.current = item.selected
        ? [
            ...cardFields.current,
            {
              fieldDIsplayName: item.key as string,
              fieldValue: item.data.value,
              fieldInternalName: item.data.fieldInternalName,
              fieldType: item.data.fieldType,
            },
          ]
        : cardFields.current.filter(
            (field) => field.fieldInternalName !== item.data.fieldInternalName
          );
      dispatch({
        type: EGlobalStateTypes.SET_SELECTED_FIELDS,
        payload: item.selected
          ? [...selectedFieldKeys, item.key as string]
          : selectedFieldKeys.filter(
              (key: string | number) => key !== item.key
            ),
      });
    },
    [selectedFieldKeys]
  );

  const _onChangeTitle = React.useCallback(
    (
      ev: React.FormEvent<HTMLDivElement>,
      item: IDropdownOption,
      Index: number
    ) => {
      dispatch({
        type: EGlobalStateTypes.SET_SELECTED_TITLE,
        payload: item,
      });
      console.log("title", item);
    },
    []
  );

  const _onChangeSubTitle = React.useCallback(
    (
      ev: React.FormEvent<HTMLDivElement>,
      item: IDropdownOption,
      Index: number
    ) => {
      dispatch({
        type: EGlobalStateTypes.SET_SELECTED_SUBTITLE,
        payload: item,
      });
      console.log("Subtitle", item);
    },
    [selectedSubTitle]
  );

  const _onChangeText = React.useCallback(
    (
      ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
      newValue?: string
    ) => {
      dispatch({
        type: EGlobalStateTypes.SET_SELECTED_TEXT,
        payload: newValue,
      });
      console.log("Text", newValue);
    },
    [selectedText]
  );

  const _onChangeImage = React.useCallback(
    (
      ev: React.FormEvent<HTMLDivElement>,
      item: IDropdownOption,
      Index: number
    ) => {
      dispatch({
        type: EGlobalStateTypes.SET_SELECTED_IMAGE,
        payload: item,
      });
      console.log("image", item);
    },
    []
  );

  React.useEffect(() => {
    (async () => {
      dispatch({
        type: EGlobalStateTypes.SET_APP_CONTEXT,
        payload: props.context,
      });
      dispatch({
        type: EGlobalStateTypes.SET_SERVICE_SCOPE,
        payload: props.context.serviceScope,
      });
    })();
  }, []);

  return (
    <>
      <Panel
        isOpen={isOpen}
        onDismiss={dismissPanel}
        type={PanelType.custom}
        customWidth={"450px"}
        headerText="Send to Teams"
        closeButtonAriaLabel="Close"
        // onRenderFooterContent={onRenderFooterContent}
        styles={{
          main: {
            backgroundColor: theme?.neutralLighterAlt,
          },
        }}
        isFooterAtBottom={true}
      >
        <>
          <Stack
            horizontalAlign={"start"}
            verticalAlign="start"
            horizontal
            styles={fieldStackStylesHeader}
            tokens={{ childrenGap: 10 }}
          >
            <FontIcon
              iconName={"TeamsLogo"}
              className={componentClasses.iconStyles}
            />
            <Text styles={textHeaderStyles} variant={"smallPlus"} block nowrap>
              Select Team
            </Text>
          </Stack>
          <Stack
            horizontalAlign={"start"}
            verticalAlign="center"
            horizontal
            styles={fieldStackStylesInput}
          >
            <SelectTeamPicker
              selectedTeams={selectedTeam}
              appcontext={props.context}
              itemLimit={1}
              onSelectedTeams={_onSelectedTeams}
            />
          </Stack>

          {selectedTeam?.length ? (
            <>
              <Stack
                horizontalAlign={"start"}
                verticalAlign="start"
                horizontal
                styles={fieldStackStylesHeader}
                tokens={{ childrenGap: 10 }}
              >
                <FontIcon
                  iconName={"ChatInviteFriend"}
                  className={componentClasses.iconStyles}
                />
                <Text
                  styles={textHeaderStyles}
                  variant={"smallPlus"}
                  block
                  nowrap
                >
                  Select Team Channel
                </Text>
              </Stack>
              <Stack
                horizontalAlign={"start"}
                verticalAlign="center"
                horizontal
                styles={fieldStackStylesInput}
              >
                <SelectTeamChannelPicker
                  selectedChannels={selectedTeamChannel}
                  teamId={selectedTeam[0].key}
                  appcontext={props.context}
                  itemLimit={1}
                  onSelectedChannels={_onSelectedTeamChannel}
                />
              </Stack>

              {selectedTeamChannel?.length ? (
                <>
                  <Stack
                    horizontalAlign={"start"}
                    verticalAlign="center"
                    horizontal
                    styles={fieldStackStylesHeader}
                    tokens={{ childrenGap: 10 }}
                  >
                    <FontIcon
                      iconName={"Header"}
                      className={componentClasses.iconStyles}
                    />
                    <Text
                      variant={"smallPlus"}
                      block
                      nowrap
                      styles={textHeaderStyles}
                    >
                      Title
                    </Text>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    verticalAlign="center"
                    horizontal
                    styles={fieldStackStylesInput}
                  >
                    <Dropdown
                      styles={dropDownStyles}
                      placeholder="Select field to title"
                      selectedKey={selectedTitle?.key}
                      onChange={_onChangeTitle}
                      options={titleDropDownFieldOption}
                      onRenderPlaceholder={onRenderPlaceholder}
                      onRenderTitle={onRenderTitle}
                      onRenderOption={onRenderOption}
                    ></Dropdown>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    verticalAlign="start"
                    horizontal
                    styles={fieldStackStylesHeader}
                    tokens={{ childrenGap: 10 }}
                  >
                    <FontIcon
                      iconName={"TextField"}
                      className={componentClasses.iconStyles}
                    />
                    <Text
                      styles={textHeaderStyles}
                      variant={"smallPlus"}
                      block
                      nowrap
                    >
                      Sub tilte
                    </Text>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    verticalAlign="center"
                    horizontal
                    styles={fieldStackStylesInput}
                  >
                    <Dropdown
                      styles={dropDownStyles}
                      placeholder="Select field for sub title"
                      onChange={_onChangeSubTitle}
                      options={ titleDropDownFieldOption}
                      selectedKey={selectedSubTitle?.key}
                      onRenderPlaceholder={onRenderPlaceholder}
                      onRenderTitle={onRenderTitle}
                      onRenderOption={onRenderOption}
                    ></Dropdown>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    verticalAlign="start"
                    horizontal
                    styles={fieldStackStylesHeader}
                    tokens={{ childrenGap: 10 }}
                  >
                    <FontIcon
                      iconName={"FileImage"}
                      className={componentClasses.iconStyles}
                    />
                    <Text
                      styles={textHeaderStyles}
                      variant={"smallPlus"}
                      block
                      nowrap
                    >
                      Image
                    </Text>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    verticalAlign="center"
                    horizontal
                    styles={fieldStackStylesInput}
                  >
                    <Dropdown
                      styles={dropDownStyles}
                      placeholder="Select field with image url"
                      options={ImageUrlDropDownFieldOption}
                      onChange={_onChangeImage}
                      selectedKey={selectedImage?.key}
                      onRenderPlaceholder={onRenderPlaceholder}
                      onRenderTitle={onRenderTitle}
                      onRenderOption={onRenderOption}
                    ></Dropdown>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    horizontal
                    verticalAlign="start"
                    styles={fieldStackStylesHeader}
                    tokens={{ childrenGap: 10 }}
                  >
                    <FontIcon
                      iconName={"Message"}
                      className={componentClasses.iconStyles}
                    />
                    <Text
                      styles={textHeaderStyles}
                      variant={"smallPlus"}
                      block
                      nowrap
                    >
                      Message
                    </Text>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    verticalAlign="center"
                    horizontal
                    styles={fieldStackStylesInput}
                  >
                    <TextField
                      styles={{ ...textFieldStyles }}
                      borderless
                      validateOnFocusOut
                      multiline
                      rows={5}
                      validateOnLoad={false}
                      value={selectedText}
                      onChange={_onChangeText}
                    />
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    horizontal
                    verticalAlign="center"
                    styles={fieldStackStylesHeader}
                    tokens={{ childrenGap: 10 }}
                  >
                    <FontIcon
                      iconName={"CustomList"}
                      className={componentClasses.iconStyles}
                    />
                    <Text
                      styles={textHeaderStyles}
                      variant={"smallPlus"}
                      block
                      nowrap
                    >
                      Select fields to include
                    </Text>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    verticalAlign="center"
                    horizontal
                    styles={fieldStackStylesInput}
                  >
                    <Dropdown
                      styles={dropDownStyles}
                      multiSelect
                      multiSelectDelimiter={","}
                      selectedKeys={selectedFieldKeys}
                      onChange={_onChangeMultiField}
                      placeholder="Selects fields to show on card"
                      options={allListViewColumnsOptions}
                      onRenderPlaceholder={onRenderPlaceholder}
                      onRenderOption={onRenderOption}
                    ></Dropdown>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    horizontal
                    verticalAlign="center"
                    styles={fieldStackStylesHeader}
                    tokens={{ childrenGap: 10 }}
                  >
                    <FontIcon
                      iconName={"PreviewLink"}
                      className={componentClasses.iconStyles}
                    />
                    <Text
                      styles={textHeaderStyles}
                      variant={"mediumPlus"}
                      block
                      nowrap
                    >
                      Adaptive Card
                    </Text>
                  </Stack>
                  <Stack
                    horizontalAlign={"start"}
                    verticalAlign="center"
                    horizontal
                    styles={fieldStackStylesInput}
                  >
                    <ShowAdaptiveCard
                      fields={cardFields.current}
                      title={state.selectedTitle?.data?.value}
                      subtitle={state.selectedSubTitle?.data?.value}
                      text={state.selectedText}
                      itemImage={state.selectedImage?.data?.value}
                      onSendCard={() => {
                        dismissPanel();
                      }}
                      onCancelPanel={() => {
                        dismissPanel();
                      }}
                    ></ShowAdaptiveCard>
                  </Stack>
                </>
              ) : null}
            </>
          ) : null}
        </>
      </Panel>
    </>
  );
};
