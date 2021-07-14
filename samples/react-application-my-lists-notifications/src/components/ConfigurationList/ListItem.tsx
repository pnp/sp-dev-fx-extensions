import * as React from "react";
import { useContext, useState } from "react";

import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { FontIcon } from "office-ui-fabric-react/lib/Icon";
import { Stack } from "office-ui-fabric-react/lib/Stack";

import {
  HoverCard,
  HoverCardType,
  IconButton,
  IIconProps,
  IPlainCardProps,
  Link,
  Separator,
  Text,
} from "@fluentui/react";
import { DocumentCard, DocumentCardActivity, DocumentCardDetails } from "@fluentui/react/lib/DocumentCard";
import { List, Site } from "@microsoft/microsoft-graph-types";

import { AppContext } from "../../common/AppContext";
import { PHOTO_URL } from "../../common/constants";
import { useListPickerStyles } from "../../controls/ListPicker/ListPickerStyles";
import { useMsGraphAPI } from "../../hooks/useMsGraphAPI";
import { GlobalStateContext } from "../GlobalStateProvider";
import { IConfigurationListItem } from "./IConfigurationListItem";
import { IListItemProps } from "./IListItemProps";
import { useConfigurationListStyles } from "./useConfigurationListStyles";

const iconDeleteProps: IIconProps = {
  iconName: "Delete",
  styles: { root: { fontSize: 14 } },
};
export const ListItem: React.FunctionComponent<IListItemProps> = (props: React.PropsWithChildren<IListItemProps>) => {
  const { theme, context } = React.useContext(AppContext);
  const { documentCardStyles, configurationListClasses } = useConfigurationListStyles();
  const { state, setGlobalState } = useContext(GlobalStateContext);

  const { item, onDelete } = props;
  const { getSiteInfo, getListInfo } = useMsGraphAPI();
  const [siteInfo, setSiteInfo] = useState<Site>(undefined);
  const [ListInfoDetails, setListDetailsInfo] = useState<List>(undefined);
  const { stacklabelHoverItem } = useListPickerStyles(theme);

  React.useEffect(() => {
    (async () => {
      const siteData: Site = await getSiteInfo(item.siteId);
      setSiteInfo(siteData);
      const listDetails: List = await getListInfo(siteData.id, item.key as string);
      setListDetailsInfo(listDetails);
    })();
  }, [item]);

  const onRenderPlainCard = React.useCallback(
    (data: any): JSX.Element | null => {
      const listInfo: IConfigurationListItem = data.item as IConfigurationListItem;
      return (
        <>
          <DocumentCard key={listInfo.key}>
            <DocumentCardDetails>
              <Stack tokens={{ childrenGap: 10, padding: 10 }}>
                <Stack
                  horizontal
                  horizontalAlign="start"
                  verticalAlign="start"
                  tokens={{ childrenGap: 10 }}
                  styles={stacklabelHoverItem}
                >
                  <FontIcon
                    iconName="list"
                    style={{ width: 22, height: 22, fontSize: 22, color: theme.themePrimary }}
                  ></FontIcon>
                  <Link href={listInfo.site}>
                    <Text
                      variant="medium"
                      nowrap
                      title="List"
                      styles={{ root: { fontWeight: 700, color: theme.themePrimary } }}
                    >
                      {listInfo.list}
                    </Text>
                  </Link>
                </Stack>
                <Stack
                  horizontal
                  horizontalAlign="start"
                  verticalAlign="center"
                  tokens={{ childrenGap: 10 }}
                  styles={stacklabelHoverItem}
                  style={{ paddingTop: 0 }}
                >
                  <FontIcon iconName="Globe" style={{ width: 18, height: 18, fontSize: 18 }}></FontIcon>
                  <Link href={siteInfo.webUrl}>
                    <Text variant="smallPlus" nowrap>
                      {siteInfo.displayName}
                    </Text>
                  </Link>
                </Stack>
              </Stack>
              <Separator></Separator>
              <DocumentCardActivity
                activity={`Created ${format(parseISO(ListInfoDetails?.createdDateTime), "PPpp")}`}
                people={[
                  {
                    name: ListInfoDetails?.createdBy?.user.displayName,
                    profileImageSrc: `${PHOTO_URL}${(ListInfoDetails.createdBy.user as any).email}`,
                  },
                ]}
              />
            </DocumentCardDetails>
          </DocumentCard>
        </>
      );
    },
    [siteInfo, ListInfoDetails]
  );

  const plainCardProps: IPlainCardProps = React.useMemo(() => {
    return { onRenderPlainCard: onRenderPlainCard, renderData: { item } };
  }, [onRenderPlainCard, item]);

  return (
    <>
      <DocumentCard styles={documentCardStyles}>
        <DocumentCardDetails>
          <Stack tokens={{ childrenGap: 5, padding: 5 }} style={{ width: "100%" }}>
            <Stack
              horizontal
              horizontalAlign="start"
              verticalAlign="center"
              styles={{ root: { paddingLeft: 10 } }}
              tokens={{ childrenGap: 10 }}
            >
              <FontIcon iconName="list" className={configurationListClasses.listIcon} />
              <Stack grow={2} style={{ overflow: "hidden" }}>
                <HoverCard plainCardProps={plainCardProps} type={HoverCardType.plain} instantOpenOnClick={true}>
                  <Text title={item.list} style={{ fontSize: "600", color: theme.themePrimary }} variant="smallPlus">
                    {item.list}
                  </Text>
                </HoverCard>
              </Stack>
              <IconButton
                iconProps={iconDeleteProps}
                onClick={() => {
                  onDelete(item);
                }}
              />
            </Stack>
          </Stack>
        </DocumentCardDetails>
      </DocumentCard>
    </>
  );
};
