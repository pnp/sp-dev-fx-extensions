import * as React from "react";
import { useState } from "react";

import { format, parseISO } from "date-fns";
import { Theme } from "spfx-uifabric-themes";

import {
  DocumentCard,
  DocumentCardActivity,
  DocumentCardDetails,
  FontIcon,
  HoverCard,
  HoverCardType,
  IPlainCardProps,
  ITag,
  Link,
  Separator,
  Text,
} from "@fluentui/react";
import { Stack } from "@fluentui/react/lib/Stack";
import { List, Site } from "@microsoft/microsoft-graph-types";

import { PHOTO_URL } from "../../common";
import { useMsGraphAPI } from "../../hooks";
import { useListPickerStyles } from "./ListPickerStyles";

export interface IRenderSugestedItemProps {
  tag: ITag;
  themeVariant?: Theme;
}

export const RenderSugestedItem: React.FunctionComponent<IRenderSugestedItemProps> = (
  props: React.PropsWithChildren<IRenderSugestedItemProps>
) => {
  const { tag, themeVariant } = props;
  const info: List = JSON.parse(tag.name);
  const { getSiteInfo, getListInfo } = useMsGraphAPI();
  const [siteInfo, setSiteInfo] = useState<Site>(undefined);
  const [ListInfoDetails, setListDetailsInfo] = useState<List>(undefined);
  const { stacklabelHoverItem, componentClasses } = useListPickerStyles(themeVariant);

  React.useEffect(() => {
    (async () => {
      if (!tag) return;
      const siteData: Site = await getSiteInfo(info.parentReference.siteId);
      setSiteInfo(siteData);
      const listDetails: List = await getListInfo(siteData.id, info.id);
      setListDetailsInfo(listDetails);
    })();
  }, [tag]);

  const onRenderPlainCard = React.useCallback(
    (data: any): JSX.Element | null => {
      const listInfo: List = data.info as List;
      return (
        <>
          <DocumentCard key={listInfo.id}>
            <DocumentCardDetails>
              <Stack tokens={{ childrenGap: 10, padding: 10 }}>
                <Stack
                  horizontal
                  horizontalAlign="start"
                  verticalAlign="start"
                  tokens={{ childrenGap: 10 }}
                  styles={stacklabelHoverItem}
                >
                  <FontIcon iconName="list" className={componentClasses.iconStylesWebUrl}></FontIcon>
                  <Link href={listInfo.webUrl}>
                    <Text
                      variant="medium"
                      nowrap
                      title="List"
                      styles={{ root: { fontWeight: 700, color: themeVariant.themePrimary } }}
                    >
                      {listInfo.displayName}
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
                  <FontIcon iconName="Globe" className={componentClasses.iconStylesGlobeAndList}></FontIcon>
                  <Link href={siteInfo.webUrl}>
                    <Text variant="smallPlus" nowrap>
                      {siteInfo.displayName}
                    </Text>
                  </Link>
                </Stack>
              </Stack>
              <Separator></Separator>
              <DocumentCardActivity
                activity={`Created ${ListInfoDetails ? format(parseISO(ListInfoDetails?.createdDateTime), "PP") : ""}`}
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
    return { onRenderPlainCard: onRenderPlainCard, renderData: { info } };
  }, [onRenderPlainCard, info]);

  return (
    <>
      <Stack
        horizontal
        horizontalAlign="start"
        verticalAlign="center"
        tokens={{ childrenGap: 10, padding: 10, maxWidth: 300 }}
      >
        <FontIcon iconName="list" className={componentClasses.iconStylesGlobeAndList}></FontIcon>
        <HoverCard plainCardProps={plainCardProps} type={HoverCardType.plain} instantOpenOnClick={true}>
          <Text variant={"smallPlus"} nowrap>
            {info.displayName}
          </Text>
        </HoverCard>
      </Stack>
    </>
  );
};
