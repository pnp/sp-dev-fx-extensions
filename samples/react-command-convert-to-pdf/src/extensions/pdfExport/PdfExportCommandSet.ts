import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
    BaseListViewCommandSet,
    Command,
    IListViewCommandSetListViewUpdatedParameters,
    IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { SPPermission } from '@microsoft/sp-page-context';
import "@pnp/polyfill-ie11";
import { Web, RenderListDataOptions } from '@pnp/sp/presets/all';
import { HttpClient } from '@microsoft/sp-http';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import WaitDialog from './WaitDialog';
import * as strings from 'PdfExportCommandSetStrings';
import { getThemeColor } from './themeHelper';


export interface IPdfExportCommandSetProperties {
}

interface SharePointFile {
    serverRelativeUrl: string;
    pdfUrl: string;
    fileType: string;
    pdfFileName: string;
}

const LOG_SOURCE: string = 'PdfExportCommandSet';
const DIALOG = new WaitDialog({});

export default class PdfExportCommandSet extends BaseListViewCommandSet<IPdfExportCommandSetProperties> {

    private _validExts: string[] = ['html', 'csv', 'doc', 'docx', 'odp', 'ods', 'odt', 'pot', 'potm', 'potx', 'pps', 'ppsx', 'ppsxm', 'ppt', 'pptm', 'pptx', 'rtf', 'xls', 'xlsx'];

    @override
    public onInit(): Promise<void> {
        Log.info(LOG_SOURCE, 'Initialized PdfExportCommandSet');
        return Promise.resolve();
    }

    @override
    public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {

        const hasPermission = this.context.pageContext.list.permissions.hasPermission(SPPermission.addListItems);
        
        const exportCommand: Command = this.tryGetCommand('EXPORT');
        const fillColor = getThemeColor("themeDarkAlt").replace('#', '%23');
        const exportSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' viewBox='0 0 2048 2048'%3E %3Cg transform='matrix(1 0 0 -1 0 2048)'%3E %3Cpath fill='${fillColor}' d='M256 128h1024v-128h-1152v2048h1115l549 -549v-347h-128v256h-512v512h-896v-1792zM1280 1536h293l-293 293v-293zM1792 475l163 162l90 -90l-317 -317l-317 317l90 90l163 -162v549h128v-549zM2048 128v-128h-640v128h640z' /%3E %3C/g%3E %3C/svg%3E`;
        exportCommand.iconImageUrl = exportSvg;

        if (exportCommand) {
            exportCommand.visible = event.selectedRows.length > 0 && hasPermission;
        }

        const saveCommand: Command = this.tryGetCommand('SAVE_AS');
        const saveSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' viewBox='0 0 2048 2048'%3E %3Cg transform='matrix(1 0 0 -1 0 2048)'%3E %3Cpath fill='${fillColor}' d='M1848 1152q42 0 78.5 -15t63.5 -41.5t42.5 -63t15.5 -78.5q0 -39 -15 -76t-43 -65l-717 -717l-377 -94l94 377l717 716q29 29 65 43t76 14zM1899 903q21 21 21 51q0 31 -20.5 50.5t-51.5 19.5q-14 0 -27 -4.5t-23 -14.5l-692 -692l-34 -135l135 34zM768 512h128 l-128 -128h-475l-165 165v1243q0 27 10 50t27.5 40.5t40.5 27.5t50 10h1280q27 0 50 -10t40.5 -27.5t27.5 -40.5t10 -50v-512l-128 -128v640h-128v-640h-1024v640h-128v-1189l91 -91h37v512h896v-128l-128 -128v128h-640v-384h128v256h128v-256zM512 1280h768v512h-768v-512 z' /%3E %3C/g%3E %3C/svg%3E`;
        saveCommand.iconImageUrl = saveSvg;

        if (saveCommand) {
            saveCommand.visible = event.selectedRows.length > 0 && hasPermission;
        }
    }

    @override
    public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
        let itemIds = event.selectedRows.map(i => i.getValueByName("ID"));
        let fileExts = event.selectedRows.map(i => i.getValueByName("File_x0020_Type").toLocaleLowerCase());

        DIALOG.showClose = false;
        DIALOG.error = "";
        for (let i = 0; i < fileExts.length; i++) {
            const ext = fileExts[i];
            if (this._validExts.indexOf(ext) === -1) {
                DIALOG.title = strings.ExtSupport;
                DIALOG.message = strings.CurrentExtSupport + ": " + this._validExts.join(", ") + ".";
                DIALOG.showClose = true;
                DIALOG.show();
                return;
            }
        }

        switch (event.itemId) {
            case 'EXPORT': {
                DIALOG.title = strings.DownloadAsPdf;
                DIALOG.message = `${strings.GeneratingFiles}...`;
                DIALOG.show();
                let files = await this.generatePdfUrls(itemIds);
                let isOk = true;
                if (itemIds.length == 1) {
                    const file = files[0];
                    DIALOG.message = `${strings.Processing} ${file.pdfFileName}...`;
                    DIALOG.render();
                    const response = await this.context.httpClient.get(file.pdfUrl, HttpClient.configurations.v1);
                    if (response.ok) {
                        const blob = await response.blob();
                        FileSaver.saveAs(blob, file.pdfFileName);
                    } else {
                        const error = await response.json();
                        let errorMessage = error.error.innererror ? error.error.innererror.code : error.error.message;
                        DIALOG.error = `${strings.FailedToProcess} ${file.pdfFileName} - ${errorMessage}<br/>`;
                        DIALOG.render();
                        isOk = false;
                    }
                } else {
                    const zip: JSZip = new JSZip();
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        DIALOG.message = `${strings.Processing} ${file.pdfFileName}...`;
                        DIALOG.render();
                        const response = await this.context.httpClient.get(file.pdfUrl, HttpClient.configurations.v1);
                        if (response.ok) {
                            const blob = await response.blob();
                            zip.file(file.pdfFileName, blob, { binary: true });
                        } else {
                            const error = await response.json();
                            let errorMessage = error.error.innererror ? error.error.innererror.code : error.error.message;
                            DIALOG.error = `${strings.FailedToProcess} ${file.pdfFileName} - ${errorMessage}<br/>`;
                            DIALOG.render();
                            isOk = false;
                        }
                    }
                    if (isOk) {
                        zip.file("Powered by PnP.txt", "https://github.com/pnp/PnP");
                        let d = new Date();
                        let dateString = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + '-' + ('0' + d.getHours()).slice(-2) + '-' + ('0' + d.getMinutes()).slice(-2) + '-' + ('0' + d.getSeconds()).slice(-2);

                        const zipBlob = await zip.generateAsync({ type: "blob" });
                        FileSaver.saveAs(zipBlob, `files-${dateString}.zip`);
                    }
                }

                if (!isOk) {
                    DIALOG.showClose = true;
                    DIALOG.render();
                }
                else {
                    DIALOG.close();
                }

                break;
            }
            case 'SAVE_AS': {
                DIALOG.title = strings.SaveAsPdf;
                DIALOG.message = `${strings.GeneratingFiles}...`;
                DIALOG.show();
                let files = await this.generatePdfUrls(itemIds);
                let ok = await this.saveAsPdf(files);
                if (ok) {
                    DIALOG.close();
                } else {
                    DIALOG.showClose = true;
                    DIALOG.render();
                }
                break;
            }
            default:
                throw new Error('Unknown command');
        }
    }

    private async saveAsPdf(files: SharePointFile[]): Promise<boolean> {
        const web = Web(this.context.pageContext.web.absoluteUrl);
        let isOk = true;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            DIALOG.message = `${strings.Processing} ${file.pdfFileName}...`;
            DIALOG.render();
            let pdfUrl = file.serverRelativeUrl.replace("." + file.fileType, ".pdf");
            let exists = true;
            try {
                await web.getFileByServerRelativePath(pdfUrl).get();
                DIALOG.error += `${file.pdfFileName} ${strings.Exists}.<br/>`;
                DIALOG.render();
                isOk = false;
            } catch (error) {
                exists = false;
            }
            if (!exists) {
                let response = await this.context.httpClient.get(file.pdfUrl, HttpClient.configurations.v1);
                if (response.ok) {
                    let blob = await response.blob();
                    await web.getFileByServerRelativeUrl(file.serverRelativeUrl).copyTo(pdfUrl);
                    await web.getFileByServerRelativeUrl(pdfUrl).setContentChunked(blob);
                    const item = await web.getFileByServerRelativeUrl(pdfUrl).getItem("File_x0020_Type");
                    // Potential fix for edge cases where file type is not set correctly
                    if (item["File_x0020_Type"] !== "pdf") {
                        await item.update({
                            "File_x0020_Type": "pdf"
                        });
                    }
                } else {
                    const error = await response.json();
                    let errorMessage = error.error.innererror ? error.error.innererror.code : error.error.message;
                    DIALOG.error += `${strings.FailedToProcess}s ${file.pdfFileName} - ${errorMessage}<br/>`;
                    DIALOG.render();
                    isOk = false;
                }
            }
        }
        return isOk;
    }

    private async generatePdfUrls(listItemIds: string[]): Promise<SharePointFile[]> {
        let web = Web(this.context.pageContext.web.absoluteUrl);
        let options: RenderListDataOptions = RenderListDataOptions.EnableMediaTAUrls | RenderListDataOptions.ContextInfo | RenderListDataOptions.ListData | RenderListDataOptions.ListSchema;

        var values = listItemIds.map(i => { return `<Value Type='Counter'>${i}</Value>`; });

        const viewXml: string = `
        <View Scope='RecursiveAll'>
            <Query>
                <Where>
                    <In>
                        <FieldRef Name='ID' />
                        <Values>
                            ${values.join("")}
                        </Values>
                    </In>
                </Where>
            </Query>
            <RowLimit>${listItemIds.length}</RowLimit>
        </View>`;


        let response = await web.lists.getById(this.context.pageContext.list.id.toString()).renderListDataAsStream({ RenderOptions: options, ViewXml: viewXml }) as any;
        // "{.mediaBaseUrl}/transform/pdf?provider=spo&inputFormat={.fileType}&cs={.callerStack}&docid={.spItemUrl}&{.driveAccessToken}"
        let pdfConversionUrl = response.ListSchema[".pdfConversionUrl"];
        let mediaBaseUrl = response.ListSchema[".mediaBaseUrl"];
        let callerStack = response.ListSchema[".callerStack"];
        let driveAccessToken = response.ListSchema[".driveAccessToken"];

        let pdfUrls: SharePointFile[] = [];
        response.ListData.Row.forEach(element => {
            let fileType = element[".fileType"];
            let spItemUrl = element[".spItemUrl"];
            let pdfUrl = pdfConversionUrl
                .replace("{.mediaBaseUrl}", mediaBaseUrl)
                .replace("{.fileType}", fileType)
                .replace("{.callerStack}", callerStack)
                .replace("{.spItemUrl}", spItemUrl)
                .replace("{.driveAccessToken}", driveAccessToken);
            let pdfFileName = element.FileLeafRef.replace(fileType, "pdf");
            pdfUrls.push({ serverRelativeUrl: element["FileRef"], pdfUrl: pdfUrl, fileType: fileType, pdfFileName: pdfFileName });
        });
        return pdfUrls;
    }
}
