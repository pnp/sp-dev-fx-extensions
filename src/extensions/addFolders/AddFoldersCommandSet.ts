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
import { IListInfo } from '@pnp/sp/lists';
import { SPPermission } from '@microsoft/sp-page-context';
import * as strings from 'AddFoldersCommandSetStrings';
import AddFoldersDialog from './components/AddFoldersDialog';

const LOG_SOURCE: string = 'AddFoldersCommandSet';

export default class AddFoldersCommandSet extends BaseListViewCommandSet<{}> {
  private dialogContainer: HTMLDivElement = null;
  private commandtitle: string = '';

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
        }
        else {
          commandAddFolders.visible = false;
        }
      }
      else {
        commandAddFolders.visible = false;
      }
    }

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
