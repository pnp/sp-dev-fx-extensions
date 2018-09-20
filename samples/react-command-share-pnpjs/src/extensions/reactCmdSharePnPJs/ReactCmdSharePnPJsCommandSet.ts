import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import MultiShareDialog from './components/MultiShareDialog';


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
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    const rows = event.selectedRows;

    // Create the dialog, inject the selected files and open dialog.
    const dialog: MultiShareDialog = new MultiShareDialog();
    dialog.listItems = rows;
    dialog.show();
  }
}
