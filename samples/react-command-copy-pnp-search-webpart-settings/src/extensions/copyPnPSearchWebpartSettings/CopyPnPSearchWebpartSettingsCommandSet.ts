import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import { SPPermission } from '@microsoft/sp-page-context';
import * as strings from 'CopyPnPSearchWebpartSettingsCommandSetStrings';
import WorkerDialog from './components/WorkerDialog';
import { getThemeColor } from './themeHelper';
import { sp } from "@pnp/sp";


/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICopyPnPSearchWebpartSettingsCommandSetProperties {
}

const LOG_SOURCE: string = 'CopyPnPSearchWebpartSettingsCommandSet';

export default class CopyPnPSearchWebpartSettingsCommandSet extends BaseListViewCommandSet<ICopyPnPSearchWebpartSettingsCommandSetProperties> {

  private dialogContainer: HTMLDivElement = null;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized CopyPnPSearchWebpartSettingsCommandSet');
    this.dialogContainer = document.body.appendChild(document.createElement("div"));
    sp.setup({
      spfxContext: this.context
    });
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {

    const hasPermission = this.context.pageContext.list.permissions.hasPermission(SPPermission.editListItems);

    const copySettingsCommand: Command = this.tryGetCommand('COPY_SETTINGS');
    const fillColor = getThemeColor("themeDarkAlt").replace('#', '%23');
    const copySettingsSvg = `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 115.77 122.88' fill='${fillColor}' style='enable-background:new 0 0 115.77 122.88' xml:space='preserve'%3E%3Cstyle type='text/css'%3E.st0%7Bfill-rule:evenodd;clip-rule:evenodd;%7D%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z'/%3E%3C/g%3E%3C/svg%3E`;
    copySettingsCommand.iconImageUrl = copySettingsSvg;

    if (copySettingsCommand) {
      copySettingsCommand.visible = event.selectedRows.length > 0 && hasPermission;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    let fileRefs: string[] = event.selectedRows.map(i => i.getValueByName("FileRef"));
    let folderUrl: string = fileRefs[0].substring(0, fileRefs[0].lastIndexOf('/')) + '/'; 

    switch (event.itemId) {
      case 'COPY_SETTINGS':
        this.renderDialog(false, fileRefs, folderUrl);
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private closeDialog = () => {
    this.renderDialog(true, [], null);
  }

  private renderDialog(hidden: boolean, fileRefs: string[], folderUrl: string) {
    const element: React.ReactElement<any> = React.createElement(
      WorkerDialog,
      {
        hidden: hidden,
        fileRefs: fileRefs,
        folderUrl: folderUrl,
        siteUrl: this.context.pageContext.site.absoluteUrl,
        close: this.closeDialog
      }
    );

    ReactDOM.render(element, this.dialogContainer);
  }
}
