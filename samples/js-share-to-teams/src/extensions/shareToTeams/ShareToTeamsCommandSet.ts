import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'ShareToTeamsCommandSetStrings';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IShareToTeamsCommandSetProperties {
}

const LOG_SOURCE: string = 'ShareToTeamsCommandSet';

export default class ShareToTeamsCommandSet extends BaseListViewCommandSet<IShareToTeamsCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ShareToTeamsCommandSet');
    this.shareToTeamsJSLoad();
    this.addHiddenShareButton();
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const shareToTeamsCommand: Command = this.tryGetCommand('SHARETOTEAMS');
    if (shareToTeamsCommand) {
      // This command should be hidden unless exactly one row is selected.
      shareToTeamsCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'SHARETOTEAMS':
        let divButton = document.getElementById("CustomShareToTeams");
        //Logic for List Item
        if (event.selectedRows[0].getValueByName("FileRef").indexOf(".000") > -1) {
          let indexOfTrailingSlash: number = event.selectedRows[0].getValueByName("FileRef").lastIndexOf("/");
          let itemID: string = event.selectedRows[0].getValueByName("ID");
          let finalURL = event.selectedRows[0].getValueByName("FileRef").substr(0, indexOfTrailingSlash).concat(`/DispForm.aspx?ID=${itemID}&pa=1`);
          divButton.setAttribute("data-href", `${window.location.origin}${finalURL}`);
        } else {
          divButton.setAttribute("data-href", `${window.location.origin}${event.selectedRows[0].getValueByName('FileRef')}`);
        }
        eval('shareToMicrosoftTeams.renderButtons();');
        divButton.click();
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private shareToTeamsJSLoad = () => {
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://teams.microsoft.com/share/launcher.js";
    document.body.appendChild(script);
  }

  private addHiddenShareButton = () => {
    let divButton = document.createElement("div");
    divButton.id = "CustomShareToTeams";
    divButton.className = "teams-share-button";
    divButton.style.display = "none";
    document.body.appendChild(divButton);
  }
}
