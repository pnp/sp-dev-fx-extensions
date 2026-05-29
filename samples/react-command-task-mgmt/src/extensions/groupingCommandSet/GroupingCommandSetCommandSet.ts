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
    const copyLink: Command | undefined = this.tryGetCommand('CMD_COPYLINK');

    if (approve) approve.visible = hasSelection;
    if (reject) reject.visible = hasSelection;
    if (copyLink) copyLink.visible = hasSelection;
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
        case 'CMD_COPYLINK':
          await this._copyLink(event.selectedRows);
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

    // Soft refresh — let the host re-render the command bar; the list view
    // will pick up the new Status values on its next data fetch.
    this.raiseOnChange();
  }

  /**
   * Copies the Display Form URL of the first selected item to the clipboard.
   * Falls back to a Dialog with the link when the Clipboard API is unavailable
   * (insecure context, missing user-gesture, or unsupported browser).
   *
   * URL pattern: <webUrl>/<listServerRelativeUrl>/DispForm.aspx?ID=<itemId>
   */
  private async _copyLink(rows: readonly RowAccessor[]): Promise<void> {
    const first: RowAccessor | undefined = rows?.[0];
    if (!first) return;

    const itemId: number = Number(first.getValueByName('ID'));
    const webUrl: string = this.context.pageContext.web.absoluteUrl;
    const listRelUrl: string = this.context.pageContext.list?.serverRelativeUrl ?? '';

    const link: string =
      `${webUrl.replace(/\/$/, '')}${listRelUrl}/DispForm.aspx?ID=${itemId}`;

    let copied: boolean = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(link);
        copied = true;
      }
    } catch (err) {
      Log.warn(LOG_SOURCE, `Clipboard API failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (copied) {
      Log.info(LOG_SOURCE, `Copied link: ${link}`);
      await Dialog.alert(strings.CopySuccess);
    } else {
      // Fallback — show the link so the user can copy manually.
      await Dialog.alert(`${strings.CopyFailed}\n\n${link}`);
    }
  }
}
