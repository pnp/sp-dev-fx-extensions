var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { getThemeColor } from './themeHelper';
var WaitDialogContent = /** @class */ (function (_super) {
    __extends(WaitDialogContent, _super);
    function WaitDialogContent(props) {
        var _this = _super.call(this, props) || this;
        _this.closeDialog = _this.closeDialog.bind(_this);
        return _this;
    }
    WaitDialogContent.prototype.render = function () {
        var logo = require('./parker.png');
        var dialogType = this.props.showClose ? DialogType.close : DialogType.normal;
        var color = getThemeColor("themePrimary");
        return (React.createElement("div", { style: { width: "400px" } },
            React.createElement(Dialog, { hidden: this.props.hidden, isDarkOverlay: true, isBlocking: true, onDismiss: this.closeDialog, dialogContentProps: {
                    type: dialogType,
                    title: this.props.title,
                    subText: this.props.message
                } },
                React.createElement(Label, null,
                    React.createElement("span", { dangerouslySetInnerHTML: { __html: this.props.error } })),
                React.createElement("div", { style: { fontSize: '0.8em', float: 'right' } },
                    React.createElement("a", { href: "https://github.com/pnp/PnP", target: "_blank", "data-interception": "off", style: { color: color } },
                        "Powered by",
                        React.createElement("br", null),
                        React.createElement("img", { src: logo, style: { width: '100px' } }))))));
    };
    WaitDialogContent.prototype.closeDialog = function () {
        if (this.props.closeCallback) {
            this.props.closeCallback();
        }
    };
    return WaitDialogContent;
}(React.Component));
var div = document.createElement("div");
var WaitDialog = /** @class */ (function () {
    function WaitDialog(props) {
        this.showClose = false;
        this.hidden = true;
        this.close = this.close.bind(this);
    }
    WaitDialog.prototype.render = function () {
        ReactDOM.render(React.createElement(WaitDialogContent, { message: this.message, title: this.title, error: this.error, showClose: this.showClose, closeCallback: this.close, hidden: this.hidden, key: "b" + new Date().toISOString() }), div);
    };
    WaitDialog.prototype.show = function () {
        this.hidden = false;
        this.render();
    };
    WaitDialog.prototype.close = function () {
        this.hidden = true;
        this.render();
    };
    return WaitDialog;
}());
export default WaitDialog;
//# sourceMappingURL=WaitDialog.js.map