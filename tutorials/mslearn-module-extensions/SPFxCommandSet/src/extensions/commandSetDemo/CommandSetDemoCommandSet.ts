import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICommandSetDemoCommandSetProperties {
  messagePrefix: string;
}

const LOG_SOURCE: string = 'CommandSetDemoCommandSet';

export default class CommandSetDemoCommandSet extends BaseListViewCommandSet<ICommandSetDemoCommandSetProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized CommandSetDemoCommandSet');

    const one_item_selected: Command = this.tryGetCommand('ONE_ITEM_SELECTED');
    one_item_selected.visible = false;

    const two_item_selected: Command = this.tryGetCommand('TWO_ITEM_SELECTED');
    two_item_selected.visible = false;

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    /* eslint-disable @typescript-eslint/no-floating-promises */
    switch (event.itemId) {
      case 'ONE_ITEM_SELECTED':
        Dialog.alert(`${this.properties.messagePrefix} ONE_ITEM_SELECTED command checked; Title = ${event.selectedRows[0].getValueByName('Title')}`);
        break;
      case 'TWO_ITEM_SELECTED':
        Dialog.alert(`${this.properties.messagePrefix} TWO_ITEM_SELECTED command checked; Title = ${event.selectedRows[event.selectedRows.length-1].getValueByName('Title')}`);
        break;
      case 'ALWAYS_ON':
        Dialog.alert(`${this.properties.messagePrefix} ALWAYS_ON command checked. Total selected: ${event.selectedRows.length}`);
        break;
      default:
        throw new Error('Unknown command');
    }
    /* eslint-enable @typescript-eslint/no-floating-promises */
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const one_item_selected: Command = this.tryGetCommand('ONE_ITEM_SELECTED');
    if (one_item_selected) {
      one_item_selected.visible = this.context.listView.selectedRows?.length === 1;
    }
    const two_item_selected: Command = this.tryGetCommand('TWO_ITEM_SELECTED');
    if (two_item_selected) {
      two_item_selected.visible = this.context.listView.selectedRows?.length === 2;
    }

    // You should call this.raiseOnChange() to update the command bar
    this.raiseOnChange();
  }
}
