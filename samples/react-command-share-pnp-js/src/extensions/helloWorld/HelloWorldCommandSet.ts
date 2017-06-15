import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  IListViewCommandSetRefreshEventParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'helloWorldStrings';
import DialogComponent from '../../components/dialogcomponent';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IHelloWorldCommandSetProperties {
  // This is an example; replace with your own property
}

const LOG_SOURCE: string = 'HelloWorldCommandSet';

export default class HelloWorldCommandSet
  extends BaseListViewCommandSet<IHelloWorldCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized HelloWorldCommandSet');
    return Promise.resolve<void>();
  }

  @override
  public onRefreshCommand(event: IListViewCommandSetRefreshEventParameters): void {
    // The command is only visible if multiple list items are selected
    event.visible = event.selectedRows.length > 1;
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    // Get selected items that we will send as DialogComponent property
    let rows = event.selectedRows;

    const div = document.createElement('div');
    const dialog: React.ReactElement<{}> = React.createElement(DialogComponent, { listItems: rows });
    ReactDOM.render(dialog, div);


  }
}
