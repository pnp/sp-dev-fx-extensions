import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import { Dialog } from '@microsoft/sp-dialog';
import TenantScheduleDialog from './TenantScheduleDialog';

import * as strings from 'TenantScheduleDocMeetingCommandSetStrings';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ITenantScheduleDocMeetingCommandSetProperties {
  // This is an example; replace with your own property
  disabledCommandIds: string[] | undefined;
}

const LOG_SOURCE: string = 'TenantScheduleDocMeetingCommandSet';

export default class TenantScheduleDocMeetingCommandSet
  extends BaseListViewCommandSet<ITenantScheduleDocMeetingCommandSetProperties> {

  private _meetingDate: Date;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized TenantScheduleDocMeetingCommandSet');
    return Promise.resolve<void>();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    if (this.properties.disabledCommandIds) {
      for (const commandId of this.properties.disabledCommandIds) {
        const command: Command | undefined = this.tryGetCommand(commandId);
        if (command && command.visible) {
          Log.info(LOG_SOURCE, `Hiding command ${commandId}`);
          command.visible = false;
        }
      }
    }

    // Show the command just in case a single item is selected
    const scheduleMeetingCommand: Command | undefined = this.tryGetCommand('SCHEDULE_MEETING');
    scheduleMeetingCommand.visible = event.selectedRows.length == 1; 
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.commandId) {
      case 'SCHEDULE_MEETING':
        // Dialog.prompt('Something');
        const id: number = event.selectedRows[0].getValueByName("ID");
        alert(id);

        const dialog: TenantScheduleDialog = new TenantScheduleDialog();
        dialog.message = 'Select a meeting date';

        dialog.meetingDate = this._meetingDate;
        dialog.show().then(() => {
          this._meetingDate = dialog.meetingDate;
          Dialog.alert(`Picked date: ${dialog.meetingDate}`);
        });
        
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
