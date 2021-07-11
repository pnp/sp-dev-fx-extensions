var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from "react";
import { useContext } from "react";
import strings from "MyListsNotificationsApplicationCustomizerStrings";
import { IconButton, Link } from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import { Panel } from "@fluentui/react/lib/Panel";
import { Stack, StackItem } from "@fluentui/react/lib/Stack";
import { Text } from "@fluentui/react/lib/Text";
import Badge from "@material-ui/core/Badge";
import { FontIcon } from "@microsoft/office-ui-fabric-react-bundle";
import { ConfigurationList } from "../ConfigurationList";
import { EGlobalStateTypes, GlobalStateContext } from "../GlobalStateProvider";
import { RenderNotification } from "../RenderNotification/RenderNotification";
import { useBadgeStyles } from "./useBadgeStyles";
export var NotificationBadge = function (props) {
    var numberOfNotifications = props.numberOfNotifications, iconName = props.iconName;
    var _a = useBoolean(false), isOpenPanel = _a[0], _b = _a[1], openPanel = _b.setTrue, dismissPanel = _b.setFalse;
    var _c = useBoolean(false), isShowSettings = _c[0], _d = _c[1], showSettings = _d.setTrue, dismissSettings = _d.setFalse;
    var _e = useBadgeStyles(), panelTitleStyles = _e.panelTitleStyles, iconTitleStyles = _e.iconTitleStyles;
    var _f = useContext(GlobalStateContext), state = _f.state, setGlobalState = _f.setGlobalState;
    var onRenderNavigationContent = React.useCallback(function (_props, defaultRender) { return (React.createElement(React.Fragment, null,
        React.createElement(Stack, { horizontal: true, verticalAlign: "center", horizontalAlign: "start", styles: panelTitleStyles },
            React.createElement(StackItem, { grow: 2 },
                React.createElement(Text, { variant: "xLarge" }, strings.MyListsNotificationsLabel)),
            React.createElement(IconButton, { iconProps: { iconName: "Settings", styles: __assign({}, iconTitleStyles) }, title: strings.MySettingsLabel, onClick: function (ev) {
                    showSettings();
                } }),
            React.createElement(IconButton, { iconProps: { iconName: "cancel", styles: __assign({}, iconTitleStyles) }, title: "Close", onClick: function (ev) {
                    dismissPanel();
                } })))); }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(Stack, { horizontal: true, verticalAlign: "center", horizontalAlign: "end", tokens: { padding: 5 }, onClick: openPanel },
            React.createElement(Badge, { badgeContent: numberOfNotifications, color: "error" },
                React.createElement(FontIcon, { iconName: iconName, style: { fontSize: 20, width: 20, height: 20 } }))),
        React.createElement(Panel, { isBlocking: true, isOpen: isOpenPanel, closeButtonAriaLabel: "Close", onRenderNavigationContent: onRenderNavigationContent },
            React.createElement(Stack, { tokens: { childrenGap: 10 }, styles: { root: { paddingTop: 25, paddingBottom: 30 } } },
                numberOfNotifications && (React.createElement(Stack, { horizontal: true, horizontalAlign: "end" },
                    React.createElement(Link, { onClick: function () {
                            setGlobalState({
                                type: EGlobalStateTypes.SET_LIST_ACTIVITY,
                                payload: [],
                            });
                            setGlobalState({
                                type: EGlobalStateTypes.SET_NUMBER_OF_NOTIFICATIONS,
                                payload: 0,
                            });
                        } }, strings.ClearAllLabel))),
                React.createElement(RenderNotification, null)),
            React.createElement(ConfigurationList, { isOpen: isShowSettings, onDismiss: dismissSettings }))));
};
//# sourceMappingURL=Badge.js.map