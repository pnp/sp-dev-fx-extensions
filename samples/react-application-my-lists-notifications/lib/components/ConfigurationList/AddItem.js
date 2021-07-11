var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import * as React from "react";
import { useCallback, useContext, useState } from "react";
import find from "lodash/find";
import strings from "MyListsNotificationsApplicationCustomizerStrings";
import { Label } from "office-ui-fabric-react/lib/Label";
import { PrimaryButton } from "@fluentui/react/lib/components/Button";
import { Stack } from "@fluentui/react/lib/Stack";
import { AppContext } from "../../common";
import { EGlobalStateTypes, GlobalStateContext } from "../../components/";
import { ListPicker } from "../../controls/ListPicker";
export var AddItem = function (props) {
    var _a = useContext(AppContext), context = _a.context, theme = _a.theme;
    // const {siteId, siteAbsoluteUrl,webId,webAbsoluteUrl,webTitle, list } = context.pageContext.legacyPageContext;
    var _b = useState([]), selectedLists = _b[0], setSelectedLists = _b[1];
    var _c = useState(true), disableButton = _c[0], setDisableButton = _c[1];
    var _d = useContext(GlobalStateContext), state = _d.state, setGlobalState = _d.setGlobalState;
    var lists = state.lists;
    var addSelectedItemsToList = useCallback(function (selectedItems) {
        var _a, _b, _c;
        var newList = [];
        for (var _i = 0, selectedItems_1 = selectedItems; _i < selectedItems_1.length; _i++) {
            var itemInfo = selectedItems_1[_i];
            var item = JSON.parse(itemInfo.name);
            var exists = find(lists, ["listUrl", item.webUrl]);
            if (!exists) {
                newList.push({
                    listName: item.name,
                    key: (_a = item) === null || _a === void 0 ? void 0 : _a.id,
                    list: (_b = item) === null || _b === void 0 ? void 0 : _b.displayName,
                    site: (_c = item) === null || _c === void 0 ? void 0 : _c.webUrl,
                    siteId: item.parentReference.siteId,
                    listUrl: item.webUrl,
                });
            }
        }
        setDisableButton(true);
        setSelectedLists([]);
        setGlobalState({
            type: EGlobalStateTypes.SET_LISTS,
            payload: __spreadArrays(lists, newList),
        });
    }, [lists]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Stack, { verticalAlign: "center", tokens: { childrenGap: 5 } },
            React.createElement(Label, null, strings.SearchListsLabel),
            React.createElement(ListPicker, { selectedLists: selectedLists, themeVariant: theme, onSelectedLists: function (sltlists) {
                    setSelectedLists(sltlists);
                    setDisableButton(!sltlists.length);
                } }),
            React.createElement(Stack, { horizontal: true, horizontalAlign: "start", verticalAlign: "center", tokens: { childrenGap: 5 } },
                React.createElement(PrimaryButton, { disabled: disableButton, onClick: function (ev) {
                        ev.stopPropagation();
                        addSelectedItemsToList(selectedLists);
                    } }, strings.OKLabel)))));
};
//# sourceMappingURL=AddItem.js.map