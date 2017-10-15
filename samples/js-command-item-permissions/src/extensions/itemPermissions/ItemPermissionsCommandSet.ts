import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import { SPPermission } from '@microsoft/sp-page-context';

import * as strings from 'ItemPermissionsCommandSetStrings';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IItemPermissionsCommandSetProperties {
}

const LOG_SOURCE: string = 'ItemPermissionsCommandSet';

export default class ItemPermissionsCommandSet extends BaseListViewCommandSet<IItemPermissionsCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ItemPermissionsCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('ITEM_PERMISSIONS');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = this.context.pageContext.list.permissions.hasPermission(SPPermission.managePermissions)
        && event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'ITEM_PERMISSIONS':
      const listId = this.context.pageContext.list.id;
        window.open(`${this.context.pageContext.web.absoluteUrl}/_layouts/15/user.aspx?List=%7B${listId}%7D&obj=%7B${listId}%7D,${event.selectedRows[0].getValueByName('ID')},LISTITEM`, '_blank');

        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
