import * as React from "react";
import sytles from "./Chat.module.scss";
import { useState, useEffect } from "react";
var Chat = function (_a) {
    var label = _a.label, userPhoto = _a.userPhoto;
    var _b = useState(), open = _b[0], setOpen = _b[1];
    useEffect(function () {
        if (open === undefined) {
            setOpen(false);
        }
    });
    function handleClick() {
        if (open === false) {
            setOpen(true);
        }
        else {
            setOpen(false);
        }
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "".concat(open ? sytles.chatDrawerOpen : sytles.chatDrawerClose) },
            React.createElement("div", { className: sytles.chatSlideButton, onClick: handleClick },
                React.createElement("div", { className: sytles.chatLabel },
                    React.createElement("img", { className: sytles.chatPicture, src: userPhoto }),
                    React.createElement("span", { className: sytles.chatText }, label),
                    React.createElement("span", { className: sytles.openChatIcon },
                        open === false &&
                            React.createElement("svg", { className: sytles.openChatSVG, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", "data-supported-dps": "16x16", fill: "currentColor", width: "16", height: "16", focusable: "false" },
                                React.createElement("path", { d: "M15 11L8 6.39 1 11V8.61L8 4l7 4.61z" })),
                        open === true &&
                            React.createElement("svg", { className: sytles.openChatSVG, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", "data-supported-dps": "16x16", fill: "currentColor", width: "16", height: "16", focusable: "false" },
                                React.createElement("path", { d: "M1 5l7 4.61L15 5v2.39L8 12 1 7.39z" }))))),
            React.createElement("div", { className: sytles.chatContent },
                React.createElement("iframe", { className: sytles.chatFrame, src: "https://teams.microsoft.com/embed-client/chats/list?layout=singlePane" })))));
};
export default Chat;
//# sourceMappingURL=Chat.js.map