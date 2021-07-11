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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as React from "react";
import * as ReactDom from "react-dom";
import { override } from "@microsoft/decorators";
import { BaseApplicationCustomizer, PlaceholderName } from "@microsoft/sp-application-base";
import { Log } from "@microsoft/sp-core-library";
import { AppContext } from "../../common";
import { GlobalStateProvider } from "../../components";
import { MyNotifications } from "../../components/MyNotifications/MyNotifications";
var LOG_SOURCE = "MyListsNotificationsApplicationCustomizer";
var theme = window.__themeState__.theme;
/** A Custom Action which can be run during execution of a Client Side Application */
var MyListsNotificationsApplicationCustomizer = /** @class */ (function (_super) {
    __extends(MyListsNotificationsApplicationCustomizer, _super);
    function MyListsNotificationsApplicationCustomizer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyListsNotificationsApplicationCustomizer.prototype.onInit = function () {
        Log.info(LOG_SOURCE, "Initialized " + "teste");
        this._renderPlaceHolders();
        return Promise.resolve();
    };
    MyListsNotificationsApplicationCustomizer.prototype._renderPlaceHolders = function () {
        // Check if the header placeholder is already set and if the header placeholder is available
        if (!this._headerPlaceholder &&
            this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1) {
            this._headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
                onDispose: this._onDispose,
            });
            // The extension should not assume that the expected placeholder is available.
            if (!this._headerPlaceholder) {
                console.error("The expected placeholder (PageHeader) was not found.");
                return;
            }
            if (this._headerPlaceholder.domElement) {
                var appContext = React.createElement(AppContext.Provider, {
                    value: { context: this.context, theme: theme },
                }, React.createElement(MyNotifications, {
                    context: this.context,
                    right: this.properties.right
                }));
                var elementProvider = React.createElement(GlobalStateProvider, {
                    children: appContext,
                });
                ReactDom.render(elementProvider, this._headerPlaceholder.domElement);
            }
        }
    };
    MyListsNotificationsApplicationCustomizer.prototype._onDispose = function () {
        console.log("dispose TeamsChatNotifications");
    };
    __decorate([
        override
    ], MyListsNotificationsApplicationCustomizer.prototype, "onInit", null);
    return MyListsNotificationsApplicationCustomizer;
}(BaseApplicationCustomizer));
export default MyListsNotificationsApplicationCustomizer;
//# sourceMappingURL=MyListsNotificationsApplicationCustomizer.js.map