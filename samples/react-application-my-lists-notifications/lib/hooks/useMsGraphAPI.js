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
import { useCallback, useContext, useEffect } from "react";
import { HttpClient, MSGraphClientFactory } from "@microsoft/sp-http";
import { AppContext } from "../common";
export var EListType;
(function (EListType) {
    EListType["file"] = "file";
    EListType["listItem"] = "listItem";
})(EListType || (EListType = {}));
export var useMsGraphAPI = function () {
    var context = useContext(AppContext).context;
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); })();
    }, [context]);
    var getLists = useCallback(function (searchString) { return __awaiter(void 0, void 0, void 0, function () {
        var msGraphClient, searchRequest, listsResults, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 1:
                    msGraphClient = _a.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    searchRequest = {
                        requests: [
                            {
                                entityTypes: ["list"],
                                query: { queryString: searchString + "*" },
                                sortProperties: [{ name: "lastModifiedDateTime", isDescending: "true" }],
                            },
                        ],
                    };
                    return [4 /*yield*/, msGraphClient.api("/search/query").post(searchRequest)];
                case 2:
                    listsResults = _a.sent();
                    return [2 /*return*/, listsResults.value[0].hitsContainers[0]];
                case 3:
                    error_1 = _a.sent();
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    }); }, [context.serviceScope]);
    var getListActivities = useCallback(function (siteId, listId) { return __awaiter(void 0, void 0, void 0, function () {
        var msGraphClient, listsActivitiesResults, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 1:
                    msGraphClient = _a.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    return [4 /*yield*/, msGraphClient
                            .api("/sites/" + siteId + "/lists/" + listId + "/activities")
                            .expand("listItem($expand=fields),driveItem")
                            .top(1)
                            .version("beta")
                            .get()];
                case 2:
                    listsActivitiesResults = (_a.sent());
                    return [2 /*return*/, listsActivitiesResults.value];
                case 3:
                    error_2 = _a.sent();
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    }); }, [context.serviceScope]);
    var getSiteInfo = useCallback(function (siteId) { return __awaiter(void 0, void 0, void 0, function () {
        var msGraphClient, siteResults, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 1:
                    msGraphClient = _a.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    return [4 /*yield*/, msGraphClient.api("/sites/" + siteId).get()];
                case 2:
                    siteResults = _a.sent();
                    return [2 /*return*/, siteResults];
                case 3:
                    error_3 = _a.sent();
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    }); }, [context.serviceScope]);
    var getSiteInfoByRelativeUrl = useCallback(function (url) { return __awaiter(void 0, void 0, void 0, function () {
        var hostName, msGraphClient, siteResults, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hostName = location.hostname;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 2:
                    msGraphClient = _a.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    return [4 /*yield*/, msGraphClient.api("/sites/" + hostName + ":/" + url)
                            .select("sharepointIds, id, webUrl,displayName,parentReference")
                            .get()];
                case 3:
                    siteResults = _a.sent();
                    return [2 /*return*/, siteResults];
                case 4:
                    error_4 = _a.sent();
                    throw error_4;
                case 5: return [2 /*return*/];
            }
        });
    }); }, [context.serviceScope]);
    var getListInfo = useCallback(function (siteId, listId) { return __awaiter(void 0, void 0, void 0, function () {
        var msGraphClient, siteResults, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 1:
                    msGraphClient = _a.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    return [4 /*yield*/, msGraphClient.api("/sites/" + siteId + "/lists/" + listId).get()];
                case 2:
                    siteResults = _a.sent();
                    return [2 /*return*/, siteResults];
                case 3:
                    error_5 = _a.sent();
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    }); }, [context.serviceScope]);
    var getListItem = useCallback(function (siteId, listId, activity) { return __awaiter(void 0, void 0, void 0, function () {
        var msGraphClient, graphUrl, itemId, listItemResults, type, _a, driveId, error_6, error_7, lItemResults;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 1:
                    msGraphClient = _d.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    graphUrl = "";
                    itemId = "";
                    type = ((_b = activity) === null || _b === void 0 ? void 0 : _b.driveItem) ? "file" : ((_c = activity) === null || _c === void 0 ? void 0 : _c.listItem) ? "listItem" : undefined;
                    _a = type;
                    switch (_a) {
                        case EListType.file: return [3 /*break*/, 2];
                        case EListType.listItem: return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 8];
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    driveId = activity.driveItem.parentReference.driveId;
                    itemId = activity.driveItem.parentReference.id;
                    graphUrl = "/sites/" + siteId + "/drives/" + driveId + "/items/" + itemId;
                    return [4 /*yield*/, msGraphClient.api(graphUrl).get()];
                case 3:
                    listItemResults = (_d.sent());
                    return [2 /*return*/, { itemInfo: listItemResults, type: type }];
                case 4:
                    error_6 = _d.sent();
                    return [2 /*return*/, { itemInfo: undefined, type: type }];
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    itemId = activity.listItem.id;
                    graphUrl = "/sites/" + siteId + "/lists/" + listId + "/items/" + itemId;
                    return [4 /*yield*/, msGraphClient.api(graphUrl).get()];
                case 6:
                    listItemResults = (_d.sent());
                    return [2 /*return*/, { itemInfo: listItemResults, type: type }];
                case 7:
                    error_7 = _d.sent();
                    return [2 /*return*/, { itemInfo: undefined, type: type }];
                case 8:
                    graphUrl = "/sites/" + siteId + "/lists/" + listId;
                    return [4 /*yield*/, msGraphClient.api(graphUrl).get()];
                case 9:
                    lItemResults = (_d.sent());
                    type = lItemResults.list.template === "documentLibrary" ? "file" : "listItem";
                    return [2 /*return*/, { itemInfo: undefined, type: type }];
            }
        });
    }); }, [context.serviceScope]);
    var getListSockectIo = useCallback(function (siteId, listId) { return __awaiter(void 0, void 0, void 0, function () {
        var msGraphClient, listSubscription, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 1:
                    msGraphClient = _a.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    return [4 /*yield*/, msGraphClient
                            .api("/sites/" + siteId + "/lists/" + listId + "/subscriptions/socketIo")
                            .get()];
                case 2:
                    listSubscription = (_a.sent());
                    return [2 /*return*/, listSubscription];
                case 3:
                    error_8 = _a.sent();
                    throw error_8;
                case 4: return [2 /*return*/];
            }
        });
    }); }, [context.serviceScope]);
    var createAppFolder = useCallback(function (folderName) { return __awaiter(void 0, void 0, void 0, function () {
        var msGraphClient, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 1:
                    msGraphClient = _a.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    return [4 /*yield*/, msGraphClient.api("/me/drive/special/approot").header("content-type", "application/json").put({
                            name: folderName,
                            folder: {},
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_9 = _a.sent();
                    console.log("er", error_9);
                    // Ignore if folder exists
                    if (error_9.code !== "nameAlreadyExists") {
                        throw error_9;
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [context.serviceScope]);
    var saveSettings = useCallback(function (settings) { return __awaiter(void 0, void 0, void 0, function () {
        var msGraphClient, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 1:
                    msGraphClient = _a.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    return [4 /*yield*/, msGraphClient
                            .api("/me/drive/special/approot:/MyListsNotifications/appsettings.json:/content")
                            .header("content-type", "plain/text")
                            .put(JSON.stringify(settings))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_10 = _a.sent();
                    throw error_10;
                case 4: return [2 /*return*/];
            }
        });
    }); }, [context.serviceScope]);
    var getSettings = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var msGraphClient, downLoadUrlResponse, fileSettings, data, _a, _b, error_11;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, context.serviceScope.consume(MSGraphClientFactory.serviceKey).getClient()];
                case 1:
                    msGraphClient = _c.sent();
                    if (!msGraphClient)
                        return [2 /*return*/];
                    return [4 /*yield*/, msGraphClient
                            .api("/me/drive/special/approot:/MyListsNotifications/appsettings.json?select=@microsoft.graph.downloadUrl")
                            .get()];
                case 2:
                    downLoadUrlResponse = (_c.sent());
                    return [4 /*yield*/, context.httpClient.get(downLoadUrlResponse["@microsoft.graph.downloadUrl"], HttpClient.configurations.v1)];
                case 3:
                    fileSettings = _c.sent();
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fileSettings.json()];
                case 4:
                    data = _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/, data];
                case 5:
                    error_11 = _c.sent();
                    throw error_11;
                case 6: return [2 /*return*/];
            }
        });
    }); }, [context.serviceScope, context.httpClient]);
    return {
        getSiteInfo: getSiteInfo,
        getLists: getLists,
        getListInfo: getListInfo,
        createAppFolder: createAppFolder,
        saveSettings: saveSettings,
        getSettings: getSettings,
        getListSockectIo: getListSockectIo,
        getListActivities: getListActivities,
        getListItem: getListItem,
        getSiteInfoByRelativeUrl: getSiteInfoByRelativeUrl
    };
};
//# sourceMappingURL=useMsGraphAPI.js.map