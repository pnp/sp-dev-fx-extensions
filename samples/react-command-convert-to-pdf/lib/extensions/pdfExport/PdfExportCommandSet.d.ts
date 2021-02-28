import { BaseListViewCommandSet, IListViewCommandSetListViewUpdatedParameters, IListViewCommandSetExecuteEventParameters } from '@microsoft/sp-listview-extensibility';
import "@pnp/polyfill-ie11";
export interface IPdfExportCommandSetProperties {
}
export default class PdfExportCommandSet extends BaseListViewCommandSet<IPdfExportCommandSetProperties> {
    private _validExts;
    onInit(): Promise<void>;
    onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void;
    onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void>;
    private saveAsPdf;
    private generatePdfUrls;
}
//# sourceMappingURL=PdfExportCommandSet.d.ts.map