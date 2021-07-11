import * as React from "react";

import find from "lodash/find";
import pullAllBy from "lodash/pullAllBy";
import strings from "MyListsNotificationsApplicationCustomizerStrings";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { Label } from "office-ui-fabric-react/lib/Label";
import {
  IBasePicker,
  IBasePickerSuggestionsProps,
  IPickerItemProps,
  ISuggestionItemProps,
  ITag,
  TagPicker,
} from "office-ui-fabric-react/lib/Pickers";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { Text } from "office-ui-fabric-react/lib/Text";

import StackItem from "@fluentui/react/lib/components/Stack/StackItem/StackItem";
import { FontIcon } from "@fluentui/react/lib/Icon";
import { List } from "@microsoft/microsoft-graph-types";

import { useMsGraphAPI } from "../../hooks";
import { IListPickerProps } from "./IListPickerProps";
import { IListPickerState } from "./IListPickerState";
import { useListPickerStyles } from "./ListPickerStyles";
import { RenderSugestedItem } from "./RenderSugestedItem";

const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: strings.ListPickerSugestionsHeaderText,
  noResultsFoundText: strings.ListPickernoResultsFoundText,
};
const initialState: IListPickerState = {
  savedSelectedLists: [],
};
const getTextFromItem = (item: ITag) => item.name;
// Reducer to update state
const reducer = (state: IListPickerState, action: { type: string; payload: any }) => {
  switch (action.type) {
    case "UPDATE_SELECTEDITEM":
      return { ...state, savedSelectedLists: action.payload };
    default:
      return state;
  }
};

// select Team control
export const ListPicker: React.FunctionComponent<IListPickerProps> = (props: IListPickerProps) => {
  // initialize reducer
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const picker = React.useRef<IBasePicker<ITag>>(null);
  const { getLists } = useMsGraphAPI();
  const { onSelectedLists, selectedLists, itemLimit, label, styles, themeVariant } = props;
  const {
    pickerStylesMulti,
    pickerStylesSingle,
    renderItemStylesMulti,
    renderItemStylesSingle,
    renderIconButtonRemoveStyles,
  } = useListPickerStyles(themeVariant);

  const useFilterSuggestedLists = React.useCallback(async (filterText: string, listsList: ITag[]): Promise<ITag[]> => {
    let tags: ITag[] = [];
    try {
      // const lists: ITeam[] = await getMyLists(filterText);
      const lists = await getLists(filterText);
      const listData = lists?.hits;
      if (listData?.length) {
        for (const list of listData) {
          const listInfo = list.resource as List;
          const checkExists = find(listsList, { key: listInfo.id, name: JSON.stringify(listInfo) });
          if (checkExists) continue;
          tags.push({ key: listInfo.id, name: JSON.stringify(listInfo) });
        }
      }
      return tags;
    } catch (error) {
      console.log(error);
      return tags;
    }
  }, []);

  React.useEffect(() => {
    dispatch({
      type: "UPDATE_SELECTEDITEM",
      payload: selectedLists,
    });
  }, [props]);

  const _onRenderItem = React.useCallback(
    (itemProps: IPickerItemProps<ITag>) => {
      const itemInfo: List = JSON.parse(itemProps.item.name);
      const { savedSelectedLists } = state;
      if (itemProps.item) {
        return (
          <Stack
            horizontal
            horizontalAlign="start"
            verticalAlign="center"
            tokens={{ childrenGap: 7 }}
            styles={itemLimit && itemLimit > 1 ? renderItemStylesMulti : renderItemStylesSingle}
          >
            <FontIcon iconName="list" style={{ width: 18, height: 18, fontSize: 18 }}></FontIcon>
            <StackItem grow={2}>
              <Text variant="smallPlus" nowrap>
                {itemInfo.displayName}
              </Text>
            </StackItem>
            <IconButton
              styles={renderIconButtonRemoveStyles}
              iconProps={{ iconName: "Cancel" }}
              title={strings.ListPickerButtonRemoveTitle}
              onClick={(ev) => {
                ev.stopPropagation();
                const _newSelectedLists = pullAllBy(savedSelectedLists, [itemProps.item]);
                onSelectedLists(_newSelectedLists);
                dispatch({
                  type: "UPDATE_SELECTEDITEM",
                  payload: _newSelectedLists,
                });
              }}
            />
          </Stack>
        );
      } else {
        return null;
      }
    },
    [
      selectedLists,
      state.savedSelectedLists,
      props.themeVariant,
      renderItemStylesSingle,
      renderIconButtonRemoveStyles,
      renderItemStylesMulti,
    ]
  );

  // reder sugestion Items
  const _onRenderSuggestionsItem = React.useCallback(
    (propsTag: ITag, itemProps: ISuggestionItemProps<ITag>) => {
      return <RenderSugestedItem tag={propsTag} themeVariant={themeVariant} />;
    },
    [props.themeVariant]
  );

  // Render  control
  return (
    <div style={{ width: "100%" }}>
      {label && <Label>{label}</Label>}
      <TagPicker
        styles={styles ?? (itemLimit && itemLimit > 1 ? pickerStylesMulti : pickerStylesSingle)}
        selectedItems={state.savedSelectedLists}
        onRenderItem={_onRenderItem}
        onRenderSuggestionsItem={_onRenderSuggestionsItem}
        onResolveSuggestions={useFilterSuggestedLists}
        getTextFromItem={getTextFromItem}
        pickerSuggestionsProps={pickerSuggestionsProps}
        onEmptyResolveSuggestions={(selectLists) => {
          return useFilterSuggestedLists("", selectLists);
        }}
        itemLimit={props.itemLimit ?? undefined}
        onChange={(items) => {
          onSelectedLists(items);
          dispatch({ type: "UPDATE_SELECTEDITEM", payload: items });
        }}
        componentRef={picker}
      />
    </div>
  );
};
