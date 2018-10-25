import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
  RowAccessor
} from '@microsoft/sp-listview-extensibility';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IReactCmdSharePnPJsCommandSetProperties {
  // This is an example; replace with your own properties
}

const LOG_SOURCE: string = 'ReactCmdSharePnPJsCommandSet';

export default class ReactCmdSharePnPJsCommandSet extends BaseListViewCommandSet<IReactCmdSharePnPJsCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ReactCmdSharePnPJsCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const shareCommand: Command = this.tryGetCommand('SHARE');
    if (shareCommand) {
      // This command should be hidden unless more than one row is selected.
      shareCommand.visible = event.selectedRows.length > 1;
    }
  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    switch (event.itemId) {
      case 'SHARE':

        const rows: ReadonlyArray<RowAccessor> = event.selectedRows;
        const component = await import(
          /* webpackMode: "lazy" */
          /* webpackChunkName: 'multisharedialog-component' */
          './components/MultiShareDialog'
        );
        
        // Setup and show dialog
        const dialog = new component.MultiShareDialog;
        dialog.listItems = rows;
        dialog.show();

        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
