import * as React from 'react';
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { ExtensionContext } from '@microsoft/sp-extension-base';

import * as strings from 'JumpToFolderCommandSetStrings';
import { ICustomPanelProps, CustomPanel } from './components/CustomPanel';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IJumpToFolderCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
}

const LOG_SOURCE: string = 'JumpToFolderCommandSet';

export default class JumpToFolderCommandSet extends BaseListViewCommandSet<IJumpToFolderCommandSetProperties> {

  private _panelPlaceHolder: HTMLDivElement = null;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized JumpToFolderCommandSet');

    this._panelPlaceHolder = document.body.appendChild(document.createElement("div"));

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    // const compareOneCommand: Command = this.tryGetCommand('JumpTo');
    // if (compareOneCommand) {
    //   // This command should always be visible
    //   compareOneCommand.visible = true;
    // }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'JumpTo':
        this._showPanel();
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private _showPanel = (): void => {

    this._renderPanelComponent({
      context: this.context as ExtensionContext,
      isOpen: true,
      rootFolder: {
        Name: this.context.pageContext.list.title,
        ServerRelativeUrl: this.context.pageContext.list.serverRelativeUrl,
      },
      defaultFolder: {
        Name: this.context.pageContext.list.title,
        ServerRelativeUrl: this.context.pageContext.list.serverRelativeUrl,
      },
    });
  }

  private _renderPanelComponent = (props: ICustomPanelProps): void => {
    const element: React.ReactElement<ICustomPanelProps> = React.createElement(CustomPanel, props);
    ReactDom.render(element, this._panelPlaceHolder);
  }

}
