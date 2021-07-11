import * as React from 'react';
import { useMemo, } from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { ActivityItem, Link, Text, } from '@fluentui/react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Guid } from '@microsoft/sp-core-library';
import { PHOTO_URL } from '../../common';
import { RenderItemAction } from './RenderItemAction';
export var RenderNotificationItem = function (props) {
    var _a;
    var _b = props.list, list = _b.list, site = _b.site;
    var _c = props.activity, action = _c.action, actor = _c.actor, times = _c.times, listItem = _c.listItem;
    var _d = ((_a = props.item) === null || _a === void 0 ? void 0 : _a.fields) || {}, Title = _d.Title, id = _d.id;
    var activityDescription = useMemo(function () {
        var _a, _b;
        var itemDispFormUrl = (_b = (_a = props) === null || _a === void 0 ? void 0 : _a.item) === null || _b === void 0 ? void 0 : _b.webUrl.replace(id + "_.000", "dispForm.aspx?ID=" + id);
        return React.createElement(React.Fragment, null,
            React.createElement(Text, { key: Guid.newGuid().toString(), variant: "smallPlus", styles: { root: { fontWeight: 700 } } }, actor.user.displayName),
            ",",
            React.createElement(RenderItemAction, { action: action, item: props.item }),
            React.createElement(Text, { variant: "smallPlus" }, " in "),
            ",",
            React.createElement(Link, { key: Guid.newGuid().toString(), style: { fontWeight: 700 }, href: site, target: "_blank", "data-interception": "off" }, list),
            ",");
    }, [props]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Stack, null,
            React.createElement(ActivityItem, { key: Guid.newGuid().toString(), activityPersonas: [{ imageUrl: "" + PHOTO_URL + actor.user.email }], activityDescription: activityDescription, timeStamp: format(parseISO(times.recordedDateTime), "PPpp") }))));
};
//# sourceMappingURL=RenderNotificationItem.js.map