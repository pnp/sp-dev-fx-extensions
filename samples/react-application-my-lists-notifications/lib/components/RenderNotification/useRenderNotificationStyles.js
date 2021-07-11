import * as React from "react";
import { mergeStyles, mergeStyleSets } from "@fluentui/react";
import { AppContext } from "../../common/AppContext";
export var useRenderNotificationStyles = function () {
    var _a = React.useContext(AppContext), theme = _a.theme, context = _a.context;
    var itemContainerStyles = {
        root: { paddingTop: 0, paddingLeft: 20, paddingRight: 20, paddingBottom: 20 },
    };
    var stackItemsContainer = {
        root: { paddingTop: 15, maxHeight: "calc(100vh - 450px)", overflow: "auto" },
    };
    var documentCardStyles = {
        root: {
            marginTop: 5,
            backgroundColor: theme.neutralLighterAlt,
            ":hover": {
                borderColor: theme.themePrimary,
                borderWidth: 1,
            },
        },
    };
    var configurationListClasses = mergeStyleSets({
        listIcon: mergeStyles({
            fontSize: 18,
            width: 18,
            height: 18,
            color: theme.themePrimary,
        }),
        nolistItemIcon: mergeStyles({
            fontSize: 28,
            width: 28,
            height: 28,
            color: theme.themePrimary,
        }),
        divContainer: {
            display: "block",
        },
    });
    return { configurationListClasses: configurationListClasses, documentCardStyles: documentCardStyles, itemContainerStyles: itemContainerStyles, stackItemsContainer: stackItemsContainer };
};
//# sourceMappingURL=useRenderNotificationStyles.js.map