import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'MakeSinglePartAppPageCommandSetStrings';
import { SPHttpClientResponse, ISPHttpClientOptions, SPHttpClient } from '@microsoft/sp-http';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMakeSinglePartAppPageCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = 'MakeSinglePartAppPageCommandSet';
const MAKE_SINGLE_PART_APP_PAGE: string = "MAKE_SINGLE_PART_APP_PAGE";

export default class MakeSinglePartAppPageCommandSet extends BaseListViewCommandSet<IMakeSinglePartAppPageCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized MakeSinglePartAppPageCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareCommand: Command = this.tryGetCommand(MAKE_SINGLE_PART_APP_PAGE);
    if (compareCommand) {
      compareCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case MAKE_SINGLE_PART_APP_PAGE:
        const fileName: string = event.selectedRows[0].getValueByName("FileLeafRef");

        this._updatePageLayoutType(fileName).then(() => {
          Dialog.alert(`Page configured as SingleWebPartAppPage!`);
        }).catch((err) => {
          console.log(err);
          Dialog.alert(`Something went wrong. Review DevTools to get more info.`);
        });
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private async _updatePageLayoutType(name: string): Promise<void> {
    const endpoint: string = `${this.context.pageContext.site.serverRelativeUrl}/_api/web/getfilebyurl('SitePages/${name}')/ListItemAllFields`;

    const opt: ISPHttpClientOptions = {
      headers: {
          'Content-Type': 'application/json',
          'Accept':'application/json',
          'X-HTTP-Method': 'MERGE',
          'IF-MATCH': '*'
      },
      body: JSON.stringify({
        PageLayoutType: "SingleWebPartAppPage"
      })
    };


    const response: SPHttpClientResponse = await this.context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, opt);

    if (response.status === 204) {
      console.log("Layout updated successfully");
    } else {
      throw new Error(`Error updating Layout: ${response.statusText}`);
    }
  }
}
