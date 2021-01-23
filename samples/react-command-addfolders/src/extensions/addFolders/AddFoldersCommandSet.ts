import * as React from 'react';
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetExecuteEventParameters,
  IListViewCommandSetListViewUpdatedParameters
} from '@microsoft/sp-listview-extensibility';
import { sp } from '@pnp/sp/presets/all';
import { IListInfo } from '@pnp/sp/lists';
import { SPPermission } from '@microsoft/sp-page-context';
import * as strings from 'AddFoldersCommandSetStrings';
import AddFoldersDialog from './components/AddFoldersDialog';

const LOG_SOURCE: string = 'AddFoldersCommandSet';

export default class AddFoldersCommandSet extends BaseListViewCommandSet<{}> {
  private dialogContainer: HTMLDivElement = null;
  private commandtitle: string = '';
  private displayCommand: boolean = false;

  @override
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized AddFoldersCommandSet');
    const commandAddFolders: Command = this.tryGetCommand('ADDFOLDERS');

    if (commandAddFolders) {
      if (this.context.pageContext.list.permissions.hasPermission(SPPermission.addListItems)) {

        let folderEnabled: boolean = await sp.web.lists.getById(this.context.pageContext.list.id.toString()).get()
        .then((value: IListInfo) => {
          return value.EnableFolderCreation;
        });

        if (folderEnabled) {
          commandAddFolders.title = strings.CommandAddFolders;
          this.commandtitle = commandAddFolders.title;

          sp.setup({
            spfxContext: this.context
          });

          this.dialogContainer = document.body.appendChild(document.createElement("div"));
          this.displayCommand = true;
        }
      }
    }

    return Promise.resolve();
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'ADDFOLDERS':
        var queryParameters = new URLSearchParams(location.href);
        var currentFolderPath = queryParameters.get("id") || queryParameters.get("Id") || queryParameters.get("RootFolder");
        var folderUrl: string;

        if (queryParameters.has("Id") || queryParameters.has("id")) {
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

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const commandAddFolders: Command = this.tryGetCommand('ADDFOLDERS');
    if (commandAddFolders) {
      commandAddFolders.visible = event.selectedRows.length === 0 && this.displayCommand;
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
