import { override } from "@microsoft/decorators";
import {
  ShareToTeamsContent,
  IShareToTeamsProps,
} from "../../components/ShareToTeams";
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
} from "@microsoft/sp-listview-extensibility";

import "@pnp/graph/users";
import * as ReactDOM from "react-dom";
import * as React from "react";

export interface IShareToTeamsCommandSetProperties {
  supportedFileTypes: string; //tenantproperties?
  allowListSharing: boolean;
  allowFolderSharing: boolean;
  allowFileSharing: boolean;
  librarySharingMethod: string; // "native" attempts to use the native teams app. "page" just opens a sharepoint page
  folderSharingMethod: string;
  fileSharingMethod: string;
}

export default class ShareToTeamsCommandSet extends BaseListViewCommandSet<IShareToTeamsCommandSetProperties> {
  private panelPlaceHolder: HTMLDivElement = null;
  private panelProps:IShareToTeamsProps;
  
  @override
  public async onInit(): Promise<void> {
    await super.onInit();
    // Create the container for our React component
    this.panelPlaceHolder = document.body.appendChild(
      document.createElement("div")
    );
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(
    event: IListViewCommandSetListViewUpdatedParameters
  ): void {
    const shareToTeamsCommand: Command = this.tryGetCommand(
      "COMMAND_SHARE_TO_TEAMS"
    );
       if (shareToTeamsCommand) {
      if (event.selectedRows.length == 1) {
        //
        switch (event.selectedRows[0].getValueByName("FSObjType")) {
          //one row selected
          case "0":
            //its a file
            if (
              this.properties.supportedFileTypes.indexOf(
                event.selectedRows[0].getValueByName("File_x0020_Type")
              ) !== -1 &&
              this.properties.allowFileSharing
            ) {
              shareToTeamsCommand.visible = true;
            } else {
              shareToTeamsCommand.visible = false;
            }
            break;
          case "1":
            //its a folder
            shareToTeamsCommand.visible = this.properties.allowFolderSharing;
            break;
          default:
            shareToTeamsCommand.visible = false;
        }
      } else {
        if (event.selectedRows.length > 1 || event.selectedRows.length < 0) {
          shareToTeamsCommand.visible = false;
        } else {
          //no rows selected are they at the top or in a folder
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("id")) {
            // in a folder
            shareToTeamsCommand.visible = this.properties.allowFolderSharing;
          } else {
            // at root
            shareToTeamsCommand.visible = this.properties.allowListSharing;
          }
        }
      }
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case "COMMAND_SHARE_TO_TEAMS":
        this.cmdShareToTeams(event);
        break;
      default:
        throw new Error("Unknown command");
    }
  }

  private cmdShareToTeams(event: IListViewCommandSetExecuteEventParameters) {

    this.panelProps = {
      event: event,
      settings: this.properties,
      context: this.context,
      onClose: this._dismissPanel.bind(this),
      isOpen:true
    };
    this._showPanel();
  }
  private _showPanel() {
    
    this._renderPanelComponent();
  }

  private _dismissPanel() {
 
    this.panelProps.isOpen=false;
    this._renderPanelComponent();
  }

  private _renderPanelComponent() {
   
    const element: React.ReactElement<IShareToTeamsProps> = React.createElement(
      ShareToTeamsContent,
      this.panelProps
    );
    ReactDOM.render(element, this.panelPlaceHolder);
  }
}
