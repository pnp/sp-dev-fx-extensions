import * as React from "react";
import strings from "MyListsNotificationsApplicationCustomizerStrings";
import { FontIcon } from "office-ui-fabric-react/lib/Icon";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { Text } from "@fluentui/react";
import { useConfigurationListStyles } from "./useConfigurationListStyles";
export var ListItemNoLists = function () {
    var configurationListClasses = useConfigurationListStyles().configurationListClasses;
    return (React.createElement(React.Fragment, null,
        React.createElement(Stack, { tokens: { childrenGap: 5, padding: 25 } },
            React.createElement(Stack, { horizontalAlign: "center", tokens: { childrenGap: 10 } },
                React.createElement(FontIcon, { iconName: "Info", className: configurationListClasses.nolistItemIcon }),
                React.createElement(Text, { variant: "medium" }, strings.noListsLabel)))));
};
//# sourceMappingURL=ListItemNoLists.js.map