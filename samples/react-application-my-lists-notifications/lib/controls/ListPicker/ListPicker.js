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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as React from "react";
import find from "lodash/find";
import pullAllBy from "lodash/pullAllBy";
import strings from "MyListsNotificationsApplicationCustomizerStrings";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { Label } from "office-ui-fabric-react/lib/Label";
import { TagPicker, } from "office-ui-fabric-react/lib/Pickers";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { Text } from "office-ui-fabric-react/lib/Text";
import StackItem from "@fluentui/react/lib/components/Stack/StackItem/StackItem";
import { FontIcon } from "@fluentui/react/lib/Icon";
import { useMsGraphAPI } from "../../hooks";
import { useListPickerStyles } from "./ListPickerStyles";
import { RenderSugestedItem } from "./RenderSugestedItem";
var pickerSuggestionsProps = {
    suggestionsHeaderText: strings.ListPickerSugestionsHeaderText,
    noResultsFoundText: strings.ListPickernoResultsFoundText,
};
var initialState = {
    savedSelectedLists: [],
};
var getTextFromItem = function (item) { return item.name; };
// Reducer to update state
var reducer = function (state, action) {
    switch (action.type) {
        case "UPDATE_SELECTEDITEM":
            return __assign(__assign({}, state), { savedSelectedLists: action.payload });
        default:
            return state;
    }
};
// select Team control
export var ListPicker = function (props) {
    var _a;
    // initialize reducer
    var _b = React.useReducer(reducer, initialState), state = _b[0], dispatch = _b[1];
    var picker = React.useRef(null);
    var getLists = useMsGraphAPI().getLists;
    var onSelectedLists = props.onSelectedLists, selectedLists = props.selectedLists, itemLimit = props.itemLimit, label = props.label, styles = props.styles, themeVariant = props.themeVariant;
    var _c = useListPickerStyles(themeVariant), pickerStylesMulti = _c.pickerStylesMulti, pickerStylesSingle = _c.pickerStylesSingle, renderItemStylesMulti = _c.renderItemStylesMulti, renderItemStylesSingle = _c.renderItemStylesSingle, renderIconButtonRemoveStyles = _c.renderIconButtonRemoveStyles;
    var useFilterSuggestedLists = React.useCallback(function (filterText, listsList) { return __awaiter(void 0, void 0, void 0, function () {
        var tags, lists, listData, _i, listData_1, list, listInfo, checkExists, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    tags = [];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getLists(filterText)];
                case 2:
                    lists = _c.sent();
                    listData = (_a = lists) === null || _a === void 0 ? void 0 : _a.hits;
                    if ((_b = listData) === null || _b === void 0 ? void 0 : _b.length) {
                        for (_i = 0, listData_1 = listData; _i < listData_1.length; _i++) {
                            list = listData_1[_i];
                            listInfo = list.resource;
                            checkExists = find(listsList, { key: listInfo.id });
                            if (checkExists)
                                continue;
                            tags.push({ key: listInfo.id, name: JSON.stringify(listInfo) });
                        }
                    }
                    return [2 /*return*/, tags];
                case 3:
                    error_1 = _c.sent();
                    console.log(error_1);
                    return [2 /*return*/, tags];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    React.useEffect(function () {
        dispatch({
            type: "UPDATE_SELECTEDITEM",
            payload: selectedLists,
        });
    }, [props]);
    var _onRenderItem = React.useCallback(function (itemProps) {
        var itemInfo = JSON.parse(itemProps.item.name);
        var savedSelectedLists = state.savedSelectedLists;
        if (itemProps.item) {
            return (React.createElement(Stack, { horizontal: true, horizontalAlign: "start", verticalAlign: "center", tokens: { childrenGap: 7 }, styles: itemLimit && itemLimit > 1 ? renderItemStylesMulti : renderItemStylesSingle },
                React.createElement(FontIcon, { iconName: "list", style: { width: 18, height: 18, fontSize: 18 } }),
                React.createElement(StackItem, { grow: 2 },
                    React.createElement(Text, { variant: "smallPlus", nowrap: true }, itemInfo.displayName)),
                React.createElement(IconButton, { styles: renderIconButtonRemoveStyles, iconProps: { iconName: "Cancel" }, title: strings.ListPickerButtonRemoveTitle, onClick: function (ev) {
                        ev.stopPropagation();
                        var _newSelectedLists = pullAllBy(savedSelectedLists, [itemProps.item]);
                        onSelectedLists(_newSelectedLists);
                        dispatch({
                            type: "UPDATE_SELECTEDITEM",
                            payload: _newSelectedLists,
                        });
                    } })));
        }
        else {
            return null;
        }
    }, [
        selectedLists,
        state.savedSelectedLists,
        props.themeVariant,
        renderItemStylesSingle,
        renderIconButtonRemoveStyles,
        renderItemStylesMulti,
    ]);
    // reder sugestion Items
    var _onRenderSuggestionsItem = React.useCallback(function (propsTag, itemProps) {
        return React.createElement(RenderSugestedItem, { tag: propsTag, themeVariant: themeVariant });
    }, [props.themeVariant]);
    // Render  control
    return (React.createElement("div", { style: { width: "100%" } },
        label && React.createElement(Label, null, label),
        React.createElement(TagPicker, { styles: (styles !== null && styles !== void 0 ? styles : (itemLimit && itemLimit > 1 ? pickerStylesMulti : pickerStylesSingle)), selectedItems: state.savedSelectedLists, onRenderItem: _onRenderItem, onRenderSuggestionsItem: _onRenderSuggestionsItem, onResolveSuggestions: useFilterSuggestedLists, getTextFromItem: getTextFromItem, pickerSuggestionsProps: pickerSuggestionsProps, onEmptyResolveSuggestions: function (selectLists) {
                return useFilterSuggestedLists("", selectLists);
            }, itemLimit: (_a = props.itemLimit, (_a !== null && _a !== void 0 ? _a : undefined)), onChange: function (items) {
                onSelectedLists(items);
                dispatch({ type: "UPDATE_SELECTEDITEM", payload: items });
            }, componentRef: picker })));
};
//# sourceMappingURL=ListPicker.js.map