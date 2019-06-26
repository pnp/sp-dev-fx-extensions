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
import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer, PlaceholderName } from '@microsoft/sp-application-base';
import { SPHttpClient } from '@microsoft/sp-http';
import styles from './components/AppCustomiser.module.scss';
import * as strings from 'HeaderSearchBoxApplicationCustomizerStrings';
/** A Custom Action which can be run during execution of a Client Side Application */
var HeaderSearchBoxApplicationCustomizer = /** @class */ (function (_super) {
    __extends(HeaderSearchBoxApplicationCustomizer, _super);
    function HeaderSearchBoxApplicationCustomizer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.appContext = null;
        _this.searchResultPage = undefined;
        return _this;
    }
    HeaderSearchBoxApplicationCustomizer.prototype.onInit = function () {
        var _this = this;
        // store context so we can use it in other methods
        this.appContext = this.context;
        // do the whole search box injection thing ... 
        this.GetSearchRedirectPage()
            .then(function () {
            if (_this.searchResultPage && _this.searchResultPage.length > 0) {
                // register placeholder execution
                _this.context.placeholderProvider.changedEvent.add(_this, _this.renderPlaceholders);
                // only add search box events if we have somewhere for it to go!
                _this.HandleSearchEvents();
            }
        });
        return Promise.resolve();
    };
    HeaderSearchBoxApplicationCustomizer.prototype.renderPlaceholders = function () {
        if (!this.topPlaceHolder) {
            this.topPlaceHolder = this.appContext.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this.onDispose });
        }
        if (this.topPlaceHolder.domElement) {
            this.topPlaceHolder.domElement.innerHTML = "\n        <div id=" + styles.placeholderHeader + ">\n          <div class=" + styles.Header + ">\n          </div>\n          <div class=\"" + styles.SearchContainer + "\">\n            <div id=\"" + styles.SearchBox + "\">\n              <form aria-label=\"" + strings.FormLabel + "\" role=\"search\">\n                <button class=\"" + styles.buttonMagnifier + "\" title=\"" + strings.ButtonTitleMagnify + "\" aria-label=\"" + strings.ButtonTitleMagnify + "\" aria-hidden=\"true\" type=\"button\" tabindex=\"-1\">\n                  <i class=\"" + styles.icon + " ms-Icon ms-Icon--Search\" aria-hidden=\"true\"></i>\n                </button>\n                <input class=\"" + styles.input + "\" role=\"combobox\" \n                  aria-label=\"" + strings.InputLabel + "\" \n                  aria-autocomplete=\"list\" aria-haspopup=\"true\" aria-expanded=\"false\" accesskey=\"S\" spellcheck=\"false\" autocomplete=\"off\" \n                  autocorrect=\"false\" type=\"search\" placeholder=\"" + strings.InputPlaceholder + "\" data-nav=\"true\" data-tab=\"true\" value=\"\" />\n                <button class=\"" + styles.buttonClear + " false\" type=\"button\" title=\"" + strings.ButtonTitleClear + "\" aria-label=\"" + strings.ButtonTitleClear + "\" data-tab=\"false\" style=\"display: none;\">\n                  <i class=\"" + styles.icon + " ms-Icon ms-Icon--ChromeClose\" aria-hidden=\"true\"></i>\n                </button>\n                <button class=\"" + styles.buttonSearch + "\" title=\"" + strings.ButtonTitleSearch + "\" aria-label=\"" + strings.ButtonTitleSearch + "\" data-tab=\"false\" style=\"display: none;\">\n                  <i class=\"" + styles.icon + " ms-Icon ms-Icon--ChromeBackMirrored\" aria-hidden=\"true\"></i>\n                </button>\n              </form>\n              <div class=\"" + styles.SearchPanel + "\" style=\"display: none;\">\n              </div>\n            </div>\n            <div class=\"" + styles.SearchPanel + "\" />\n          </div>\n        </div>\n        ";
        }
    };
    HeaderSearchBoxApplicationCustomizer.prototype.HandleSearchEvents = function () {
        var _this = this;
        var searchBoxContainer = document.querySelector("#" + styles.SearchBox);
        var searchPanel = searchBoxContainer.querySelector("." + styles.SearchPanel);
        var searchBoxInput = document.querySelector("#" + styles.SearchBox + " input." + styles.input);
        searchBoxInput.addEventListener("focus", function (evt) {
            searchBoxContainer.classList.add("" + styles.active);
            if (searchBoxInput.value.length > 0) {
                _this.showSearchInputButtonDisplay(true);
            }
            var removeClickListener = function () {
                document.removeEventListener('click', outsideClickListener);
            };
            var outsideClickListener = function (event) {
                // if they click outside of the main search container
                if (!searchBoxContainer.contains(event.target)) {
                    // reset the search box size / buttons
                    _this.showSearchInputButtonDisplay(false);
                    searchBoxContainer.classList.remove("" + styles.active);
                    // remove our listener
                    removeClickListener();
                }
            };
            document.addEventListener('click', outsideClickListener);
        });
        // event to handle changes to the search input box
        var searchInputChange = function () {
            searchPanel.innerHTML = "<div>" + strings.PanelTextPrefix + " <b>" + searchBoxInput.value + "</b></div>";
            if (searchBoxInput.value.length > 0) {
                // show the "clear" and "submit" buttons if the box has text
                _this.showSearchInputButtonDisplay(true);
            }
            else {
                _this.showSearchInputButtonDisplay(false);
            }
        };
        // handle changes in the value
        searchBoxInput.addEventListener("change", searchInputChange);
        searchBoxInput.addEventListener("keyup", searchInputChange);
        searchBoxInput.addEventListener("paste", searchInputChange);
        // handle keyboard based submission 
        searchBoxInput.addEventListener("keydown", function (evt) {
            if (evt.keyCode == 13) {
                // stop the default "form submit" function
                evt.cancelBubble = true;
                evt.preventDefault();
                _this.handleSearchRedirect(searchBoxInput.value);
            }
        });
        // clear the search query
        document.querySelector("#" + styles.SearchBox + " button." + styles.buttonClear).addEventListener("click", function (evt) {
            searchBoxInput.focus();
            _this.showSearchInputButtonDisplay(false);
            searchBoxInput.value = "";
        });
        searchPanel.addEventListener("click", function (evt) {
            _this.handleSearchRedirect(searchBoxInput.value);
        });
        // search button
        document.querySelector("#" + styles.SearchBox + " button." + styles.buttonSearch).addEventListener("click", function (evt) {
            // stop any default behaviour
            evt.cancelBubble = true;
            evt.preventDefault();
            // then do the whole redirect thing
            _this.handleSearchRedirect(searchBoxInput.value);
        });
        // focus on the input when the magnifier is clicked
        document.querySelector("#" + styles.SearchBox + " button." + styles.buttonMagnifier).addEventListener("click", function (evt) {
            searchBoxInput.focus();
        });
    };
    HeaderSearchBoxApplicationCustomizer.prototype.showSearchInputButtonDisplay = function (display) {
        var displayStyle = display ? "inline-block" : "none";
        document.querySelector("#" + styles.SearchBox + " ." + styles.SearchPanel).style.display = displayStyle;
        document.querySelector("#" + styles.SearchBox + " ." + styles.buttonClear).style.display = displayStyle;
        document.querySelector("#" + styles.SearchBox + " ." + styles.buttonSearch).style.display = displayStyle;
    };
    HeaderSearchBoxApplicationCustomizer.prototype.handleSearchRedirect = function (searchQuery) {
        if (searchQuery && searchQuery.trim().length > 0) {
            console.log(strings.LogRedirectingTo + " " + this.searchResultPage);
            window.location.href = this.searchResultPage + "?k=" + searchQuery;
        }
    };
    HeaderSearchBoxApplicationCustomizer.prototype.GetSearchRedirectPage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.appContext.spHttpClient.get(_this.appContext.pageContext.web.absoluteUrl + "/_api/web/allProperties", SPHttpClient.configurations.v1)
                .then(function (response) {
                if (response.ok) {
                    response.json().then(function (webProperties) {
                        if (webProperties && webProperties.SRCH_x005f_SB_x005f_SET_x005f_SITE) {
                            _this.searchResultPage = JSON.parse(webProperties.SRCH_x005f_SB_x005f_SET_x005f_SITE).ResultsPageAddress;
                        }
                        resolve();
                    });
                }
                else {
                    reject("" + strings.LogWebPropertiesNotFound);
                }
            });
        });
    };
    __decorate([
        override
    ], HeaderSearchBoxApplicationCustomizer.prototype, "onInit", null);
    return HeaderSearchBoxApplicationCustomizer;
}(BaseApplicationCustomizer));
export default HeaderSearchBoxApplicationCustomizer;
//# sourceMappingURL=HeaderSearchBoxApplicationCustomizer.js.map