import * as React from "react";

import {
  TagPicker,
  IBasePicker,
  ITag,
  IBasePickerSuggestionsProps,
  IPickerItemProps,
  ISuggestionItemProps,
} from "office-ui-fabric-react/lib/Pickers";
import { useTeams } from "../../hooks";
import { ITeam } from "./../../models";
import { ISelectTeamPickerProps } from "./ISelectTeamPickerProps";
import {
  IconButton,
  Stack,
  Text,
  ImageIcon,
  Label,
} from "office-ui-fabric-react";
import { find, pullAllBy } from "lodash";
import { ISelectTeamPickerState } from "./ISelectTeamPickerState";
import { TEAMS_SVG_LOGO } from "./constants";
import { useSelectTeamPickerStyles } from './SelectTeamPickerStyles';

const theme = window.__themeState__.theme;

const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: "Suggested Teams",
  noResultsFoundText: "No Teams found",
};
const initialState: ISelectTeamPickerState = {
  savedSelectedTeams: [],
};
const getTextFromItem = (item: ITag) => item.name;
// Reducer to update state
const reducer = (
  state: ISelectTeamPickerState,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case "UPDATE_SELECTEITEM":
      return { ...state, savedSelectedTeams: action.payload };
    default:
      return state;
  }
};

// select Team control
export const SelectTeamPicker : React.FunctionComponent<ISelectTeamPickerProps> = (
  props: ISelectTeamPickerProps
) => {
  // initialize reducer
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const picker = React.useRef<IBasePicker<ITag>>(null);
  const { serviceScope } = props.appcontext;
  const { getMyTeams } = useTeams(serviceScope);
  const { pickerStylesMulti, pickerStylesSingle , renderItemStylesMulti, renderItemStylesSingle,renderIconButtonRemoveStyles} = useSelectTeamPickerStyles(theme);
  const { onSelectedTeams, selectedTeams  , itemLimit, label, styles } = props;

  const useFilterSuggestedTeams = React.useCallback(
    async (filterText: string, teamsList: ITag[]): Promise<ITag[]> => {
      let tags: ITag[] = [];
      try {
      const teams: ITeam[] = await getMyTeams(filterText);

      if (teams?.length) {
        for (const team of teams) {
          const checkExists = find(teamsList,{"key": team.id});
          if (checkExists) continue;
          tags.push({ key: team.id, name: team.displayName });
        }
      }
      return tags;
      } catch (error) {
        console.log(error);
        return tags;
      }
    },
    []
  );

    React.useEffect(()=>{
      dispatch({
        type: "UPDATE_SELECTEITEM",
        payload:  selectedTeams
      });
    },[props]);

    const _onRenderItem = React.useCallback((itemProps:IPickerItemProps<ITag>) => {
      const { savedSelectedTeams  } = state;
      if (itemProps.item) {
        return (
          <Stack
            horizontal
            horizontalAlign="start"
            verticalAlign="center"
            tokens={{ childrenGap: 7 }}
            styles={ itemLimit && itemLimit > 1 ?   renderItemStylesMulti : renderItemStylesSingle}
          >
            <ImageIcon
              imageProps={{
                src:
                 TEAMS_SVG_LOGO,
                width: 18,
                height: 18,
              }}
            ></ImageIcon>

            <Text variant="medium">{itemProps.item.name}</Text>
            <IconButton
              styles={renderIconButtonRemoveStyles}
              iconProps={{ iconName: "Cancel" , }}
              title="remove"
              onClick={(ev) => {
                const _newSelectedTeams = pullAllBy(savedSelectedTeams, [
                  itemProps.item,
                ]);
                dispatch({
                  type: "UPDATE_SELECTEITEM",
                  payload: _newSelectedTeams,
                });
                props.onSelectedTeams(_newSelectedTeams);
              }}
            />
          </Stack>
        );
      } else {
        return null;
      }
    },[selectedTeams]);

    // reder sugestion Items
    const _onRenderSuggestionsItem = React.useCallback((propsTag:ITag, itemProps:ISuggestionItemProps<ITag>) => {
      return (
        <Stack
          horizontal
          horizontalAlign="start"
          verticalAlign="center"
          tokens={{ childrenGap: 5, padding: 10 }}
        >
          <ImageIcon
            imageProps={{
              src:
              TEAMS_SVG_LOGO,
              width: 18,
              height: 18,
            }}
          ></ImageIcon>
          <Text variant="smallPlus">{propsTag.name}</Text>
        </Stack>
      );
    },[]);


  // Render  control
  return (
    <div style={{width: '100%'}}>
    { props?.label &&  <Label>{props?.label}</Label>}
      <TagPicker
        styles={ styles ??  (itemLimit && itemLimit> 1 ?  pickerStylesMulti : pickerStylesSingle) }
        selectedItems={state.savedSelectedTeams}
        onRenderItem={_onRenderItem}
        onRenderSuggestionsItem={ _onRenderSuggestionsItem}
        onResolveSuggestions={useFilterSuggestedTeams}
        getTextFromItem={getTextFromItem}
        pickerSuggestionsProps={pickerSuggestionsProps}
        onEmptyResolveSuggestions={(selectTeams) => {
          return useFilterSuggestedTeams("", selectTeams);
        }}
        itemLimit={props.itemLimit ?? undefined}
        onChange={(items) => {
          dispatch({ type: "UPDATE_SELECTEITEM", payload: items });
          props.onSelectedTeams(items);
        }}
        componentRef={picker}
      />
    </div>
  );
};
