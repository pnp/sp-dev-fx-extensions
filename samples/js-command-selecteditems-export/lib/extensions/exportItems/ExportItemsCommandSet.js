"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var decorators_1 = require("@microsoft/decorators");
var sp_listview_extensibility_1 = require("@microsoft/sp-listview-extensibility");
var xlsx = require("xlsx");
var sp_http_1 = require("@microsoft/sp-http");
var LOG_SOURCE = 'ExportItemsCommandSet';
var ExportItemsCommandSet = (function (_super) {
    __extends(ExportItemsCommandSet, _super);
    function ExportItemsCommandSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExportItemsCommandSet.prototype.onInit = function () {
        this.Initiate();
        return Promise.resolve();
    };
    ExportItemsCommandSet.prototype.onListViewUpdated = function (event) {
        var exportCommand = this.tryGetCommand('EXCELEXPORTITEMS_1');
        if (exportCommand) {
            // This command should be hidden unless exactly one row is selected.
            exportCommand.visible = event.selectedRows.length > 0;
        }
    };
    ExportItemsCommandSet.prototype.onExecute = function (event) {
        var _this = this;
        var _grid;
        // One dirty fix for LinkTitle column internal name
        var index = this._viewColumns.indexOf('LinkTitle');
        if (index !== -1) {
            this._viewColumns[index] = 'Title';
        }
        switch (event.itemId) {
            case 'EXCELEXPORTITEMS_1':
                if (event.selectedRows.length > 0) {
                    _grid = new Array(event.selectedRows.length);
                    _grid[0] = this._viewColumns;
                    event.selectedRows.forEach(function (row, index) {
                        var _row = [], i = 0;
                        _this._viewColumns.forEach(function (viewColumn) {
                            _row[i++] = _this._getFieldValueAsText(row.getValueByName(viewColumn));
                        });
                        _grid[index + 1] = _row;
                    });
                }
                break;
            default:
                throw new Error('Unknown command');
        }
        this.writeToExcel(_grid);
    };
    /*
    Some brute force to identify the type of field and return the text value of the field, trying to avoid one more rest call for field types
    Tested, Single line, Multiline, Choice, Number, Boolean, Lookup and Managed metadata,
    */
    ExportItemsCommandSet.prototype._getFieldValueAsText = function (field) {
        var fieldValue;
        switch (typeof field) {
            case 'object': {
                if (field instanceof Array) {
                    if (!field.length) {
                        fieldValue = '';
                    }
                    else if (field[0].title) {
                        fieldValue = field.map(function (value) { return value.title; }).join();
                    }
                    else if (field[0].lookupValue) {
                        fieldValue = field.map(function (value) { return value.lookupValue; }).join();
                    }
                    else if (field[0].Label) {
                        fieldValue = field.map(function (value) { return value.Label; }).join();
                    }
                    else {
                        fieldValue = field.join();
                    }
                }
                break;
            }
            default: {
                fieldValue = field;
            }
        }
        return fieldValue;
    };
    ExportItemsCommandSet.prototype.writeToExcel = function (data) {
        var ws = xlsx.utils.aoa_to_sheet(data);
        var wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'selected-items');
        xlsx.writeFile(wb, this._listTitle + ".xlsx");
    };
    ExportItemsCommandSet.prototype.getViewColumns = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var currentWebUrl, viewId;
            return __generator(this, function (_a) {
                currentWebUrl = this.context.pageContext.web.absoluteUrl;
                this._listTitle = this.context.pageContext.legacyPageContext.listTitle;
                viewId = this.context.pageContext.legacyPageContext.viewId.replace('{', '').replace('}', '');
                this.context.spHttpClient.get(currentWebUrl + "/_api/lists/getbytitle('" + this._listTitle + "')/Views('" + viewId + "')/ViewFields", sp_http_1.SPHttpClient.configurations.v1)
                    .then(function (res) {
                    res.json().then(function (viewColumnsResponse) {
                        _this._viewColumns = viewColumnsResponse.Items;
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    ExportItemsCommandSet.prototype.Initiate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getViewColumns()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        decorators_1.override
    ], ExportItemsCommandSet.prototype, "onInit", null);
    __decorate([
        decorators_1.override
    ], ExportItemsCommandSet.prototype, "onListViewUpdated", null);
    __decorate([
        decorators_1.override
    ], ExportItemsCommandSet.prototype, "onExecute", null);
    return ExportItemsCommandSet;
}(sp_listview_extensibility_1.BaseListViewCommandSet));
exports.default = ExportItemsCommandSet;

//# sourceMappingURL=ExportItemsCommandSet.js.map
