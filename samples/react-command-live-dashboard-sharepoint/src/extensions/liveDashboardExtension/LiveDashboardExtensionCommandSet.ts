import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import { SPPermission } from '@microsoft/sp-page-context';
import IFrameDialog from './IFrameDialog';
import DashboardUrlStore from './DashboardUrlStore';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ILiveDashboardExtensionCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
  // Optional deployment-time default, pre-filled into the configuration prompt on first use.
  // Not required: once a list is configured, its URL lives in that list's property bag.
  dashboardUrl?: string;
}

const LOG_SOURCE: string = 'LiveDashboardExtensionCommandSet';

// Pre-fills the configuration prompt when neither the list nor properties.dashboardUrl has a value yet.
const SAMPLE_DASHBOARD_URL: string =
  'https://binaryrootstest.sharepoint.com/sites/EmployeeDB/_layouts/15/embed.aspx?UniqueId=07c068f2-20f4-4fe9-967b-d415e7b8c5e1';

export default class LiveDashboardExtensionCommandSet extends BaseListViewCommandSet<ILiveDashboardExtensionCommandSetProperties> {
  private _dashboardUrlStore!: DashboardUrlStore;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized LiveDashboardExtensionCommandSet');

    this._dashboardUrlStore = new DashboardUrlStore(this.context);

    // initial state of the command's visibility
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    compareOneCommand.visible = false;

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_1':
        Dialog.alert(`${this.properties.sampleTextOne}`).catch(() => {
          /* handle error */
        });
        break;
      case 'COMMAND_2':
        this._showDashboard().catch(() => {
          /* handle error */
        });
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  /**
   * Whether the current user is allowed to configure/change the dashboard URL for this list.
   * Property bag writes require Manage Lists, so this mirrors that requirement in the UI.
   */
  private _canManageDashboard(): boolean {
    return this.context.pageContext.list?.permissions.hasPermission(SPPermission.manageLists) ?? false;
  }

  /**
   * Shows the dashboard for the current list, prompting for (and persisting) a URL
   * the first time this list is used with the extension. Site owners/list admins
   * also get an "Edit URL" affordance in the dialog to change it later.
   */
  private async _showDashboard(): Promise<void> {
    const listGuid: string | undefined = this.context.listView.list?.guid.toString();
    if (!listGuid) {
      await Dialog.alert('Unable to determine the current list.');
      return;
    }

    const canManage: boolean = this._canManageDashboard();
    let url: string | undefined = await this._dashboardUrlStore.getUrl(listGuid);

    if (!url) {
      if (!canManage) {
        await Dialog.alert(
          "This list's dashboard hasn't been configured yet. Ask a site owner or list administrator to set it up."
        );
        return;
      }

      url = await this._promptAndSaveUrl(listGuid, this.properties.dashboardUrl || SAMPLE_DASHBOARD_URL);
      if (!url) {
        return;
      }
    }

    await this._openDashboardDialog(listGuid, url, canManage);
  }

  private async _promptAndSaveUrl(listGuid: string, defaultValue: string): Promise<string | undefined> {
    const entered: string | undefined = await Dialog.prompt(
      'Enter the dashboard URL to display for this list (e.g. a SharePoint embed.aspx link):',
      { defaultValue }
    );

    if (!entered) {
      return undefined;
    }

    const url: string = entered.trim();
    const saved: boolean = await this._dashboardUrlStore.saveUrl(listGuid, url);
    if (!saved) {
      Log.warn(
        LOG_SOURCE,
        'Could not save the dashboard URL to the list (Manage Lists permission required). It will only apply to this session.'
      );
    }

    return url;
  }

  private async _openDashboardDialog(listGuid: string, url: string, canManage: boolean): Promise<void> {
    const dialog: IFrameDialog = new IFrameDialog({
      url,
      title: 'Live Dashboard',
      onEditRequested: canManage
        ? (): void => {
          this._promptAndSaveUrl(listGuid, url).then((updatedUrl) => {
            if (updatedUrl) {
              return this._openDashboardDialog(listGuid, updatedUrl, canManage);
            }
            return this._openDashboardDialog(listGuid, url, canManage);
          }).catch(() => {
            /* handle error */
          });
        }
        : undefined
    });
    await dialog.show();
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = this.context.listView.selectedRows?.length === 1;
    }

    // TODO: Add your logic here

    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
  }
}
