import * as React from "react";
import classes from "./NavButton.module.scss";
import Arrow from "../Arrow/Arrow";
var NavButton = function (_a) {
    var currentStep = _a.currentStep, nextStepIndex = _a.nextStepIndex, stepsLength = _a.stepsLength, kind = _a.kind, setCurrentStep = _a.setCurrentStep, disableAll = _a.disableAll, rtl = _a.rtl;
    var isLast = stepsLength - 1 === currentStep;
    var isFirst = 0 === currentStep;
    var disabled = disableAll || kind === "next" ? isLast : isFirst;
    function clickHandler() {
        if (!disableAll) {
            setCurrentStep(nextStepIndex);
        }
    }
    return (React.createElement("button", { className: "".concat(classes.navButton), disabled: disabled, onClick: clickHandler, "aria-label": "Go to ".concat(kind, " step"), "aria-disabled": disabled },
        React.createElement(Arrow, { inverted: rtl ? kind === "prev" : kind === "next", disabled: disabled })));
};
export default NavButton;
//# sourceMappingURL=NavButton.js.map