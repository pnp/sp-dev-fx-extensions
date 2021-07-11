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
import { useContext, useState } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { FontIcon } from "office-ui-fabric-react/lib/Icon";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { HoverCard, HoverCardType, IconButton, Link, Separator, Text, } from "@fluentui/react";
import { DocumentCard, DocumentCardActivity, DocumentCardDetails } from "@fluentui/react/lib/DocumentCard";
import { AppContext } from "../../common/AppContext";
import { PHOTO_URL } from "../../common/constants";
import { useListPickerStyles } from "../../controls/ListPicker/ListPickerStyles";
import { useMsGraphAPI } from "../../hooks/useMsGraphAPI";
import { GlobalStateContext } from "../GlobalStateProvider";
import { useConfigurationListStyles } from "./useConfigurationListStyles";
var iconDeleteProps = {
    iconName: "Delete",
    styles: { root: { fontSize: 14 } },
};
export var ListItem = function (props) {
    var _a = React.useContext(AppContext), theme = _a.theme, context = _a.context;
    var _b = useConfigurationListStyles(), documentCardStyles = _b.documentCardStyles, configurationListClasses = _b.configurationListClasses;
    var _c = useContext(GlobalStateContext), state = _c.state, setGlobalState = _c.setGlobalState;
    var item = props.item, onDelete = props.onDelete;
    var _d = useMsGraphAPI(), getSiteInfo = _d.getSiteInfo, getListInfo = _d.getListInfo;
    var _e = useState(undefined), siteInfo = _e[0], setSiteInfo = _e[1];
    var _f = useState(undefined), ListInfoDetails = _f[0], setListDetailsInfo = _f[1];
    var stacklabelHoverItem = useListPickerStyles(theme).stacklabelHoverItem;
    React.useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var siteData, listDetails;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getSiteInfo(item.siteId)];
                    case 1:
                        siteData = _a.sent();
                        setSiteInfo(siteData);
                        return [4 /*yield*/, getListInfo(siteData.id, item.key)];
                    case 2:
                        listDetails = _a.sent();
                        setListDetailsInfo(listDetails);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [item]);
    var onRenderPlainCard = React.useCallback(function (data) {
        var _a, _b, _c;
        var listInfo = data.item;
        return (React.createElement(React.Fragment, null,
            React.createElement(DocumentCard, { key: listInfo.key },
                React.createElement(DocumentCardDetails, null,
                    React.createElement(Stack, { tokens: { childrenGap: 10, padding: 10 } },
                        React.createElement(Stack, { horizontal: true, horizontalAlign: "start", verticalAlign: "start", tokens: { childrenGap: 10 }, styles: stacklabelHoverItem },
                            React.createElement(FontIcon, { iconName: "list", style: { width: 22, height: 22, fontSize: 22, color: theme.themePrimary } }),
                            React.createElement(Link, { href: listInfo.site },
                                React.createElement(Text, { variant: "medium", nowrap: true, title: "List", styles: { root: { fontWeight: 700, color: theme.themePrimary } } }, listInfo.list))),
                        React.createElement(Stack, { horizontal: true, horizontalAlign: "start", verticalAlign: "center", tokens: { childrenGap: 10 }, styles: stacklabelHoverItem, style: { paddingTop: 0 } },
                            React.createElement(FontIcon, { iconName: "Globe", style: { width: 18, height: 18, fontSize: 18 } }),
                            React.createElement(Link, { href: siteInfo.webUrl },
                                React.createElement(Text, { variant: "smallPlus", nowrap: true }, siteInfo.displayName)))),
                    React.createElement(Separator, null),
                    React.createElement(DocumentCardActivity, { activity: "Created " + format(parseISO((_a = ListInfoDetails) === null || _a === void 0 ? void 0 : _a.createdDateTime), "PPpp"), people: [
                            {
                                name: (_c = (_b = ListInfoDetails) === null || _b === void 0 ? void 0 : _b.createdBy) === null || _c === void 0 ? void 0 : _c.user.displayName,
                                profileImageSrc: "" + PHOTO_URL + ListInfoDetails.createdBy.user.email,
                            },
                        ] })))));
    }, [siteInfo, ListInfoDetails]);
    var plainCardProps = React.useMemo(function () {
        return { onRenderPlainCard: onRenderPlainCard, renderData: { item: item } };
    }, [onRenderPlainCard, item]);
    return (React.createElement(React.Fragment, null,
        React.createElement(DocumentCard, { styles: documentCardStyles },
            React.createElement(DocumentCardDetails, null,
                React.createElement(Stack, { tokens: { childrenGap: 5, padding: 5 }, style: { width: "100%" } },
                    React.createElement(Stack, { horizontal: true, horizontalAlign: "start", verticalAlign: "center", styles: { root: { paddingLeft: 10 } }, tokens: { childrenGap: 10 } },
                        React.createElement(FontIcon, { iconName: "list", className: configurationListClasses.listIcon }),
                        React.createElement(Stack, { grow: 2, style: { overflow: "hidden" } },
                            React.createElement(HoverCard, { plainCardProps: plainCardProps, type: HoverCardType.plain, instantOpenOnClick: true },
                                React.createElement(Text, { title: item.list, style: { fontSize: "600", color: theme.themePrimary }, variant: "smallPlus" }, item.list))),
                        React.createElement(IconButton, { iconProps: iconDeleteProps, onClick: function () {
                                onDelete(item);
                            } })))))));
};
//# sourceMappingURL=ListItem.js.map