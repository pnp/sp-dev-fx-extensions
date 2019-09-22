var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer, PlaceholderName } from '@microsoft/sp-application-base';
import styles from './GuestMessage.module.scss';
import { sp } from "@pnp/sp";
var LOG_SOURCE = 'GuestMessageApplicationCustomizer';
var GuestMessageApplicationCustomizer = /** @class */ (function (_super) {
    __extends(GuestMessageApplicationCustomizer, _super);
    function GuestMessageApplicationCustomizer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GuestMessageApplicationCustomizer.prototype.onInit = function () {
        sp.setup({ spfxContext: this.context });
        this.context.placeholderProvider.changedEvent.add(this, this._renderPlaceHolders);
        return Promise.resolve();
    };
    GuestMessageApplicationCustomizer.prototype._renderPlaceHolders = function () {
        var _this = this;
        if (!this._topPlaceholder) {
            this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
            if (this._topPlaceholder.domElement) {
                sp.web.currentUser.get().then(function (result) {
                    if (result.LoginName.match("#ext#")) {
                        _this._topPlaceholder.domElement.innerHTML = "\n              <div id=\"userGuessApp\" class=\"" + styles.app + "\">\n                <div class=\"" + styles.top + "\">\n                  <div id=\"pnpinfo\"> ths</div>\n                </div>\n              </div>";
                        _this.getElementStyles();
                    }
                });
            }
        }
    };
    GuestMessageApplicationCustomizer.prototype.getElementStyles = function () {
        this._topPlaceholder.domElement.querySelector("#pnpinfo").innerHTML = this.properties.textmessage;
        this._topPlaceholder.domElement.style.backgroundColor = this.properties.backgroundColor;
        this._topPlaceholder.domElement.style.color = this.properties.textColor;
        this._topPlaceholder.domElement.style.height = "20px";
    };
    __decorate([
        override
    ], GuestMessageApplicationCustomizer.prototype, "onInit", null);
    return GuestMessageApplicationCustomizer;
}(BaseApplicationCustomizer));
export default GuestMessageApplicationCustomizer;
//# sourceMappingURL=GuestMessageApplicationCustomizer.js.map