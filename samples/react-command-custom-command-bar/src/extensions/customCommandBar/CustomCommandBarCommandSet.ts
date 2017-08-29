import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as React from 'react';
import * as ReactDom from 'react-dom';

import * as strings from 'customCommandBarStrings';

import CustomCommandBar, { ICustomCommandBarProps } from './components/CustomCommandBar/CustomCommandBar';
import { ReactHelper, ReactContainersTypes } from './ReactHelper';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICustomCommandBarCommandSetProperties {
  isPressed: boolean;
}

const LOG_SOURCE: string = 'CustomCommandBarCommandSet';

export default class CustomCommandBarCommandSet
  extends BaseListViewCommandSet<ICustomCommandBarCommandSetProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized CustomCommandBarCommandSet');
    return Promise.resolve<void>();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void  {
    const command: Command | undefined = this.tryGetCommand('COMMAND_1');
    if (command) {
      command.visible = true;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.commandId) {
      case 'COMMAND_1':
        this.properties.isPressed = !this.properties.isPressed;
        this.toggleCommandBarVisibility();
        break;
    }
  }

  private toggleCommandBarVisibility() {
    if (this.properties.isPressed) {
      const commandBar: React.ReactElement<ICustomCommandBarProps> = React.createElement(
        CustomCommandBar, {}
      );
      ReactDom.render(commandBar, ReactHelper.injectContainerElement(ReactContainersTypes.CommandBar, document.querySelector('.od-Files-topBar') as HTMLElement));
    }
    else {
      ReactHelper.clearReactContainerElementContent(ReactContainersTypes.CommandBar);
    }
  }
}
