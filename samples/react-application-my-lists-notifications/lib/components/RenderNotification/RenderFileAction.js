import * as React from 'react';
import { useMemo } from 'react';
import strings from 'MyListsNotificationsApplicationCustomizerStrings';
import { Link, Text, } from '@fluentui/react';
import { Guid } from '@microsoft/sp-core-library';
import { EActions } from '../../common/EActions';
import { getShortName } from '../../utils/utils';
import { useRenderNotificationStyles } from './useRenderNotificationStyles';
export var RenderFileAction = function (props) {
    var action = props.action, item = props.item;
    var configurationListClasses = useRenderNotificationStyles().configurationListClasses;
    var RenderDefaultAction = useMemo(function () {
        var _a, _b;
        if (!action.create)
            return null;
        var displayFileName = getShortName((_a = item) === null || _a === void 0 ? void 0 : _a.name);
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus" }, " changed "),
            React.createElement(Link, { title: (_b = item) === null || _b === void 0 ? void 0 : _b.name, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: item.webUrl, target: "_blank", "data-interception": "off" }, displayFileName)));
    }, [action, item]);
    var renderCreateAction = useMemo(function () {
        var _a, _b;
        if (!action.create)
            return null;
        var displayCreatedFile = getShortName((_a = item) === null || _a === void 0 ? void 0 : _a.name);
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus" }, strings.CreatedActionLabel),
            React.createElement(Link, { title: (_b = item) === null || _b === void 0 ? void 0 : _b.name, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: item.webUrl, target: "_blank", "data-interception": "off" }, displayCreatedFile)));
    }, [action, item]);
    var renderEditAction = useMemo(function () {
        var _a, _b;
        if (!action.edit)
            return null;
        var displayEditFile = getShortName((_a = item) === null || _a === void 0 ? void 0 : _a.name);
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus" }, " edited "),
            React.createElement(Link, { title: (_b = item) === null || _b === void 0 ? void 0 : _b.name, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: item.webUrl, target: "_blank", "data-interception": "off" }, displayEditFile)));
    }, [action, item]);
    var renderRenameAction = useMemo(function () {
        var _a, _b, _c, _d, _e, _f;
        if (!action.rename)
            return null;
        var displayOldFileName = getShortName((_b = (_a = action) === null || _a === void 0 ? void 0 : _a.rename) === null || _b === void 0 ? void 0 : _b.oldName);
        var displayNewFileName = getShortName((_c = item) === null || _c === void 0 ? void 0 : _c.name);
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus" }, " Renamed "),
            React.createElement(Link, { title: (_e = (_d = action) === null || _d === void 0 ? void 0 : _d.rename) === null || _e === void 0 ? void 0 : _e.oldName, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: item.webUrl, target: "_blank", "data-interception": "off" }, displayOldFileName),
            React.createElement(Text, { variant: "smallPlus" }, " to "),
            React.createElement(Link, { title: (_f = item) === null || _f === void 0 ? void 0 : _f.name, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: item.webUrl, target: "_blank", "data-interception": "off" }, displayNewFileName)));
    }, [action, item]);
    var renderDeleteAction = useMemo(function () {
        var _a, _b, _c, _d;
        if (!action.delete)
            return null;
        var displayDeletedFileName = getShortName((_a = action) === null || _a === void 0 ? void 0 : _a.delete.name);
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } },
                "deleted",
                " "),
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } }, displayDeletedFileName),
            item && (React.createElement("div", null,
                React.createElement(Text, { variant: "smallPlus" },
                    strings.fromFolderTextLabel,
                    " "),
                React.createElement(Link, { title: (_b = item) === null || _b === void 0 ? void 0 : _b.name, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: (_c = item) === null || _c === void 0 ? void 0 : _c.webUrl, target: "_blank", "data-interception": "off" }, (_d = item) === null || _d === void 0 ? void 0 : _d.name)))));
    }, [action, item]);
    var renderRestoreAction = useMemo(function () {
        // TODO to implement
        if (!action.restore)
            return null;
        return (React.createElement("div", { key: Guid.newGuid().toString() }));
    }, [action, item]);
    var renderCommentAction = useMemo(function () {
        var _a, _b, _c;
        if (!action.comment)
            return null;
        var displayCommentFileName = getShortName((_a = item) === null || _a === void 0 ? void 0 : _a.name);
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } }, strings.AddedCommentText),
            React.createElement(Link, { title: (_b = item) === null || _b === void 0 ? void 0 : _b.name, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: (_c = item) === null || _c === void 0 ? void 0 : _c.webUrl, target: "_blank", "data-interception": "off" }, displayCommentFileName)));
    }, [action, item]);
    var renderShareAction = useMemo(function () {
        var _a, _b, _c;
        if (!action.share)
            return null;
        var displaySharedFileName = getShortName((_a = item) === null || _a === void 0 ? void 0 : _a.name);
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } }, strings.sharedTextLabel),
            React.createElement(Link, { title: (_b = item) === null || _b === void 0 ? void 0 : _b.name, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: (_c = item) === null || _c === void 0 ? void 0 : _c.webUrl, target: "_blank", "data-interception": "off" }, displaySharedFileName),
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } },
                "with ",
                React.createElement("span", { style: { fontWeight: 700 } }, action.share.recipients.length),
                " recipients")));
    }, [action, item]);
    var renderVersionAction = useMemo(function () {
        var _a, _b, _c, _d, _e;
        if (!action.version)
            return null;
        var displayVersionFileName = getShortName((_a = item) === null || _a === void 0 ? void 0 : _a.name);
        return (React.createElement("div", { key: Guid.newGuid().toString(), className: configurationListClasses.divContainer },
            React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } },
                strings.addedNewVersionText,
                " ",
                React.createElement("span", { style: { fontWeight: 700 } }, action.version.newVersion)),
            React.createElement(Link, { title: (_b = item) === null || _b === void 0 ? void 0 : _b.name, key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: (_c = item) === null || _c === void 0 ? void 0 : _c.webUrl, target: "_blank", "data-interception": "off" }, displayVersionFileName),
            item && (React.createElement("div", null,
                React.createElement(Text, { variant: "smallPlus", style: { fontWeight: 600 } }, strings.inText),
                React.createElement(Link, { key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: (_d = item) === null || _d === void 0 ? void 0 : _d.webUrl, target: "_blank", "data-interception": "off" }, (_e = item) === null || _e === void 0 ? void 0 : _e.name)))));
    }, [action, item]);
    var actionKey = Object.keys(action)[0];
    switch (actionKey) {
        case EActions.create:
            return renderCreateAction;
        case EActions.edit:
            return renderEditAction;
        case EActions.delete:
            return renderDeleteAction;
        case EActions.rename:
            return renderRenameAction;
        case EActions.restore:
            return renderRestoreAction;
        case EActions.comment:
            return renderCommentAction;
        case EActions.share:
            return renderShareAction;
        case EActions.version:
            return renderVersionAction;
        default:
            return RenderDefaultAction;
    }
};
//# sourceMappingURL=RenderFileAction.js.map