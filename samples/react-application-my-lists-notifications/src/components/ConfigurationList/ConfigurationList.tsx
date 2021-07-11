import * as React from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import find from "lodash/find";
import pullAllBy from "lodash/pullAllBy";
import strings from "MyListsNotificationsApplicationCustomizerStrings";

import {
  DefaultButton,
  DialogFooter,
  ITag,
  Label,
  Panel,
  PrimaryButton,
  Separator,
  Spinner,
  SpinnerSize,
  Stack,
  Text,
} from "@fluentui/react";
import { List } from "@microsoft/microsoft-graph-types";

import { EGlobalStateTypes, GlobalStateContext, IConfigurationListItem } from "../";
import { useMsGraphAPI } from "../../hooks";
import { ErrorInfo } from "../ErrorInfo/ErrorInfo";
import { AddItem } from "./AddItem";
import { ListItem } from "./ListItem";
import { ListItemNoLists } from "./ListItemNoLists";
import { useConfigurationListStyles } from "./useConfigurationListStyles";
export interface IConfigurationListProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const ConfigurationList: React.FunctionComponent<IConfigurationListProps> = (
  props: React.PropsWithChildren<IConfigurationListProps>
) => {
  const { isOpen, onDismiss } = props;
  const { panelContainerStyles, stackItemsContainer } = useConfigurationListStyles();
  const { state, setGlobalState } = useContext(GlobalStateContext);
  const [isUpdating, setIsUpdating] = useState<Boolean>(false);
  const { saveSettings, getSettings } = useMsGraphAPI();
  const { lists, errorInfo } = state;
  const wListBackup = useRef<IConfigurationListItem[]>([]);

  useEffect(() => {
    (async () => {
      wListBackup.current = await getSettings();
    })();
  }, [isOpen]);

  const addSelectedItemsToList = useCallback(
    (selectedItems: ITag[]): void => {
      const newList: IConfigurationListItem[] = [];
      for (const itemInfo of selectedItems) {
        const item: List = JSON.parse(itemInfo.name) as List;
        const exists = find(lists, ["listUrl", item.webUrl]);
        if (!exists) {
          newList.push({
            listName: item.name,
            key: item?.id,
            list: item?.displayName,
            site: item?.webUrl,
            siteId: item.parentReference.siteId,
            listUrl: item.webUrl,
          });
        }
      }
      setGlobalState({
        type: EGlobalStateTypes.SET_LISTS,
        payload: [...lists, ...newList],
      });
    },
    [lists]
  );

  const deleteSelectedItemsFromList = useCallback(
    (item): void => {
      const copyLists = lists;
      const newList = pullAllBy(copyLists, [item]);
      setGlobalState({
        type: EGlobalStateTypes.SET_LISTS,
        payload: [...[], ...newList],
      });
    },
    [lists]
  );

  return (
    <>
      <Panel
        isBlocking
        headerText="List Notifications Settings"
        isOpen={isOpen}
        onDismiss={onDismiss}
        closeButtonAriaLabel="Close"
      >
        <Stack styles={panelContainerStyles}>
          <Text variant="smallPlus" block>
           {strings.ConfigurationListTitle}
          </Text>
        </Stack>
        <Separator></Separator>
        <ErrorInfo error={errorInfo?.error} showError={errorInfo?.showError}></ErrorInfo>
        <Stack tokens={{ childrenGap: 10 }}>
          <AddItem onAdd={addSelectedItemsToList}></AddItem>
          <Stack tokens={{ childrenGap: 5 }} styles={stackItemsContainer}>
            <Label>Selected Lists</Label>
            {lists.length ? (
              lists.map((item) => {
                return <ListItem item={item} onDelete={deleteSelectedItemsFromList} />;
              })
            ) : (
              <ListItemNoLists></ListItemNoLists>
            )}
          </Stack>

          <Stack styles={{ root: { paddingTop: 20 } }} tokens={{ childrenGap: 5 }}>
            <Separator></Separator>
            <DialogFooter>
              <PrimaryButton
                disabled={!lists.length}
                onClick={async () => {
                  setIsUpdating(true);
                  await saveSettings(JSON.stringify(lists));
                  setGlobalState({
                    type: EGlobalStateTypes.SET_LISTS,
                    payload: lists,
                  });
                  onDismiss();
                  setIsUpdating(false);
                }}
              >
                {isUpdating ? <Spinner size={SpinnerSize.small} /> : strings.OKLabel}
              </PrimaryButton>
              <DefaultButton
                onClick={() => {
                  setGlobalState({
                    type: EGlobalStateTypes.SET_LISTS,
                    payload: wListBackup.current,
                  });
                  onDismiss();
                }}
              >
                Cancel
              </DefaultButton>
            </DialogFooter>
          </Stack>
        </Stack>
      </Panel>
    </>
  );
};
