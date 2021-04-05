import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
import {ISendToTeamsProps, SendToTeams} from  './../../components';
import * as strings from 'SendToTeamsCommandSetStrings';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { GlobalStateContextProvider }  from './../../globalState';
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISendToTeamsCommandSetProperties {
  // This is an example; replace with your own properties
}

const LOG_SOURCE: string = 'SendToTeamsCommandSet';

export default class SendToTeamsCommandSet extends BaseListViewCommandSet<ISendToTeamsCommandSetProperties> {
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized SendToTeamsCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('SEND_TO_TEAMS');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'SEND_TO_TEAMS':
      const div = document.createElement('div');
      const element = React.createElement(SendToTeams,{showPanel: true, context: this.context, event: event});
      const contextProvider = React.createElement(GlobalStateContextProvider,{ children:element });
      ReactDOM.render(contextProvider, div);
      break;
      default:
        throw new Error('Unknown command');
    }
  }
}
