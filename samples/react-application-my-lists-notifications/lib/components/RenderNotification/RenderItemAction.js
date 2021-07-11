import * as React from 'react';
import { useMemo } from 'react';
import strings from 'MyListsNotificationsApplicationCustomizerStrings';
import { Link, Text, } from '@fluentui/react';
import { Guid } from '@microsoft/sp-core-library';
import { EActions } from '../../common/EActions';
import { useRenderNotificationStyles } from './useRenderNotificationStyles';
export var RenderItemAction = function (props) {
    var _a, _b, _c;
    var action = props.action, item = props.item;
    var _d = ((_a = props.item) === null || _a === void 0 ? void 0 : _a.fields) || {}, Title = _d.Title, id = _d.id;
    var itemDispFormUrl = (_c = (_b = props) === null || _b === void 0 ? void 0 : _b.item) === null || _c === void 0 ? void 0 : _c.webUrl.replace(id + "_.000", "dispForm.aspx?ID=" + id);
    var configurationListClasses = useRenderNotificationStyles().configurationListClasses;
    var RenderDefaultAction = useMemo(function () {
        if (!action.create)
            return null;
        var displayItemName = Title;
        return (React.createElement("div", { key: Guid.newGuid().toString() },
            React.createElement(Text, { variant: "smallPlus" }, " changed "),
            React.createElement(Link, { title: Title, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: itemDispFormUrl, target: "_blank", "data-interception": "off" }, displayItemName)));
    }, [action, item]);
    var renderCreateAction = useMemo(function () {
        if (!action.create)
            return null;
        var displayCreatedItem = Title;
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus" }, strings.CreatedActionLabel),
            React.createElement(Link, { title: Title, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: itemDispFormUrl, target: "_blank", "data-interception": "off" }, displayCreatedItem)));
    }, [action, item]);
    var renderEditAction = useMemo(function () {
        if (!action.edit)
            return null;
        var displayEditItem = Title;
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus" }, " edited "),
            React.createElement(Link, { title: Title, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: itemDispFormUrl, target: "_blank", "data-interception": "off" }, displayEditItem)));
    }, [action, item]);
    var renderDeleteAction = useMemo(function () {
        var _a;
        if (!action.delete)
            return null;
        var displayDeletedItemName = (_a = action) === null || _a === void 0 ? void 0 : _a.delete.name.replace("_.000", "");
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } },
                strings.deleteMessageText,
                " "),
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } }, displayDeletedItemName)));
    }, [action, item]);
    var renderCommentAction = useMemo(function () {
        if (!action.comment)
            return null;
        var displayCommentItemName = Title;
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } }, strings.AddedCommentText),
            React.createElement(Link, { title: Title, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: itemDispFormUrl, target: "_blank", "data-interception": "off" }, displayCommentItemName)));
    }, [action, item]);
    var renderShareAction = useMemo(function () {
        if (!action.share)
            return null;
        var displaySharedItemName = Title;
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } }, strings.sharedTextLabel),
            React.createElement(Link, { title: Title, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: itemDispFormUrl, target: "_blank", "data-interception": "off" }, displaySharedItemName),
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } },
                "with ",
                React.createElement("span", { style: { fontWeight: 700 } }, action.share.recipients.length),
                " recipients")));
    }, [action, item]);
    var renderVersionAction = useMemo(function () {
        var _a;
        if (!action.version)
            return null;
        var displayVersionItemName = Title;
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } },
                " ",
                "add new version ",
                React.createElement("span", { style: { fontWeight: 700 } }, action.version.newVersion)),
            React.createElement(Link, { key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: itemDispFormUrl, target: "_blank", "data-interception": "off" }, displayVersionItemName),
            item && (React.createElement("div", null,
                React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } },
                    " ",
                    "in"),
                React.createElement(Link, { key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: itemDispFormUrl, target: "_blank", "data-interception": "off" }, (_a = item) === null || _a === void 0 ? void 0 : _a.name)))));
    }, [action, item]);
    var actionKey = Object.keys(action)[0];
    switch (actionKey) {
        case EActions.create:
            return renderCreateAction;
        case EActions.edit:
            return renderEditAction;
        case EActions.delete:
            return renderDeleteAction;
        case EActions.comment:
            return renderCommentAction;
        case EActions.share:
            return renderShareAction;
        default:
            return RenderDefaultAction;
    }
};
//# sourceMappingURL=RenderItemAction.js.map