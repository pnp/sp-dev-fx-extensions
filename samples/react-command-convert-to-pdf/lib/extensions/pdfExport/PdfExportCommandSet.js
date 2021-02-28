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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import { BaseListViewCommandSet } from '@microsoft/sp-listview-extensibility';
import { SPPermission } from '@microsoft/sp-page-context';
import "@pnp/polyfill-ie11";
import { Web, RenderListDataOptions } from '@pnp/sp/presets/all';
import { HttpClient } from '@microsoft/sp-http';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import WaitDialog from './WaitDialog';
import * as strings from 'PdfExportCommandSetStrings';
import { getThemeColor } from './themeHelper';
var LOG_SOURCE = 'PdfExportCommandSet';
var DIALOG = new WaitDialog({});
var PdfExportCommandSet = /** @class */ (function (_super) {
    __extends(PdfExportCommandSet, _super);
    function PdfExportCommandSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._validExts = ['html', 'csv', 'doc', 'docx', 'odp', 'ods', 'odt', 'pot', 'potm', 'potx', 'pps', 'ppsx', 'ppsxm', 'ppt', 'pptm', 'pptx', 'rtf', 'xls', 'xlsx'];
        return _this;
    }
    PdfExportCommandSet.prototype.onInit = function () {
        Log.info(LOG_SOURCE, 'Initialized PdfExportCommandSet');
        return Promise.resolve();
    };
    PdfExportCommandSet.prototype.onListViewUpdated = function (event) {
        var hasPermission = this.context.pageContext.list.permissions.hasPermission(SPPermission.addListItems);
        var exportCommand = this.tryGetCommand('EXPORT');
        var fillColor = getThemeColor("themeDarkAlt").replace('#', '%23');
        var exportSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' viewBox='0 0 2048 2048'%3E %3Cg transform='matrix(1 0 0 -1 0 2048)'%3E %3Cpath fill='" + fillColor + "' d='M256 128h1024v-128h-1152v2048h1115l549 -549v-347h-128v256h-512v512h-896v-1792zM1280 1536h293l-293 293v-293zM1792 475l163 162l90 -90l-317 -317l-317 317l90 90l163 -162v549h128v-549zM2048 128v-128h-640v128h640z' /%3E %3C/g%3E %3C/svg%3E";
        exportCommand.iconImageUrl = exportSvg;
        if (exportCommand) {
            exportCommand.visible = event.selectedRows.length > 0 && hasPermission;
        }
        var saveCommand = this.tryGetCommand('SAVE_AS');
        var saveSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' viewBox='0 0 2048 2048'%3E %3Cg transform='matrix(1 0 0 -1 0 2048)'%3E %3Cpath fill='" + fillColor + "' d='M1848 1152q42 0 78.5 -15t63.5 -41.5t42.5 -63t15.5 -78.5q0 -39 -15 -76t-43 -65l-717 -717l-377 -94l94 377l717 716q29 29 65 43t76 14zM1899 903q21 21 21 51q0 31 -20.5 50.5t-51.5 19.5q-14 0 -27 -4.5t-23 -14.5l-692 -692l-34 -135l135 34zM768 512h128 l-128 -128h-475l-165 165v1243q0 27 10 50t27.5 40.5t40.5 27.5t50 10h1280q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50v-512l-128 -128v640h-128v-640h-1024v640h-128v-1189l91 -91h37v512h896v-128l-128 -128v128h-640v-384h128v256h128v-256zM512 1280h768v512h-768v-512 z' /%3E %3C/g%3E %3C/svg%3E";
        saveCommand.iconImageUrl = saveSvg;
        if (saveCommand) {
            saveCommand.visible = event.selectedRows.length > 0 && hasPermission;
        }
    };
    PdfExportCommandSet.prototype.onExecute = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var itemIds, fileExts, i, ext, _a, files, isOk, file, response, blob, error, errorMessage, zip, i, file, response, blob, error, errorMessage, d, dateString, zipBlob, files, ok;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        itemIds = event.selectedRows.map(function (i) { return i.getValueByName("ID"); });
                        fileExts = event.selectedRows.map(function (i) { return i.getValueByName("File_x0020_Type").toLocaleLowerCase(); });
                        DIALOG.showClose = false;
                        DIALOG.error = "";
                        for (i = 0; i < fileExts.length; i++) {
                            ext = fileExts[i];
                            if (this._validExts.indexOf(ext) === -1) {
                                DIALOG.title = strings.ExtSupport;
                                DIALOG.message = strings.CurrentExtSupport + ": " + this._validExts.join(", ") + ".";
                                DIALOG.showClose = true;
                                DIALOG.show();
                                return [2 /*return*/];
                            }
                        }
                        _a = event.itemId;
                        switch (_a) {
                            case 'EXPORT': return [3 /*break*/, 1];
                            case 'SAVE_AS': return [3 /*break*/, 18];
                        }
                        return [3 /*break*/, 21];
                    case 1:
                        DIALOG.title = strings.DownloadAsPdf;
                        DIALOG.message = strings.GeneratingFiles + "...";
                        DIALOG.show();
                        return [4 /*yield*/, this.generatePdfUrls(itemIds)];
                    case 2:
                        files = _b.sent();
                        isOk = true;
                        if (!(itemIds.length == 1)) return [3 /*break*/, 8];
                        file = files[0];
                        DIALOG.message = strings.Processing + " " + file.pdfFileName + "...";
                        DIALOG.render();
                        return [4 /*yield*/, this.context.httpClient.get(file.pdfUrl, HttpClient.configurations.v1)];
                    case 3:
                        response = _b.sent();
                        if (!response.ok) return [3 /*break*/, 5];
                        return [4 /*yield*/, response.blob()];
                    case 4:
                        blob = _b.sent();
                        FileSaver.saveAs(blob, file.pdfFileName);
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, response.json()];
                    case 6:
                        error = _b.sent();
                        errorMessage = error.error.innererror ? error.error.innererror.code : error.error.message;
                        DIALOG.error = strings.FailedToProcess + " " + file.pdfFileName + " - " + errorMessage + "<br/>";
                        DIALOG.render();
                        isOk = false;
                        _b.label = 7;
                    case 7: return [3 /*break*/, 17];
                    case 8:
                        zip = new JSZip();
                        i = 0;
                        _b.label = 9;
                    case 9:
                        if (!(i < files.length)) return [3 /*break*/, 15];
                        file = files[i];
                        DIALOG.message = strings.Processing + " " + file.pdfFileName + "...";
                        DIALOG.render();
                        return [4 /*yield*/, this.context.httpClient.get(file.pdfUrl, HttpClient.configurations.v1)];
                    case 10:
                        response = _b.sent();
                        if (!response.ok) return [3 /*break*/, 12];
                        return [4 /*yield*/, response.blob()];
                    case 11:
                        blob = _b.sent();
                        zip.file(file.pdfFileName, blob, { binary: true });
                        return [3 /*break*/, 14];
                    case 12: return [4 /*yield*/, response.json()];
                    case 13:
                        error = _b.sent();
                        errorMessage = error.error.innererror ? error.error.innererror.code : error.error.message;
                        DIALOG.error = strings.FailedToProcess + " " + file.pdfFileName + " - " + errorMessage + "<br/>";
                        DIALOG.render();
                        isOk = false;
                        _b.label = 14;
                    case 14:
                        i++;
                        return [3 /*break*/, 9];
                    case 15:
                        if (!isOk) return [3 /*break*/, 17];
                        zip.file("Powered by PnP.txt", "https://github.com/pnp/PnP");
                        d = new Date();
                        dateString = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + '-' + ('0' + d.getHours()).slice(-2) + '-' + ('0' + d.getMinutes()).slice(-2) + '-' + ('0' + d.getSeconds()).slice(-2);
                        return [4 /*yield*/, zip.generateAsync({ type: "blob" })];
                    case 16:
                        zipBlob = _b.sent();
                        FileSaver.saveAs(zipBlob, "files-" + dateString + ".zip");
                        _b.label = 17;
                    case 17:
                        if (!isOk) {
                            DIALOG.showClose = true;
                            DIALOG.render();
                        }
                        else {
                            DIALOG.close();
                        }
                        return [3 /*break*/, 22];
                    case 18:
                        DIALOG.title = strings.SaveAsPdf;
                        DIALOG.message = strings.GeneratingFiles + "...";
                        DIALOG.show();
                        return [4 /*yield*/, this.generatePdfUrls(itemIds)];
                    case 19:
                        files = _b.sent();
                        return [4 /*yield*/, this.saveAsPdf(files)];
                    case 20:
                        ok = _b.sent();
                        if (ok) {
                            DIALOG.close();
                        }
                        else {
                            DIALOG.showClose = true;
                            DIALOG.render();
                        }
                        return [3 /*break*/, 22];
                    case 21: throw new Error('Unknown command');
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    PdfExportCommandSet.prototype.saveAsPdf = function (files) {
        return __awaiter(this, void 0, void 0, function () {
            var web, isOk, i, file, pdfUrl, exists, error_1, response, blob, item, error, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        web = Web(this.context.pageContext.web.absoluteUrl);
                        isOk = true;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < files.length)) return [3 /*break*/, 16];
                        file = files[i];
                        DIALOG.message = strings.Processing + " " + file.pdfFileName + "...";
                        DIALOG.render();
                        pdfUrl = file.serverRelativeUrl.replace("." + file.fileType, ".pdf");
                        exists = true;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, web.getFileByServerRelativePath(pdfUrl).get()];
                    case 3:
                        _a.sent();
                        DIALOG.error += file.pdfFileName + " " + strings.Exists + ".<br/>";
                        DIALOG.render();
                        isOk = false;
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        exists = false;
                        return [3 /*break*/, 5];
                    case 5:
                        if (!!exists) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.context.httpClient.get(file.pdfUrl, HttpClient.configurations.v1)];
                    case 6:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 13];
                        return [4 /*yield*/, response.blob()];
                    case 7:
                        blob = _a.sent();
                        return [4 /*yield*/, web.getFileByServerRelativeUrl(file.serverRelativeUrl).copyTo(pdfUrl)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, web.getFileByServerRelativeUrl(pdfUrl).setContentChunked(blob)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, web.getFileByServerRelativeUrl(pdfUrl).getItem("File_x0020_Type")];
                    case 10:
                        item = _a.sent();
                        if (!(item["File_x0020_Type"] !== "pdf")) return [3 /*break*/, 12];
                        return [4 /*yield*/, item.update({
                                "File_x0020_Type": "pdf"
                            })];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12: return [3 /*break*/, 15];
                    case 13: return [4 /*yield*/, response.json()];
                    case 14:
                        error = _a.sent();
                        errorMessage = error.error.innererror ? error.error.innererror.code : error.error.message;
                        DIALOG.error += strings.FailedToProcess + "s " + file.pdfFileName + " - " + errorMessage + "<br/>";
                        DIALOG.render();
                        isOk = false;
                        _a.label = 15;
                    case 15:
                        i++;
                        return [3 /*break*/, 1];
                    case 16: return [2 /*return*/, isOk];
                }
            });
        });
    };
    PdfExportCommandSet.prototype.generatePdfUrls = function (listItemIds) {
        return __awaiter(this, void 0, void 0, function () {
            var web, options, values, viewXml, response, pdfConversionUrl, mediaBaseUrl, callerStack, driveAccessToken, pdfUrls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        web = Web(this.context.pageContext.web.absoluteUrl);
                        options = RenderListDataOptions.EnableMediaTAUrls | RenderListDataOptions.ContextInfo | RenderListDataOptions.ListData | RenderListDataOptions.ListSchema;
                        values = listItemIds.map(function (i) { return "<Value Type='Counter'>" + i + "</Value>"; });
                        viewXml = "\n        <View Scope='RecursiveAll'>\n            <Query>\n                <Where>\n                    <In>\n                        <FieldRef Name='ID' />\n                        <Values>\n                            " + values.join("") + "\n                        </Values>\n                    </In>\n                </Where>\n            </Query>\n            <RowLimit>" + listItemIds.length + "</RowLimit>\n        </View>";
                        return [4 /*yield*/, web.lists.getById(this.context.pageContext.list.id.toString()).renderListDataAsStream({ RenderOptions: options, ViewXml: viewXml })];
                    case 1:
                        response = _a.sent();
                        pdfConversionUrl = response.ListSchema[".pdfConversionUrl"];
                        mediaBaseUrl = response.ListSchema[".mediaBaseUrl"];
                        callerStack = response.ListSchema[".callerStack"];
                        driveAccessToken = response.ListSchema[".driveAccessToken"];
                        pdfUrls = [];
                        response.ListData.Row.forEach(function (element) {
                            var fileType = element[".fileType"];
                            var spItemUrl = element[".spItemUrl"];
                            var pdfUrl = pdfConversionUrl
                                .replace("{.mediaBaseUrl}", mediaBaseUrl)
                                .replace("{.fileType}", fileType)
                                .replace("{.callerStack}", callerStack)
                                .replace("{.spItemUrl}", spItemUrl)
                                .replace("{.driveAccessToken}", driveAccessToken);
                            var pdfFileName = element.FileLeafRef.replace(fileType, "pdf");
                            pdfUrls.push({ serverRelativeUrl: element["FileRef"], pdfUrl: pdfUrl, fileType: fileType, pdfFileName: pdfFileName });
                        });
                        return [2 /*return*/, pdfUrls];
                }
            });
        });
    };
    __decorate([
        override
    ], PdfExportCommandSet.prototype, "onInit", null);
    __decorate([
        override
    ], PdfExportCommandSet.prototype, "onListViewUpdated", null);
    __decorate([
        override
    ], PdfExportCommandSet.prototype, "onExecute", null);
    return PdfExportCommandSet;
}(BaseListViewCommandSet));
export default PdfExportCommandSet;
//# sourceMappingURL=PdfExportCommandSet.js.map