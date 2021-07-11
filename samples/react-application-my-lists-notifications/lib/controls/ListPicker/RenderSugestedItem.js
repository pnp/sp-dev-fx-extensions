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
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { DocumentCard, DocumentCardActivity, DocumentCardDetails, FontIcon, HoverCard, HoverCardType, Link, Separator, Text, } from "@fluentui/react";
import { Stack } from "@fluentui/react/lib/Stack";
import { PHOTO_URL } from "../../common";
import { useMsGraphAPI } from "../../hooks";
import { useListPickerStyles } from "./ListPickerStyles";
export var RenderSugestedItem = function (props) {
    var tag = props.tag, themeVariant = props.themeVariant;
    var info = JSON.parse(tag.name);
    var _a = useMsGraphAPI(), getSiteInfo = _a.getSiteInfo, getListInfo = _a.getListInfo;
    var _b = useState(undefined), siteInfo = _b[0], setSiteInfo = _b[1];
    var _c = useState(undefined), ListInfoDetails = _c[0], setListDetailsInfo = _c[1];
    var _d = useListPickerStyles(themeVariant), stacklabelHoverItem = _d.stacklabelHoverItem, componentClasses = _d.componentClasses;
    React.useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var siteData, listDetails;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!tag)
                            return [2 /*return*/];
                        return [4 /*yield*/, getSiteInfo(info.parentReference.siteId)];
                    case 1:
                        siteData = _a.sent();
                        setSiteInfo(siteData);
                        return [4 /*yield*/, getListInfo(siteData.id, info.id)];
                    case 2:
                        listDetails = _a.sent();
                        setListDetailsInfo(listDetails);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [tag]);
    var onRenderPlainCard = React.useCallback(function (data) {
        var _a, _b, _c;
        var listInfo = data.info;
        return (React.createElement(React.Fragment, null,
            React.createElement(DocumentCard, { key: listInfo.id },
                React.createElement(DocumentCardDetails, null,
                    React.createElement(Stack, { tokens: { childrenGap: 10, padding: 10 } },
                        React.createElement(Stack, { horizontal: true, horizontalAlign: "start", verticalAlign: "start", tokens: { childrenGap: 10 }, styles: stacklabelHoverItem },
                            React.createElement(FontIcon, { iconName: "list", className: componentClasses.iconStylesWebUrl }),
                            React.createElement(Link, { href: listInfo.webUrl },
                                React.createElement(Text, { variant: "medium", nowrap: true, title: "List", styles: { root: { fontWeight: 700, color: themeVariant.themePrimary } } }, listInfo.displayName))),
                        React.createElement(Stack, { horizontal: true, horizontalAlign: "start", verticalAlign: "center", tokens: { childrenGap: 10 }, styles: stacklabelHoverItem, style: { paddingTop: 0 } },
                            React.createElement(FontIcon, { iconName: "Globe", className: componentClasses.iconStylesGlobeAndList }),
                            React.createElement(Link, { href: siteInfo.webUrl },
                                React.createElement(Text, { variant: "smallPlus", nowrap: true }, siteInfo.displayName)))),
                    React.createElement(Separator, null),
                    React.createElement(DocumentCardActivity, { activity: "Created " + (ListInfoDetails ? format(parseISO((_a = ListInfoDetails) === null || _a === void 0 ? void 0 : _a.createdDateTime), "PP") : ""), people: [
                            {
                                name: (_c = (_b = ListInfoDetails) === null || _b === void 0 ? void 0 : _b.createdBy) === null || _c === void 0 ? void 0 : _c.user.displayName,
                                profileImageSrc: "" + PHOTO_URL + ListInfoDetails.createdBy.user.email,
                            },
                        ] })))));
    }, [siteInfo, ListInfoDetails]);
    var plainCardProps = React.useMemo(function () {
        return { onRenderPlainCard: onRenderPlainCard, renderData: { info: info } };
    }, [onRenderPlainCard, info]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Stack, { horizontal: true, horizontalAlign: "start", verticalAlign: "center", tokens: { childrenGap: 10, padding: 10, maxWidth: 300 } },
            React.createElement(FontIcon, { iconName: "list", className: componentClasses.iconStylesGlobeAndList }),
            React.createElement(HoverCard, { plainCardProps: plainCardProps, type: HoverCardType.plain, instantOpenOnClick: true },
                React.createElement(Text, { variant: "smallPlus", nowrap: true }, info.displayName)))));
};
//# sourceMappingURL=RenderSugestedItem.js.map