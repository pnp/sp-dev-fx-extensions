import * as React from "react";
import {
  TagPicker,
  IBasePicker,
  ITag,
  IBasePickerSuggestionsProps,
  IPickerItemProps,
  ISuggestionItemProps,
  ISuggestionsItem,
} from "office-ui-fabric-react/lib/Pickers";
import { useTeams } from "../../hooks";
import { ITeamChannel } from "./../../models";
import { ISelectTeamChannelPickerProps } from "./ISelectTeamChannelPickerProps";
import {
  IconButton,
  Stack,
  Text,
  FontIcon,
  Label,
} from "office-ui-fabric-react";
import { find, pullAllBy } from "lodash";
import { ISelectTeamChannelPickerState } from "./ISelectTeamChannelPickerState";
import { useSelectTeamChannelPickerStyles } from "./SelectTeamChannelPickerStyles";
import { EMembershipType } from "./EMembersipType";

const theme = window.__themeState__.theme;

const initialState: ISelectTeamChannelPickerState = {
  selectedTeamsChannels: [],
};
const getTextFromItem = (item: ITag) => item.name.split(",")[0];
// Reducer to update state
const reducer = (
  state: ISelectTeamChannelPickerState,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case "UPDATE_SELECTEITEM":
      return { ...state, selectedTeamsChannels: action.payload };
    default:
      return state;
  }
};

// select Team control
export const SelectTeamChannelPicker: React.FunctionComponent<ISelectTeamChannelPickerProps> = (
  props: ISelectTeamChannelPickerProps
) => {
  // initialize reducer
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const picker = React.useRef<IBasePicker<ITag>>(null);
  const { serviceScope } = props.appcontext;
  const { getTeamChannels } = useTeams(serviceScope);
  const {
    renderItemStylesSingle,
    renderItemStylesMulti,
    pickerStylesMulti,
    pickerStylesSingle,
    renderIconButtonRemoveStyles,
  } = useSelectTeamChannelPickerStyles(theme);
  const {
    onSelectedChannels,
    selectedChannels,
    itemLimit,
    label,
    styles,
  } = props;

  const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: "Suggested Team Channels",
    noResultsFoundText: "No channels found",
  };

  /**
   *  Get Sugested Teams
   */
  const useFilterSuggestedTeamsChannels = React.useCallback(
    async (filterText: string, teamsChannelList: ITag[]): Promise<ITag[]> => {
      let tags: ITag[] = [];
      try {
        const teamsChannels: ITeamChannel[] = await getTeamChannels(
          props.teamId.toString(),
          filterText
        );

        if (teamsChannels?.length) {
          for (const teamChannel of teamsChannels) {
            const checkExists = find(teamsChannelList, { key: teamChannel.id });
            if (checkExists) continue;
            tags.push({
              key: teamChannel.id,
              name: `${teamChannel.displayName},${teamChannel.membershipType},${
                teamChannel.isFavoriteByDefault ?? "false"
              }`,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
      return tags;
    },
    []
  );

  React.useEffect(() => {
    dispatch({
      type: "UPDATE_SELECTEITEM",
      payload: selectedChannels,
    });
  }, [props.teamId]);

  // Default RenderItem
  const _onRenderItem = React.useCallback(
    (itemProps: IPickerItemProps<ITag>) => {
      const { selectedTeamsChannels } = state;

      if (itemProps.item) {
        return (
          <Stack
            horizontal
            horizontalAlign="start"
            verticalAlign="center"
            tokens={{ childrenGap: 5 }}
            styles={
              itemLimit && itemLimit > 1
                ? renderItemStylesMulti
                : renderItemStylesSingle
            }
          >
            <FontIcon
              iconName="ChatInviteFriend"
              style={{ fontSize: 14, color: theme.themePrimary }}
            ></FontIcon>

            {_renderChannelInformation(itemProps.item)}

            <IconButton
              styles={renderIconButtonRemoveStyles}
              iconProps={{ iconName: "Cancel" }}
              title="remove"
              onClick={(ev) => {
                const _newSelectedTeamsChannels = pullAllBy(
                  selectedTeamsChannels,
                  [itemProps.item]
                );
                dispatch({
                  type: "UPDATE_SELECTEITEM",
                  payload: _newSelectedTeamsChannels,
                });
                props.onSelectedChannels(_newSelectedTeamsChannels);
              }}
            />
          </Stack>
        );
      } else {
        return null;
      }
    },
    [state.selectedTeamsChannels]
  );

  const _renderChannelInformation = React.useCallback(
    (propsTag: ITag): JSX.Element[] => {
      let _returnControls: JSX.Element[] = [];
      const _splitName: string[] = propsTag.name.split(",");
      const _displayName: string = _splitName[0];
      const _membershipType: string = _splitName[1];
      const _isFavoriteByDefault: string = _splitName[2];

      _returnControls.push(<Text variant="medium">{_displayName}</Text>);

      if (_membershipType === EMembershipType.Private) {
        _returnControls.push(
          <FontIcon
            title="Private Channel"
            iconName="LockSolid"
            style={{ fontSize: 12, color: theme.themePrimary }}
          ></FontIcon>
        );
      }
      if (_isFavoriteByDefault && _isFavoriteByDefault === "true") {
        _returnControls.push(
          <FontIcon
            title="Favorite"
            iconName="FavoriteStarFill"
            style={{ fontSize: 12, color: theme.themePrimary }}
          ></FontIcon>
        );
      }
      return _returnControls;
    },
    []
  );
  // reder sugestion Items
  const _onRenderSuggestionsItem = React.useCallback(
    (propsTag: ITag, itemProps: ISuggestionItemProps<ITag>) => {
      return (
        <Stack
          horizontal
          horizontalAlign="stretch"
          verticalAlign="center"
          styles={{ root: { width: "100%" } }}
          tokens={{ childrenGap: 10, padding: 10 }}
        >
          <FontIcon
            iconName="ChatInviteFriend"
            style={{ fontSize: 14, color: theme.themePrimary }}
          ></FontIcon>
          {_renderChannelInformation(propsTag)}
        </Stack>
      );
    },
    []
  );

  // Render  control
  return (
    <div style={{width:'100%'}}>
      {  props.label &&
          <Label>{props.label}</Label>
      }
      <TagPicker
        styles={
          styles ??
          (itemLimit && itemLimit > 1 ? pickerStylesMulti : pickerStylesSingle)
        }
        selectedItems={state.selectedTeamsChannels}
        onRenderItem={ _onRenderItem}
        onRenderSuggestionsItem={
       _onRenderSuggestionsItem
        }
        ref={picker}
        onResolveSuggestions={useFilterSuggestedTeamsChannels}
        getTextFromItem={getTextFromItem}
        pickerSuggestionsProps={pickerSuggestionsProps}
        onEmptyResolveSuggestions={(selectTeams) => {
          return useFilterSuggestedTeamsChannels("", selectTeams);
        }}
        itemLimit={itemLimit ?? undefined}
        onChange={(items) => {
          dispatch({ type: "UPDATE_SELECTEITEM", payload: items });
          onSelectedChannels(items);
        }}
        componentRef={picker}
      />
    </div>
  );
};
