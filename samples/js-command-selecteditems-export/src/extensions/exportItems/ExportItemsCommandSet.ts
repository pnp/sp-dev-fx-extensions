import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  RowAccessor,
  ListViewAccessor,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import * as xlsx from 'xlsx';
import SPField from '@microsoft/sp-page-context/lib/SPField';
import ListItemAccessor from '@microsoft/sp-listview-extensibility/lib/common/ListItemAccessor';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

/*
?loadSpfx=true&debugManifestsFile=https://localhost:4321/temp/manifests.js&customActions={%22aaa4141f-7829-4b98-af0f-a1e0e6f273fd%22:{%22location%22:%22ClientSideExtension.ListViewCommandSet.CommandBar%22}}
*/

export interface IExportItemsCommandSetProperties {

}

const LOG_SOURCE: string = 'ExportItemsCommandSet';

export default class ExportItemsCommandSet extends BaseListViewCommandSet<IExportItemsCommandSetProperties> {
  private _wb;
  private _viewColumns: string[];
  private _listTitle: string;

  @override
  public onInit(): Promise<void> {
    this.Initiate();
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const exportCommand: Command = this.tryGetCommand('EXCELEXPORTITEMS_1');
    if (exportCommand) {
      // This command should be hidden unless exactly one row is selected.
      exportCommand.visible = event.selectedRows.length > 0;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    let _grid: any[];

    // One dirty fix for LinkTitle column internal name
    let index = this._viewColumns.indexOf('LinkTitle');
    if (index !== -1) {
      this._viewColumns[index] = 'Title';
    }

    switch (event.itemId) {
      case 'EXCELEXPORTITEMS_1':
        if (event.selectedRows.length > 0) {
          _grid = new Array(event.selectedRows.length);
          _grid[0] = this._viewColumns;

          event.selectedRows.forEach((row: RowAccessor, index: number) => {
            let _row: string[] = [], i: number = 0;
              this._viewColumns.forEach((viewColumn: string) => {
                _row[i++] = this._getFieldValueAsText(row.getValueByName(viewColumn));      
              });  
            _grid[index+1] = _row;
          });
        }
        break;
      default:
        throw new Error('Unknown command');
    }
    this.writeToExcel(_grid);
  }

  /*
  Some brute force to identify the type of field and return the text value of the field, trying to avoid one more rest call for field types
  Tested, Single line, Multiline, Choice, Number, Boolean, Lookup and Managed metadata, 
  */
  private _getFieldValueAsText (field: any): string {
    let fieldValue: string;
    switch (typeof field) {
      case 'object': {                   
        if (field instanceof Array) {
          if(!field.length) {
            fieldValue = '';
          }
          // people
          else if (field[0].title) {
            fieldValue = field.map(value => value.title).join();
          }
          // lookup 
          else if (field[0].lookupValue) {
            fieldValue = field.map(value => value.lookupValue).join();
          } 
          // managed metadata
          else if (field[0].Label) {
            fieldValue = field.map(value => value.Label).join();
          }   
          // choice and others      
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
  }

  private writeToExcel(data: any[]): void {
    let ws = xlsx.utils.aoa_to_sheet(data);
    let wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'selected-items');
    xlsx.writeFile(wb, `${this._listTitle}.xlsx`);
  }

  private async getViewColumns() {
    const currentWebUrl: string = this.context.pageContext.web.absoluteUrl;
    this._listTitle = this.context.pageContext.legacyPageContext.listTitle;
    const viewId: string = this.context.pageContext.legacyPageContext.viewId.replace('{','').replace('}','');
    this.context.spHttpClient.get(`${currentWebUrl}/_api/lists/getbytitle('${this._listTitle}')/Views('${viewId}')/ViewFields`, SPHttpClient.configurations.v1)
      .then((res: SPHttpClientResponse) => {
        res.json().then((viewColumnsResponse: any) => {          
          this._viewColumns = viewColumnsResponse.Items;
        });
      });
  }

  private async Initiate() {
    await this.getViewColumns();
  }
}