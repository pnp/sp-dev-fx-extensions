import * as React from "react";
import { AppContext } from "../../common/AppContext";
export var useBadgeStyles = function () {
    var _a = React.useContext(AppContext), theme = _a.theme, context = _a.context;
    var panelTitleStyles = {
        root: {
            width: "100%",
            fontWeight: 700,
            paddingTop: 20,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 20,
        },
    };
    var iconTitleStyles = {
        root: { fontSize: 16 },
    };
    return { iconTitleStyles: iconTitleStyles, panelTitleStyles: panelTitleStyles };
};
//# sourceMappingURL=useBadgeStyles.js.map