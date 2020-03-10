import * as React from 'react';
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log, UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { sp } from '@pnp/pnpjs';
import * as strings from 'AddFoldersCommandSetStrings';
import AddFoldersDialog from './components/AddFoldersDialog';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IAddFoldersCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = 'AddFoldersCommandSet';

export default class AddFoldersCommandSet extends BaseListViewCommandSet<IAddFoldersCommandSetProperties> {
  private dialogContainer: HTMLDivElement = null;
  private commandtitle: string = '';

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized AddFoldersCommandSet');
    const commandAddFolders: Command = this.tryGetCommand('ADDFOLDERS');
    if (commandAddFolders) {
      commandAddFolders.title = strings.CommandAddFolders;
      this.commandtitle = commandAddFolders.title;
    }

    sp.setup({
      spfxContext: this.context
    });

    this.dialogContainer = document.body.appendChild(document.createElement("div"));

    return Promise.resolve();
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'ADDFOLDERS':
        var queryParameters = new UrlQueryParameterCollection(window.location.href);
        var currentFolderPath = queryParameters.getValue("Id") || queryParameters.getValue("RootFolder");
        var folderUrl;

        if (queryParameters.getValue("Id")) {
          folderUrl = decodeURIComponent(currentFolderPath);
        }
        else {
          folderUrl = this.context.pageContext.list.serverRelativeUrl;
        }

        this._renderDialogContainer(folderUrl, true);
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private _closeDialogContainer = () => {
    this._renderDialogContainer('', false);
  }

  private _renderDialogContainer(currentUrlLocation: string, isDialogDisplayed: boolean) {
    const element: React.ReactElement<any> = React.createElement(
      AddFoldersDialog,
      {
        context: this.context,
        location: currentUrlLocation,
        displayDialog: isDialogDisplayed,
        commandTitle: this.commandtitle,
        closeDialog: this._closeDialogContainer
      }
    );

    ReactDom.render(element, this.dialogContainer);
  }
}
