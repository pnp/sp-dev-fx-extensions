import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type IListViewCommandSetListViewUpdatedParameters,
  type RowAccessor
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import { spfi, SPFx, type SPFI } from '@pnp/sp';

import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import * as strings from 'GroupingCommandSetStrings';

const LOG_SOURCE: string = 'GroupingCommandSet';

export default class GroupingCommandSetCommandSet extends BaseListViewCommandSet<{}> {

  private _sp!: SPFI;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized');
    this._sp = spfi().using(SPFx(this.context));
    return Promise.resolve();
  }

  /**
   * Show commands only when at least one item is selected.
   */
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const hasSelection: boolean = event.selectedRows?.length > 0;

    const approve: Command | undefined = this.tryGetCommand('CMD_APPROVE');
    const reject: Command | undefined = this.tryGetCommand('CMD_REJECT');

    if (approve) approve.visible = hasSelection;
    if (reject) reject.visible = hasSelection;
  }

  /**
   * Route command execution.
   */
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    try {
      switch (event.itemId) {
        case 'CMD_APPROVE':
          await this._bulkUpdateStatus(event.selectedRows, 'Approved');
          break;
        case 'CMD_REJECT':
          await this._bulkUpdateStatus(event.selectedRows, 'Rejected');
          break;
        default:
          throw new Error(`Unknown command: ${event.itemId}`);
      }
    } catch (err) {
      Log.error(LOG_SOURCE, err instanceof Error ? err : new Error(String(err)));
      await Dialog.alert(`${strings.ErrorTitle}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Updates the "Status" column for every selected item using PnPJs.
   * Requests are issued concurrently with `Promise.allSettled`, so any
   * failed item IDs can be surfaced to the user without short-circuiting
   * the remaining updates.
   *
   * On success the list view is refreshed via `raiseOnChange()` (no full
   * page reload).
   */
  private async _bulkUpdateStatus(
    rows: readonly RowAccessor[],
    status: string
  ): Promise<void> {
    if (!rows?.length) return;

    const listId: string | undefined = this.context.pageContext.list?.id.toString();
    if (!listId) {
      throw new Error('Cannot determine list ID from page context.');
    }

    const list = this._sp.web.lists.getById(listId);

    const failures: number[] = await Promise.all(
      rows.map(async (row) => {
        const itemId: number = Number(row.getValueByName('ID'));
        try {
          await list.items.getById(itemId).update({ Status: status });
          return -1;
        } catch (err) {
          Log.warn(LOG_SOURCE, `Update failed for item ${itemId}: ${err instanceof Error ? err.message : String(err)}`);
          return itemId;
        }
      })
    ).then((ids) => ids.filter((id) => id >= 0));

    if (failures.length > 0) {
      throw new Error(`${strings.UpdateFailed} (items: ${failures.join(', ')})`);
    }

    // Re-evaluate command visibility.
    this.raiseOnChange();

    // SPFx does not expose a public API to force the modern list view to
    // re-fetch its data, so reload the page to surface the new Status values
    // immediately.
    window.location.reload();
  }
}
