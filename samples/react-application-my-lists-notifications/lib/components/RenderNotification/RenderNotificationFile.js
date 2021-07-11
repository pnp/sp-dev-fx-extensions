import * as React from "react";
import { useMemo } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { ActivityItem, Link, Stack, Text } from "@fluentui/react";
import { Guid } from "@microsoft/sp-core-library";
import { PHOTO_URL } from "../../common";
import { RenderFileAction } from "./RenderFileAction";
export var RenderNotificationFile = function (props) {
    var _a = props.list, list = _a.list, site = _a.site;
    var _b = props.activity, action = _b.action, actor = _b.actor, times = _b.times, driveItem = _b.driveItem;
    var activityDescription = useMemo(function () {
        return (React.createElement(React.Fragment, null,
            React.createElement(Text, { key: Guid.newGuid().toString(), variant: "smallPlus", styles: { root: { fontWeight: 700 } } }, actor.user.displayName),
            React.createElement(Text, { variant: "smallPlus", key: Guid.newGuid().toString() },
                React.createElement(RenderFileAction, { action: action, item: driveItem })),
            React.createElement(Text, { variant: "smallPlus" }, " in "),
            React.createElement(Link, { key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: site, target: "_blank", "data-interception": "off" }, list)));
    }, [props]);
    return (React.createElement("div", { key: Guid.newGuid().toString() },
        React.createElement(Stack, null,
            React.createElement(ActivityItem, { key: Guid.newGuid().toString(), activityPersonas: [{ imageUrl: "" + PHOTO_URL + actor.user.email }], activityDescription: activityDescription, timeStamp: format(parseISO(times.recordedDateTime), "PPpp") }))));
};
//# sourceMappingURL=RenderNotificationFile.js.map