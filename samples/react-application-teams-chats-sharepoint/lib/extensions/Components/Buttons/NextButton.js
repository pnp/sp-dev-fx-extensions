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
var NextButton = function (props) {
    var currentStep = props.currentStep, stepsLength = props.stepsLength;
    var nextStepIndex = Math.min(currentStep + 1, stepsLength - 1);
    return (React.createElement(NavButton, __assign({}, props, { nextStepIndex: nextStepIndex, kind: "next" })));
};
export default NextButton;
//# sourceMappingURL=NextButton.js.map