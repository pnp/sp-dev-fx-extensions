import * as React from "react";

import strings from "MyListsNotificationsApplicationCustomizerStrings";
import { FontIcon } from "office-ui-fabric-react/lib/Icon";
import { Stack } from "office-ui-fabric-react/lib/Stack";

import { Text } from "@fluentui/react";

import { AppContext } from "../../common/AppContext";
import { useConfigurationListStyles } from "./useConfigurationListStyles";

export const ListItemNoLists: React.FunctionComponent = () => {
  const { configurationListClasses } = useConfigurationListStyles();

  return (
    <>
      <Stack tokens={{ childrenGap: 5, padding: 25 }}>
        <Stack horizontalAlign="center" tokens={{ childrenGap: 10 }}>
          <FontIcon iconName="Info" className={configurationListClasses.nolistItemIcon} />
          <Text variant="medium">{strings.noListsLabel}</Text>
        </Stack>
      </Stack>
    </>
  );
};
