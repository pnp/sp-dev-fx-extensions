define("41033513-c4ad-4a2b-939f-176213702ae6_0.0.1", ["@microsoft/decorators","@microsoft/sp-application-base","@microsoft/sp-http","HeaderSearchBoxApplicationCustomizerStrings"], function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_9__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// EXTERNAL MODULE: external "@microsoft/decorators"
var decorators_ = __webpack_require__(1);
var decorators__default = /*#__PURE__*/__webpack_require__.n(decorators_);

// EXTERNAL MODULE: external "@microsoft/sp-application-base"
var sp_application_base_ = __webpack_require__(2);
var sp_application_base__default = /*#__PURE__*/__webpack_require__.n(sp_application_base_);

// EXTERNAL MODULE: external "@microsoft/sp-http"
var sp_http_ = __webpack_require__(3);
var sp_http__default = /*#__PURE__*/__webpack_require__.n(sp_http_);

// CONCATENATED MODULE: ./lib/extensions/headerSearchBox/components/AppCustomiser.module.scss.js
/* tslint:disable */
__webpack_require__(4);
var styles = {
    placeholderHeader: 'placeholderHeader_0f7a3c43',
    SearchContainer: 'SearchContainer_0f7a3c43',
    Header: 'Header_0f7a3c43',
    SearchBox: 'SearchBox_0f7a3c43',
    icon: 'icon_0f7a3c43',
    buttonMagnifier: 'buttonMagnifier_0f7a3c43',
    buttonClear: 'buttonClear_0f7a3c43',
    buttonSearch: 'buttonSearch_0f7a3c43',
    input: 'input_0f7a3c43',
    SearchPanel: 'SearchPanel_0f7a3c43',
    active: 'active_0f7a3c43',
    ootbSearchBox: 'ootbSearchBox_0f7a3c43',
};
/* harmony default export */ var AppCustomiser_module_scss = (styles);
/* tslint:enable */ 

// EXTERNAL MODULE: external "HeaderSearchBoxApplicationCustomizerStrings"
var external__HeaderSearchBoxApplicationCustomizerStrings_ = __webpack_require__(9);
var external__HeaderSearchBoxApplicationCustomizerStrings__default = /*#__PURE__*/__webpack_require__.n(external__HeaderSearchBoxApplicationCustomizerStrings_);

// CONCATENATED MODULE: ./lib/extensions/headerSearchBox/HeaderSearchBoxApplicationCustomizer.js
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





/** A Custom Action which can be run during execution of a Client Side Application */
var HeaderSearchBoxApplicationCustomizer_HeaderSearchBoxApplicationCustomizer = (function (_super) {
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
            this.topPlaceHolder = this.appContext.placeholderProvider.tryCreateContent(sp_application_base_["PlaceholderName"].Top, { onDispose: this.onDispose });
        }
        if (this.topPlaceHolder.domElement) {
            this.topPlaceHolder.domElement.innerHTML = "\n        <div id=" + AppCustomiser_module_scss.placeholderHeader + ">\n          <div class=" + AppCustomiser_module_scss.Header + ">\n          </div>\n          <div class=\"" + AppCustomiser_module_scss.SearchContainer + "\">\n            <div id=\"" + AppCustomiser_module_scss.SearchBox + "\">\n              <form aria-label=\"" + external__HeaderSearchBoxApplicationCustomizerStrings_["FormLabel"] + "\" role=\"search\">\n                <button class=\"" + AppCustomiser_module_scss.buttonMagnifier + "\" title=\"" + external__HeaderSearchBoxApplicationCustomizerStrings_["ButtonTitleMagnify"] + "\" aria-label=\"" + external__HeaderSearchBoxApplicationCustomizerStrings_["ButtonTitleMagnify"] + "\" aria-hidden=\"true\" type=\"button\" tabindex=\"-1\">\n                  <i class=\"" + AppCustomiser_module_scss.icon + " ms-Icon ms-Icon--Search\" aria-hidden=\"true\"></i>\n                </button>\n                <input class=\"" + AppCustomiser_module_scss.input + "\" role=\"combobox\" \n                  aria-label=\"" + external__HeaderSearchBoxApplicationCustomizerStrings_["InputLabel"] + "\" \n                  aria-autocomplete=\"list\" aria-haspopup=\"true\" aria-expanded=\"false\" accesskey=\"S\" spellcheck=\"false\" autocomplete=\"off\" \n                  autocorrect=\"false\" type=\"search\" placeholder=\"" + external__HeaderSearchBoxApplicationCustomizerStrings_["InputPlaceholder"] + "\" data-nav=\"true\" data-tab=\"true\" value=\"\" />\n                <button class=\"" + AppCustomiser_module_scss.buttonClear + " false\" type=\"button\" title=\"" + external__HeaderSearchBoxApplicationCustomizerStrings_["ButtonTitleClear"] + "\" aria-label=\"" + external__HeaderSearchBoxApplicationCustomizerStrings_["ButtonTitleClear"] + "\" data-tab=\"false\" style=\"display: none;\">\n                  <i class=\"" + AppCustomiser_module_scss.icon + " ms-Icon ms-Icon--ChromeClose\" aria-hidden=\"true\"></i>\n                </button>\n                <button class=\"" + AppCustomiser_module_scss.buttonSearch + "\" title=\"" + external__HeaderSearchBoxApplicationCustomizerStrings_["ButtonTitleSearch"] + "\" aria-label=\"" + external__HeaderSearchBoxApplicationCustomizerStrings_["ButtonTitleSearch"] + "\" data-tab=\"false\" style=\"display: none;\">\n                  <i class=\"" + AppCustomiser_module_scss.icon + " ms-Icon ms-Icon--ChromeBackMirrored\" aria-hidden=\"true\"></i>\n                </button>\n              </form>\n              <div class=\"" + AppCustomiser_module_scss.SearchPanel + "\" style=\"display: none;\">\n              </div>\n            </div>\n            <div class=\"" + AppCustomiser_module_scss.SearchPanel + "\" />\n          </div>\n        </div>\n        ";
        }
    };
    HeaderSearchBoxApplicationCustomizer.prototype.HandleSearchEvents = function () {
        var _this = this;
        var searchBoxContainer = document.querySelector("#" + AppCustomiser_module_scss.SearchBox);
        var searchPanel = searchBoxContainer.querySelector("." + AppCustomiser_module_scss.SearchPanel);
        var searchBoxInput = document.querySelector("#" + AppCustomiser_module_scss.SearchBox + " input." + AppCustomiser_module_scss.input);
        searchBoxInput.addEventListener("focus", function (evt) {
            searchBoxContainer.classList.add("" + AppCustomiser_module_scss.active);
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
                    searchBoxContainer.classList.remove("" + AppCustomiser_module_scss.active);
                    // remove our listener
                    removeClickListener();
                }
            };
            document.addEventListener('click', outsideClickListener);
        });
        // event to handle changes to the search input box
        var searchInputChange = function () {
            searchPanel.innerHTML = "<div>" + external__HeaderSearchBoxApplicationCustomizerStrings_["PanelTextPrefix"] + " <b>" + searchBoxInput.value + "</b></div>";
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
        document.querySelector("#" + AppCustomiser_module_scss.SearchBox + " button." + AppCustomiser_module_scss.buttonClear).addEventListener("click", function (evt) {
            searchBoxInput.focus();
            _this.showSearchInputButtonDisplay(false);
            searchBoxInput.value = "";
        });
        searchPanel.addEventListener("click", function (evt) {
            _this.handleSearchRedirect(searchBoxInput.value);
        });
        // search button
        document.querySelector("#" + AppCustomiser_module_scss.SearchBox + " button." + AppCustomiser_module_scss.buttonSearch).addEventListener("click", function (evt) {
            // stop any default behaviour
            evt.cancelBubble = true;
            evt.preventDefault();
            // then do the whole redirect thing
            _this.handleSearchRedirect(searchBoxInput.value);
        });
        // focus on the input when the magnifier is clicked
        document.querySelector("#" + AppCustomiser_module_scss.SearchBox + " button." + AppCustomiser_module_scss.buttonMagnifier).addEventListener("click", function (evt) {
            searchBoxInput.focus();
        });
    };
    HeaderSearchBoxApplicationCustomizer.prototype.showSearchInputButtonDisplay = function (display) {
        var displayStyle = display ? "inline-block" : "none";
        document.querySelector("#" + AppCustomiser_module_scss.SearchBox + " ." + AppCustomiser_module_scss.SearchPanel).style.display = displayStyle;
        document.querySelector("#" + AppCustomiser_module_scss.SearchBox + " ." + AppCustomiser_module_scss.buttonClear).style.display = displayStyle;
        document.querySelector("#" + AppCustomiser_module_scss.SearchBox + " ." + AppCustomiser_module_scss.buttonSearch).style.display = displayStyle;
    };
    HeaderSearchBoxApplicationCustomizer.prototype.handleSearchRedirect = function (searchQuery) {
        if (searchQuery && searchQuery.trim().length > 0) {
            console.log(external__HeaderSearchBoxApplicationCustomizerStrings_["LogRedirectingTo"] + " " + this.searchResultPage);
            window.location.href = this.searchResultPage + "?k=" + searchQuery;
        }
    };
    HeaderSearchBoxApplicationCustomizer.prototype.GetSearchRedirectPage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.appContext.spHttpClient.get(_this.appContext.pageContext.web.absoluteUrl + "/_api/web/allProperties", sp_http_["SPHttpClient"].configurations.v1)
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
                    reject("" + external__HeaderSearchBoxApplicationCustomizerStrings_["LogWebPropertiesNotFound"]);
                }
            });
        });
    };
    __decorate([
        decorators_["override"]
    ], HeaderSearchBoxApplicationCustomizer.prototype, "onInit", null);
    return HeaderSearchBoxApplicationCustomizer;
}(sp_application_base_["BaseApplicationCustomizer"]));
/* harmony default export */ var headerSearchBox_HeaderSearchBoxApplicationCustomizer = __webpack_exports__["default"] = (HeaderSearchBoxApplicationCustomizer_HeaderSearchBoxApplicationCustomizer);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var content = __webpack_require__(5);
var loader = __webpack_require__(7);

if(typeof content === "string") content = [[module.i, content]];

// add the styles to the DOM
for (var i = 0; i < content.length; i++) loader.loadStyles(content[i][1], true);

if(content.locals) module.exports = content.locals;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)(false);
// imports


// module
exports.push([module.i, "#placeholderHeader_0f7a3c43{width:100%}#placeholderHeader_0f7a3c43 .SearchContainer_0f7a3c43{float:right;margin-top:7px;margin-right:17px}#placeholderHeader_0f7a3c43 .Header_0f7a3c43{float:left;padding:0;margin-top:7px;margin-left:25px}#SearchBox_0f7a3c43{margin-right:15px;line-height:36px;height:36px;width:270px;border:1px solid \"[theme:neutralLight, default: #eaeaea]\"}#SearchBox_0f7a3c43 form{max-height:36px}#SearchBox_0f7a3c43 input[type=text]::-ms-clear,#SearchBox_0f7a3c43 input[type=text]::-ms-reveal{display:none;width:0;height:0}#SearchBox_0f7a3c43 input[type=search]::-webkit-search-cancel-button,#SearchBox_0f7a3c43 input[type=search]::-webkit-search-decoration,#SearchBox_0f7a3c43 input[type=search]::-webkit-search-results-button,#SearchBox_0f7a3c43 input[type=search]::-webkit-search-results-decoration{display:none}#SearchBox_0f7a3c43 .icon_0f7a3c43{display:-ms-inline-flexbox;display:inline-flex;-ms-flex-item-align:center;align-self:center;position:relative;height:1em;width:1em;transition:color 167ms cubic-bezier(.1,.9,.2,1);color:\"[theme:themePrimary, default: #0078d4]\"}#SearchBox_0f7a3c43 .icon_0f7a3c43>svg{width:1em;height:1em;position:absolute;bottom:-.125em}#SearchBox_0f7a3c43 button{line-height:36px;max-width:49px;height:100%;display:inline-block;box-sizing:border-box;padding-right:16px;border:none;background:0 0;outline:0;vertical-align:top;font-size:17px;cursor:pointer;-ms-flex:0 0 40px;flex:0 0 40px;width:40px;text-align:center;transition:padding-right 0s;padding:0;-webkit-box-flex:0}#SearchBox_0f7a3c43 button.buttonMagnifier_0f7a3c43{color:\"[theme:themePrimary, default: #0078d4]\"}#SearchBox_0f7a3c43 button.buttonClear_0f7a3c43 i{font-size:14px;font-weight:lighter;color:\"[theme:neutralTertiary, default: #a6a6a6]\"}#SearchBox_0f7a3c43 button.buttonSearch_0f7a3c43{background-color:\"[theme:themePrimary, default: #0078d4]\"}#SearchBox_0f7a3c43 button.buttonSearch_0f7a3c43 i{display:inline-block;height:100%;width:100%;color:\"[theme:white, default: #ffffff]\"}#SearchBox_0f7a3c43 button.buttonSearch_0f7a3c43 i :hover{background-color:\"[theme:themeDark, default: #005a9e]\"}#SearchBox_0f7a3c43 .input_0f7a3c43{width:220px;font-size:14px;font-weight:400;color:\"[theme:black, default: #000000]\";-ms-flex:1 1 auto;flex:1 1 auto;box-sizing:border-box;background-color:transparent;display:inline-block;height:100%;border:none;outline:0;-webkit-appearance:none;-webkit-box-flex:1}#SearchBox_0f7a3c43 .SearchPanel_0f7a3c43{background-color:\"[theme:white, default: #ffffff]\";color:\"[theme:themePrimary, default: #0078d4]\";text-align:center;z-index:9999;position:relative;left:0;top:1px;display:none;box-shadow:0 .5px .5px .5px \"[theme:neutralQuaternary, default: #d0d0d0]\"}#SearchBox_0f7a3c43 .SearchPanel_0f7a3c43 div{height:51px;line-height:51px;padding-left:20px;padding-right:20px;min-width:460px;max-width:460px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#SearchBox_0f7a3c43 .SearchPanel_0f7a3c43 :hover{background-color:\"[theme:neutralLighter, default: #f4f4f4]\";cursor:pointer}#SearchBox_0f7a3c43.active_0f7a3c43{width:500px}#SearchBox_0f7a3c43.active_0f7a3c43 input.input_0f7a3c43{width:366px}#SearchBox_0f7a3c43 input:-ms-input-placeholder,#SearchBox input:-ms-input-placeholder{color:\"[theme:neutralSecondary, default: #666666]\"!important}#SearchBox_0f7a3c43 input::placeholder{color:\"[theme:neutralSecondary, default: #666666]\"!important}#SearchBox.active input:-ms-input-placeholder,#SearchBox_0f7a3c43.active_0f7a3c43 input:-ms-input-placeholder{color:\"[theme:neutralTertiaryAlt, default: #c8c8c8]\"!important}#SearchBox_0f7a3c43.active_0f7a3c43 input::placeholder{color:\"[theme:neutralTertiaryAlt, default: #c8c8c8]\"!important}@media screen and (max-width:730px){#placeholderHeader_0f7a3c43{display:none}}.ootbSearchBox_0f7a3c43{float:right}", ""]);

// exports


/***/ }),
/* 6 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
/**
 * An IThemingInstruction can specify a rawString to be preserved or a theme slot and a default value
 * to use if that slot is not specified by the theme.
 */
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// IE needs to inject styles using cssText. However, we need to evaluate this lazily, so this
// value will initialize as undefined, and later will be set once on first loadStyles injection.
var _injectStylesWithCssText;
// Store the theming state in __themeState__ global scope for reuse in the case of duplicate
// load-themed-styles hosted on the page.
var _root = (typeof window === 'undefined') ? global : window; // tslint:disable-line:no-any
var _themeState = initializeThemeState();
/**
 * Matches theming tokens. For example, "[theme: themeSlotName, default: #FFF]" (including the quotes).
 */
// tslint:disable-next-line:max-line-length
var _themeTokenRegex = /[\'\"]\[theme:\s*(\w+)\s*(?:\,\s*default:\s*([\\"\']?[\.\,\(\)\#\-\s\w]*[\.\,\(\)\#\-\w][\"\']?))?\s*\][\'\"]/g;
/** Maximum style text length, for supporting IE style restrictions. */
var MAX_STYLE_CONTENT_SIZE = 10000;
var now = function () { return (typeof performance !== 'undefined' && !!performance.now) ? performance.now() : Date.now(); };
function measure(func) {
    var start = now();
    func();
    var end = now();
    _themeState.perf.duration += end - start;
}
/**
 * initialize global state object
 */
function initializeThemeState() {
    var state = _root.__themeState__ || {
        theme: undefined,
        lastStyleElement: undefined,
        registeredStyles: []
    };
    if (!state.runState) {
        state = __assign({}, (state), { perf: {
                count: 0,
                duration: 0
            }, runState: {
                flushTimer: 0,
                mode: 0 /* sync */,
                buffer: []
            } });
    }
    if (!state.registeredThemableStyles) {
        state = __assign({}, (state), { registeredThemableStyles: [] });
    }
    _root.__themeState__ = state;
    return state;
}
/**
 * Loads a set of style text. If it is registered too early, we will register it when the window.load
 * event is fired.
 * @param {string | ThemableArray} styles Themable style text to register.
 * @param {boolean} loadAsync When true, always load styles in async mode, irrespective of current sync mode.
 */
function loadStyles(styles, loadAsync) {
    if (loadAsync === void 0) { loadAsync = false; }
    measure(function () {
        var styleParts = Array.isArray(styles) ? styles : splitStyles(styles);
        if (_injectStylesWithCssText === undefined) {
            _injectStylesWithCssText = shouldUseCssText();
        }
        var _a = _themeState.runState, mode = _a.mode, buffer = _a.buffer, flushTimer = _a.flushTimer;
        if (loadAsync || mode === 1 /* async */) {
            buffer.push(styleParts);
            if (!flushTimer) {
                _themeState.runState.flushTimer = asyncLoadStyles();
            }
        }
        else {
            applyThemableStyles(styleParts);
        }
    });
}
exports.loadStyles = loadStyles;
/**
 * Allows for customizable loadStyles logic. e.g. for server side rendering application
 * @param {(processedStyles: string, rawStyles?: string | ThemableArray) => void}
 * a loadStyles callback that gets called when styles are loaded or reloaded
 */
function configureLoadStyles(loadStylesFn) {
    _themeState.loadStyles = loadStylesFn;
}
exports.configureLoadStyles = configureLoadStyles;
/**
 * Configure run mode of load-themable-styles
 * @param mode load-themable-styles run mode, async or sync
 */
function configureRunMode(mode) {
    _themeState.runState.mode = mode;
}
exports.configureRunMode = configureRunMode;
/**
 * external code can call flush to synchronously force processing of currently buffered styles
 */
function flush() {
    measure(function () {
        var styleArrays = _themeState.runState.buffer.slice();
        _themeState.runState.buffer = [];
        var mergedStyleArray = [].concat.apply([], styleArrays);
        if (mergedStyleArray.length > 0) {
            applyThemableStyles(mergedStyleArray);
        }
    });
}
exports.flush = flush;
/**
 * register async loadStyles
 */
function asyncLoadStyles() {
    return setTimeout(function () {
        _themeState.runState.flushTimer = 0;
        flush();
    }, 0);
}
/**
 * Loads a set of style text. If it is registered too early, we will register it when the window.load event
 * is fired.
 * @param {string} styleText Style to register.
 * @param {IStyleRecord} styleRecord Existing style record to re-apply.
 */
function applyThemableStyles(stylesArray, styleRecord) {
    if (_themeState.loadStyles) {
        _themeState.loadStyles(resolveThemableArray(stylesArray).styleString, stylesArray);
    }
    else {
        _injectStylesWithCssText ?
            registerStylesIE(stylesArray, styleRecord) :
            registerStyles(stylesArray);
    }
}
/**
 * Registers a set theme tokens to find and replace. If styles were already registered, they will be
 * replaced.
 * @param {theme} theme JSON object of theme tokens to values.
 */
function loadTheme(theme) {
    _themeState.theme = theme;
    // reload styles.
    reloadStyles();
}
exports.loadTheme = loadTheme;
/**
 * Clear already registered style elements and style records in theme_State object
 * @option: specify which group of registered styles should be cleared.
 * Default to be both themable and non-themable styles will be cleared
 */
function clearStyles(option) {
    if (option === void 0) { option = 3 /* all */; }
    if (option === 3 /* all */ || option === 2 /* onlyNonThemable */) {
        clearStylesInternal(_themeState.registeredStyles);
        _themeState.registeredStyles = [];
    }
    if (option === 3 /* all */ || option === 1 /* onlyThemable */) {
        clearStylesInternal(_themeState.registeredThemableStyles);
        _themeState.registeredThemableStyles = [];
    }
}
exports.clearStyles = clearStyles;
function clearStylesInternal(records) {
    records.forEach(function (styleRecord) {
        var styleElement = styleRecord && styleRecord.styleElement;
        if (styleElement && styleElement.parentElement) {
            styleElement.parentElement.removeChild(styleElement);
        }
    });
}
/**
 * Reloads styles.
 */
function reloadStyles() {
    if (_themeState.theme) {
        var themableStyles = [];
        for (var _i = 0, _a = _themeState.registeredThemableStyles; _i < _a.length; _i++) {
            var styleRecord = _a[_i];
            themableStyles.push(styleRecord.themableStyle);
        }
        if (themableStyles.length > 0) {
            clearStyles(1 /* onlyThemable */);
            applyThemableStyles([].concat.apply([], themableStyles));
        }
    }
}
/**
 * Find theme tokens and replaces them with provided theme values.
 * @param {string} styles Tokenized styles to fix.
 */
function detokenize(styles) {
    if (styles) {
        styles = resolveThemableArray(splitStyles(styles)).styleString;
    }
    return styles;
}
exports.detokenize = detokenize;
/**
 * Resolves ThemingInstruction objects in an array and joins the result into a string.
 * @param {ThemableArray} splitStyleArray ThemableArray to resolve and join.
 */
function resolveThemableArray(splitStyleArray) {
    var theme = _themeState.theme;
    var themable = false;
    // Resolve the array of theming instructions to an array of strings.
    // Then join the array to produce the final CSS string.
    var resolvedArray = (splitStyleArray || []).map(function (currentValue) {
        var themeSlot = currentValue.theme;
        if (themeSlot) {
            themable = true;
            // A theming annotation. Resolve it.
            var themedValue = theme ? theme[themeSlot] : undefined;
            var defaultValue = currentValue.defaultValue || 'inherit';
            // Warn to console if we hit an unthemed value even when themes are provided, but only if "DEBUG" is true.
            // Allow the themedValue to be undefined to explicitly request the default value.
            if (theme && !themedValue && console && !(themeSlot in theme) && "boolean" !== 'undefined' && true) {
                console.warn("Theming value not provided for \"" + themeSlot + "\". Falling back to \"" + defaultValue + "\".");
            }
            return themedValue || defaultValue;
        }
        else {
            // A non-themable string. Preserve it.
            return currentValue.rawString;
        }
    });
    return {
        styleString: resolvedArray.join(''),
        themable: themable
    };
}
/**
 * Split tokenized CSS into an array of strings and theme specification objects
 * @param {string} styles Tokenized styles to split.
 */
function splitStyles(styles) {
    var result = [];
    if (styles) {
        var pos = 0; // Current position in styles.
        var tokenMatch = void 0; // tslint:disable-line:no-null-keyword
        while (tokenMatch = _themeTokenRegex.exec(styles)) {
            var matchIndex = tokenMatch.index;
            if (matchIndex > pos) {
                result.push({
                    rawString: styles.substring(pos, matchIndex)
                });
            }
            result.push({
                theme: tokenMatch[1],
                defaultValue: tokenMatch[2] // May be undefined
            });
            // index of the first character after the current match
            pos = _themeTokenRegex.lastIndex;
        }
        // Push the rest of the string after the last match.
        result.push({
            rawString: styles.substring(pos)
        });
    }
    return result;
}
exports.splitStyles = splitStyles;
/**
 * Registers a set of style text. If it is registered too early, we will register it when the
 * window.load event is fired.
 * @param {ThemableArray} styleArray Array of IThemingInstruction objects to register.
 * @param {IStyleRecord} styleRecord May specify a style Element to update.
 */
function registerStyles(styleArray) {
    var head = document.getElementsByTagName('head')[0];
    var styleElement = document.createElement('style');
    var _a = resolveThemableArray(styleArray), styleString = _a.styleString, themable = _a.themable;
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(styleString));
    _themeState.perf.count++;
    head.appendChild(styleElement);
    var record = {
        styleElement: styleElement,
        themableStyle: styleArray
    };
    if (themable) {
        _themeState.registeredThemableStyles.push(record);
    }
    else {
        _themeState.registeredStyles.push(record);
    }
}
/**
 * Registers a set of style text, for IE 9 and below, which has a ~30 style element limit so we need
 * to register slightly differently.
 * @param {ThemableArray} styleArray Array of IThemingInstruction objects to register.
 * @param {IStyleRecord} styleRecord May specify a style Element to update.
 */
function registerStylesIE(styleArray, styleRecord) {
    var head = document.getElementsByTagName('head')[0];
    var registeredStyles = _themeState.registeredStyles;
    var lastStyleElement = _themeState.lastStyleElement;
    var stylesheet = lastStyleElement ? lastStyleElement.styleSheet : undefined;
    var lastStyleContent = stylesheet ? stylesheet.cssText : '';
    var lastRegisteredStyle = registeredStyles[registeredStyles.length - 1];
    var resolvedStyleText = resolveThemableArray(styleArray).styleString;
    if (!lastStyleElement || (lastStyleContent.length + resolvedStyleText.length) > MAX_STYLE_CONTENT_SIZE) {
        lastStyleElement = document.createElement('style');
        lastStyleElement.type = 'text/css';
        if (styleRecord) {
            head.replaceChild(lastStyleElement, styleRecord.styleElement);
            styleRecord.styleElement = lastStyleElement;
        }
        else {
            head.appendChild(lastStyleElement);
        }
        if (!styleRecord) {
            lastRegisteredStyle = {
                styleElement: lastStyleElement,
                themableStyle: styleArray
            };
            registeredStyles.push(lastRegisteredStyle);
        }
    }
    lastStyleElement.styleSheet.cssText += detokenize(resolvedStyleText);
    Array.prototype.push.apply(lastRegisteredStyle.themableStyle, styleArray); // concat in-place
    // Preserve the theme state.
    _themeState.lastStyleElement = lastStyleElement;
}
/**
 * Checks to see if styleSheet exists as a property off of a style element.
 * This will determine if style registration should be done via cssText (<= IE9) or not
 */
function shouldUseCssText() {
    var useCSSText = false;
    if (typeof document !== 'undefined') {
        var emptyStyle = document.createElement('style');
        emptyStyle.type = 'text/css';
        useCSSText = !!emptyStyle.styleSheet;
    }
    return useCSSText;
}


/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)))

/***/ }),
/* 8 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_9__;

/***/ })
/******/ ])});;
//# sourceMappingURL=header-search-box-application-customizer.js.map