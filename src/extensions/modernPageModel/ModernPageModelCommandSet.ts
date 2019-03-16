import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import PageModelDialog from './components/PageModelDialog';
import { setup as pnpSetup } from "@pnp/common";



/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ImodernPageModelCommandSetProperties {
  // This is an example; replace with your own properties
}

const LOG_SOURCE: string = 'modernPageModelCommandSet';

export default class modernPageModelCommandSet extends BaseListViewCommandSet<ImodernPageModelCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized modernPageModelCommandSet');
    return super.onInit().then(_ => {

      // other init code may be present

      pnpSetup({
        spfxContext: this.context
      });
    });
  }


  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {

  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {

    switch (event.itemId) {
      case 'COMMAND_1':

        const dialog: PageModelDialog = new PageModelDialog();
        dialog.show();

        break;
      default:
        throw new Error('Unknown command');

    }
  }

}
