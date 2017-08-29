import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'SpfxCloneCommandSetStrings';

export interface ISpfxCloneCommandSetProperties {
  //Nope
}

const LOG_SOURCE: string = 'SpfxCloneCommandSet';

export default class SpfxCloneCommandSet
  extends BaseListViewCommandSet<ISpfxCloneCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized SpfxCloneCommandSet');
    return Promise.resolve<void>();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const command: Command | undefined = this.tryGetCommand("spfxClone");
    if (command) {
      command.visible = event.selectedRows.length >= 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.commandId) {
      case 'spfxClone':
        alert('Cloning time!');
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
