import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import SendEMailDialog from './components/SendEMailDialog/SendEMailDialog';
import SendDocumentService from './services/SendDocumentService';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISendDocumentCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
}

const LOG_SOURCE: string = 'SendDocumentCommandSet';

export default class SendDocumentCommandSet extends BaseListViewCommandSet<ISendDocumentCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized SendDocumentCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const sendDocumentCommand: Command = this.tryGetCommand('SEND_DOCUMENT');
    if (sendDocumentCommand) {
      // This command should be hidden unless exactly one row is selected.
      sendDocumentCommand.visible = event.selectedRows.length === 1;
    }
  }


  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'SEND_DOCUMENT':
        var fileRef = event.selectedRows[0].getValueByName('FileRef').toString();
        var fileName = event.selectedRows[0].getValueByName('FileLeafRef').toString();

        SendDocumentService.fileName = fileName;
        SendDocumentService.fileUri = fileRef;
        SendDocumentService.webUri = this.context.pageContext.web.absoluteUrl;
        SendDocumentService.msGraphClientFactory = this.context.msGraphClientFactory;
        const dialog: SendEMailDialog = new SendEMailDialog(SendDocumentService);

        // show dialog
        dialog.show().then(() => {

        });
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
