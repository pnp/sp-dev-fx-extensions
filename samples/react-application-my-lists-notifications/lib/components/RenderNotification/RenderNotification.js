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
import { useCallback, useContext, useEffect, useState } from "react";
import { pullAllBy } from "lodash";
import { Spinner, SpinnerSize } from "@fluentui/react";
import { IconButton } from "@fluentui/react/lib/components/Button";
import { DocumentCard, DocumentCardDetails } from "@fluentui/react/lib/DocumentCard";
import { Stack } from "@fluentui/react/lib/Stack";
import { Text } from "@fluentui/react/lib/Text";
import { Guid } from "@microsoft/sp-core-library";
import { EItemType } from "../../common/EItemType";
import { useMsGraphAPI } from "../../hooks";
import { EGlobalStateTypes, GlobalStateContext } from "../GlobalStateProvider";
import { RenderNotificationFile } from "./RenderNotificationFile";
import { RenderNotificationItem } from "./RenderNotificationItem";
import { useRenderNotificationStyles } from "./useRenderNotificationStyles";
export var RenderNotification = function (props) {
    var _a = useState([]), renderNotifications = _a[0], setRenderNotifications = _a[1];
    var _b = useContext(GlobalStateContext), state = _b.state, setGlobalState = _b.setGlobalState;
    var _c = useRenderNotificationStyles(), documentCardStyles = _c.documentCardStyles, itemContainerStyles = _c.itemContainerStyles;
    var _d = useState(false), setIsLoading = _d[1];
    var getListItem = useMsGraphAPI().getListItem;
    var listActivities = state.listActivities;
    var _renderNoNotifications = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var wRender;
        return __generator(this, function (_a) {
            wRender = [];
            wRender.push(React.createElement(DocumentCard, { styles: documentCardStyles, key: "noData" },
                React.createElement(DocumentCardDetails, { key: Guid.newGuid().toString() },
                    React.createElement(Stack, { horizontal: true, horizontalAlign: "center", verticalAlign: "center", tokens: { padding: 20 }, key: Guid.newGuid().toString() },
                        React.createElement(Text, { variant: "smallPlus" }, "There is no notifications")))));
            return [2 /*return*/, wRender];
        });
    }); }, []);
    var _renderNotifications = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var wRender, _loop_1, _i, listActivities_1, listActivity;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    wRender = [];
                    setIsLoading(true);
                    _loop_1 = function (listActivity) {
                        var listInfo, activitity, _a, itemInfo, type;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    listInfo = listActivity.listInfo, activitity = listActivity.activitity;
                                    return [4 /*yield*/, getListItem((_a = listInfo) === null || _a === void 0 ? void 0 : _a.siteId, (_b = listInfo) === null || _b === void 0 ? void 0 : _b.key, activitity)];
                                case 1:
                                    _a = _b.sent(), itemInfo = _a.itemInfo, type = _a.type;
                                    wRender.push(React.createElement(DocumentCard, { styles: documentCardStyles, key: Guid.newGuid().toString() },
                                        React.createElement(Stack, { horizontal: true, horizontalAlign: "end", key: Guid.newGuid().toString() },
                                            React.createElement(IconButton, { key: Guid.newGuid().toString(), iconProps: { iconName: "cancel" }, style: { fontSize: 10 }, onClick: function (ev) { return __awaiter(void 0, void 0, void 0, function () {
                                                    var newListActivities, _a, _b;
                                                    return __generator(this, function (_c) {
                                                        switch (_c.label) {
                                                            case 0:
                                                                newListActivities = pullAllBy(listActivities, [listActivity]);
                                                                _a = setRenderNotifications;
                                                                if (!listActivities.length) return [3 /*break*/, 2];
                                                                return [4 /*yield*/, _renderNotifications()];
                                                            case 1:
                                                                _b = _c.sent();
                                                                return [3 /*break*/, 4];
                                                            case 2: return [4 /*yield*/, _renderNoNotifications()];
                                                            case 3:
                                                                _b = _c.sent();
                                                                _c.label = 4;
                                                            case 4:
                                                                _a.apply(void 0, [_b]);
                                                                setGlobalState({
                                                                    type: EGlobalStateTypes.SET_LIST_ACTIVITY,
                                                                    payload: newListActivities,
                                                                });
                                                                setGlobalState({
                                                                    type: EGlobalStateTypes.SET_NUMBER_OF_NOTIFICATIONS,
                                                                    payload: newListActivities.length,
                                                                });
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); } })),
                                        React.createElement(DocumentCardDetails, { key: Guid.newGuid().toString() },
                                            React.createElement(Stack, { key: Guid.newGuid().toString(), horizontal: true, horizontalAlign: "start", verticalAlign: "center", tokens: { childrenGap: 12 }, styles: itemContainerStyles }, type === EItemType.listItem ? (React.createElement(RenderNotificationItem, { list: listInfo, activity: activitity, item: itemInfo, key: Guid.newGuid().toString() })) : (React.createElement(RenderNotificationFile, { list: listInfo, activity: activitity, item: itemInfo, key: Guid.newGuid().toString() }))))));
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, listActivities_1 = listActivities;
                    _c.label = 1;
                case 1:
                    if (!(_i < listActivities_1.length)) return [3 /*break*/, 4];
                    listActivity = listActivities_1[_i];
                    return [5 /*yield**/, _loop_1(listActivity)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    setIsLoading(false);
                    return [2 /*return*/, wRender];
            }
        });
    }); }, [listActivities]);
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = setRenderNotifications;
                        if (!listActivities.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, _renderNotifications()];
                    case 1:
                        _b = _c.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, _renderNoNotifications()];
                    case 3:
                        _b = _c.sent();
                        _c.label = 4;
                    case 4:
                        _a.apply(void 0, [_b]);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [listActivities]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Stack, { tokens: { childrenGap: 5 } }, !renderNotifications.length ? (React.createElement(React.Fragment, null,
            React.createElement(Stack, { horizontalAlign: "center", verticalAlign: "center" },
                React.createElement(Spinner, { size: SpinnerSize.medium })))) : (renderNotifications))));
};
//# sourceMappingURL=RenderNotification.js.map