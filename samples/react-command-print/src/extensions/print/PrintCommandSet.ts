import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import {
  sp
} from "@pnp/sp";
import { Dialog } from '@microsoft/sp-dialog';
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IPrintCommandSetProperties {
  // This is an example; replace with your own properties
  printText: string;
}

const LOG_SOURCE: string = 'PrintCommandSet';

export default class PrintCommandSet extends BaseListViewCommandSet<IPrintCommandSetProperties> {
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized PrintCommandSet');

    // Setup PnP core to use current context
    return super.onInit().then(_ => {
      sp.setup({
        spfxContext: this.context
      });
    });
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const printCommand: Command = this.tryGetCommand('COMMAND_Print');
    if (printCommand) {
      // This command should be hidden unless exactly one row is selected.
      printCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    switch (event.itemId) {
      case 'COMMAND_Print':
        const component = await import(
          /* webpackMode: "lazy" */
          /* webpackChunkName: 'multisharedialog-component' */
          './components/print-dialog'
        );
        const dialog = new component.PrintDialog();
        dialog.webUrl = this.context.pageContext.web.absoluteUrl;
        dialog.listId = this.context.pageContext.list.id.toString();
        dialog.itemId = event.selectedRows[0].getValueByName('ID');
        dialog.title = event.selectedRows[0].getValueByName('Title');
        dialog.show().then(()=>{
          Dialog.alert(''); //This line prevents issues with the dialog, please do not remove it/
        });
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
