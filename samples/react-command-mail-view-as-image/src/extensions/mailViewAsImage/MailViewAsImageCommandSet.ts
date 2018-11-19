import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import MailDetailsDialog from './components/MailDetailsDialog';

import * as strings from 'MailViewAsImageCommandSetStrings';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMailViewAsImageCommandSetProperties {
}

const LOG_SOURCE: string = 'MailViewAsImageCommandSet';

export default class MailViewAsImageCommandSet extends BaseListViewCommandSet<IMailViewAsImageCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized MailViewAsImageCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'MAIL_VIEW_AS_IMAGE':
        const dialog: MailDetailsDialog = new MailDetailsDialog();
        dialog.context = this.context;
        dialog.show();

        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
