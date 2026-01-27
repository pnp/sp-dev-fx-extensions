import { Log } from "@microsoft/sp-core-library";
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs,
  RowAccessor,
} from "@microsoft/sp-listview-extensibility";
import { FlowService } from "../../services";
import { FlowTriggerDialog } from "./components";
import { IFlowRequestBody, ISelectedItem, IUser } from "../../models";
import { FlowConfig } from "../../constants";

export interface IAuthenticatedFlowTriggerCommandSetProperties {
  // Reserved for future use
}

const LOG_SOURCE: string = "AuthenticatedFlowTriggerCommandSet";

export default class AuthenticatedFlowTriggerCommandSet extends BaseListViewCommandSet<IAuthenticatedFlowTriggerCommandSetProperties> {

  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, "Initialized AuthenticatedFlowTriggerCommandSet");

    // Initialize the flow service
    await FlowService.init(this.context.aadHttpClientFactory);

    // Initial state of the command's visibility
    const triggerFlowCommand: Command = this.tryGetCommand("TRIGGER_FLOW");
    if (triggerFlowCommand) {
      triggerFlowCommand.visible = false;
    }

    this.context.listView.listViewStateChangedEvent.add(
      this,
      this._onListViewStateChanged
    );

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case "TRIGGER_FLOW":
        this._showFlowTriggerDialog();
        break;
      default:
        throw new Error("Unknown command");
    }
  }

  private _showFlowTriggerDialog(): void {
    const selectedRows = this.context.listView.selectedRows;
    if (!selectedRows || selectedRows.length !== 1) {
      return;
    }

    const selectedRow: RowAccessor = selectedRows[0];
    const requestBody = this._buildRequestBody(selectedRow);

    const dialog = new FlowTriggerDialog(requestBody);
    dialog.show().catch((error) => {
      Log.error(LOG_SOURCE, error);
    });
  }

  private _buildRequestBody(selectedRow: RowAccessor): IFlowRequestBody {
    const selectedItem: ISelectedItem = {
      id: selectedRow.getValueByName("ID") as number,
      fileRef: selectedRow.getValueByName("FileRef") as string,
      fileLeafRef: selectedRow.getValueByName("FileLeafRef") as string,
      fileType: (selectedRow.getValueByName("File_x0020_Type") as string) || "",
      uniqueIdentifier: selectedRow.getValueByName("UniqueId") as string,
    };

    const user: IUser = {
      loginName: this.context.pageContext.user.loginName,
      displayName: this.context.pageContext.user.displayName,
      email: this.context.pageContext.user.email,
      input: {},
    };

    const siteUrl = this.context.pageContext.web.absoluteUrl;
    const tenantUrl = siteUrl.substring(0, siteUrl.indexOf("/sites/")) || siteUrl;

    return {
      originSecret: FlowConfig.originSecret,
      site: siteUrl,
      tenantUrl: tenantUrl,
      listId: this.context.pageContext.list?.id.toString() || "",
      selectedItem,
      user,
    };
  }

  private _onListViewStateChanged = (
    _args: ListViewStateChangedEventArgs
  ): void => {
    Log.info(LOG_SOURCE, "List view state changed");

    const triggerFlowCommand: Command = this.tryGetCommand("TRIGGER_FLOW");
    if (triggerFlowCommand) {
      // Show command only when exactly one item is selected
      triggerFlowCommand.visible =
        this.context.listView.selectedRows?.length === 1;
    }

    this.raiseOnChange();
  };
}
