var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from "react";
import NavButton from "./NavButton";
var PrevButton = function (props) {
    var currentStep = props.currentStep;
    var nextStepIndex = Math.max(currentStep - 1, 0);
    return (React.createElement(NavButton, __assign({}, props, { nextStepIndex: nextStepIndex, kind: "prev" })));
};
export default PrevButton;
//# sourceMappingURL=PrevButton.js.map