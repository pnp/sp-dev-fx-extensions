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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import * as React from "react";
import { useCallback, useContext, useEffect, useRef } from "react";
import find from "lodash/find";
import { Stack } from "@fluentui/react/lib/Stack";
import { useMsGraphAPI } from "../../hooks";
import { NotificationBadge } from "../Badge/index";
import { EGlobalStateTypes, GlobalStateContext } from "../GlobalStateProvider";
import { useSocketIO } from "../../hooks/useSocketIO";
export var MyNotifications = function (props) {
    var _a = useContext(GlobalStateContext), state = _a.state, setGlobalState = _a.setGlobalState;
    var wLists = useRef([]);
    var _b = useMsGraphAPI(), getListSockectIo = _b.getListSockectIo, getSettings = _b.getSettings, getListActivities = _b.getListActivities;
    var wNumberOfNotifications = useRef(0);
    var wListActivities = useRef([]);
    var context = props.context, right = props.right;
    var siteTemplate = context.pageContext.legacyPageContext.webTemplateConfiguration;
    var COMUNICATION_SITE_ICON_POSITION = 143;
    var TEAM_SITE_ICON_POSITION = 190;
    var rightPosition = right && right > 0 ? right : (siteTemplate === "SITEPAGEPUBLISHING#0" ? COMUNICATION_SITE_ICON_POSITION : TEAM_SITE_ICON_POSITION);
    var containerStyles = {
        root: {
            width: 48,
            height: 48,
            color: "#FFFFFF",
            backgroundColor: "rgba(61,112,131,.6)",
            position: "fixed",
            overflow: "hidden",
            fontFamily: "inherit",
            top: 0,
            right: rightPosition,
            zIndex: 100000,
            ":hover": {
                color: "#FFFFFF",
                backgroundColor: "rgba(4,31,42,.6)",
                cursor: "pointer",
            },
        },
    };
    useEffect(function () {
        setGlobalState({
            type: EGlobalStateTypes.SET_NUMBER_OF_NOTIFICATIONS,
            payload: wNumberOfNotifications.current,
        });
    }, [wNumberOfNotifications.current]);
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _lists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getSettings()];
                    case 1:
                        _lists = _a.sent();
                        setGlobalState({
                            type: EGlobalStateTypes.SET_LISTS,
                            payload: _lists,
                        });
                        return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                wLists.current = state.lists;
                return [2 /*return*/];
            });
        }); })();
    }, [state.lists]);
    var handleNotifications = useCallback(function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var notification, listInfo, _a, siteId, key, activities, copyListActivities;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    wNumberOfNotifications.current++;
                    notification = JSON.parse(data).value;
                    listInfo = find(wLists.current, ["key", notification[0].resource]);
                    if (!listInfo)
                        return [2 /*return*/];
                    _a = listInfo || {}, siteId = _a.siteId, key = _a.key;
                    return [4 /*yield*/, getListActivities(siteId, key)];
                case 1:
                    activities = _b.sent();
                    wListActivities.current.push({
                        listInfo: listInfo,
                        activitity: activities[0],
                    });
                    copyListActivities = state.listActivities;
                    setGlobalState({
                        type: EGlobalStateTypes.SET_LIST_ACTIVITY,
                        payload: __spreadArrays(copyListActivities, wListActivities.current).reverse(),
                    });
                    return [2 /*return*/];
            }
        });
    }); }, []);
    var _c = useSocketIO(handleNotifications), connectToSocketListServer = _c.connectToSocketListServer, closeActiveConnections = _c.closeActiveConnections;
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var listConnections, _i, _a, list, listSubScription, listSocket;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        listConnections = [];
                        closeActiveConnections();
                        _i = 0, _a = state.lists;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        list = _a[_i];
                        return [4 /*yield*/, getListSockectIo(list.siteId, list.key)];
                    case 2:
                        listSubScription = _b.sent();
                        listSocket = connectToSocketListServer(listSubScription.notificationUrl);
                        listConnections.push({ socket: listSocket, listId: list.key });
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        setGlobalState({
                            type: EGlobalStateTypes.SET_ACTIVE_CONNECTIONS,
                            payload: listConnections,
                        });
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [state.lists]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Stack, { verticalAlign: "center", horizontalAlign: "center", styles: containerStyles },
            React.createElement(NotificationBadge, { numberOfNotifications: state.numberOfNotifications, iconName: "ringer" }))));
};
//# sourceMappingURL=MyNotifications.js.map