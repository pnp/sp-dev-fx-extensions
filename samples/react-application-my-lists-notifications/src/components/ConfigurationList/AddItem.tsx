import * as React from "react";
import { useCallback, useContext, useState } from "react";

import find from "lodash/find";
import strings from "MyListsNotificationsApplicationCustomizerStrings";
import { Label } from "office-ui-fabric-react/lib/Label";

import { PrimaryButton } from "@fluentui/react/lib/components/Button";
import { ITag } from "@fluentui/react/lib/Pickers";
import { Stack } from "@fluentui/react/lib/Stack";
import { List } from "@microsoft/microsoft-graph-types";

import { AppContext } from "../../common";
import { EGlobalStateTypes, GlobalStateContext, IConfigurationListItem } from "../../components/";
import { ListPicker } from "../../controls/ListPicker";

export interface IAddItemProps {
}

export const AddItem: React.FunctionComponent<IAddItemProps> = (props: React.PropsWithChildren<IAddItemProps>) => {
  const { context, theme } = useContext(AppContext);
  // const {siteId, siteAbsoluteUrl,webId,webAbsoluteUrl,webTitle, list } = context.pageContext.legacyPageContext;
  const [selectedLists, setSelectedLists] = useState<ITag[]>([]);
  const [disableButton, setDisableButton] = useState<boolean>(true);
  const { state, setGlobalState } = useContext(GlobalStateContext);
  const { lists } = state;

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
      setDisableButton(true);
      setSelectedLists([]);
      setGlobalState({
        type: EGlobalStateTypes.SET_LISTS,
        payload: [...lists, ...newList],
      });
    },
    [lists]
  );

  return (
    <>
      <Stack verticalAlign="center" tokens={{ childrenGap: 5 }}>
        <Label>{strings.SearchListsLabel}</Label>
        <ListPicker
          selectedLists={selectedLists}
          themeVariant={theme}
          onSelectedLists={(sltlists) => {
            setSelectedLists(sltlists);
            setDisableButton(!sltlists.length);
          }}
        ></ListPicker>
        <Stack horizontal horizontalAlign="start" verticalAlign="center" tokens={{ childrenGap: 5 }}>
          <PrimaryButton
            disabled={disableButton}
            onClick={(ev) => {
              ev.stopPropagation();
              addSelectedItemsToList(selectedLists);
            }}
          >
            {strings.OKLabel}
          </PrimaryButton>
        </Stack>
      </Stack>
    </>
  );
};
