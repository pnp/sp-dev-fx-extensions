import * as React from "react";
import classes from "./Arrow.module.scss";
var Arrow = function (_a) {
    var disabled = _a.disabled, inverted = _a.inverted, styles = _a.styles;
    return (React.createElement("svg", { className: "".concat(classes.arrow, " ").concat(disabled ? classes.disabled : ""), style: styles, width: "24", height: "25", viewBox: "0 0 24 25", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("path", { d: inverted ? "m9 5.855 7 7-7 7" : "m15 19-7-7 7-7", stroke: "#5A5F79", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round" })));
};
export default Arrow;
//# sourceMappingURL=Arrow.js.map