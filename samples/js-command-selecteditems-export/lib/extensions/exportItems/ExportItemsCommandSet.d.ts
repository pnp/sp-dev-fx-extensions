import { BaseListViewCommandSet, IListViewCommandSetListViewUpdatedParameters, IListViewCommandSetExecuteEventParameters } from '@microsoft/sp-listview-extensibility';
export interface IExportItemsCommandSetProperties {
}
export default class ExportItemsCommandSet extends BaseListViewCommandSet<IExportItemsCommandSetProperties> {
    private _wb;
    private _viewColumns;
    private _listTitle;
    onInit(): Promise<void>;
    onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void;
    onExecute(event: IListViewCommandSetExecuteEventParameters): void;
    private _getFieldValueAsText(field);
    private writeToExcel(data);
    private getViewColumns();
    private Initiate();
}
