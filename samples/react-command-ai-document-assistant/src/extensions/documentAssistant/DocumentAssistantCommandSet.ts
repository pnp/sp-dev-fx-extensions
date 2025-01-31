import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  IListViewCommandSetListViewUpdatedParameters,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';

import { ExtensionContext } from "@microsoft/sp-extension-base";
import { IDocumentChatProps } from './interfaces/IDocumentChat';
import * as React from "react";
import * as ReactDom from "react-dom";
import { DocumentChatPanel } from './components/DocumentChatPanel';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IDocumentAssitantCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = 'DocumentAssitantCommandSet';
const ALLOWED_EXTENSIONS: string[] = ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "pdf"];

export default class DocumentAssitantCommandSet extends BaseListViewCommandSet<IDocumentAssitantCommandSetProperties> {
  //private appDialog: AppBaseDialog;
  private _panelPlaceHolder: HTMLDivElement;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized DocumentAssitantCommandSet');
    this._panelPlaceHolder = document.body.appendChild(
      document.createElement("div")
    );
    // initial state of the command's visibility
    const compareOneCommand: Command = this.tryGetCommand('DOCUMENT_ASSISTANT');
    compareOneCommand.visible = false;

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    return Promise.resolve();
  }


  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const convertToPdfCommand: Command = this.tryGetCommand('DOCUMENT_ASSISTANT');
    if (convertToPdfCommand) {
      convertToPdfCommand.visible = event.selectedRows.length >= 1;
    }
  }


  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    switch (event.itemId) {
      case "DOCUMENT_ASSISTANT": {

        const siteUrl: string = this.context.pageContext.web.absoluteUrl;
        const listName: string = this.context.pageContext.list?.serverRelativeUrl?.split("/").pop() ?? '';

        let cannotConvert: boolean = false;
        let fileExtensionNotAllowed: string = "";
        // Get the selected row
        if (event.selectedRows.length === 1) {
          const selectedRow = this.context.listView.selectedRows?.[0];
          const spItemUrl: string = selectedRow?.getValueByName('.spItemUrl');
          const fileName: string = selectedRow?.getValueByName('FileLeafRef');
          const currentUser = this.context.pageContext.user.email;
          const fileIcon = this.context.pageContext.site.absoluteUrl +
            "/_layouts/15/images/" +
            selectedRow?.getValueByName(
              "HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"
            );          
          // Split the URL to remove query parameters and then split by '/'
          const urlParts = spItemUrl.split('?')[0].split('/');
          // Extract driveId and itemId
          const driveId = urlParts[urlParts.indexOf('drives') + 1];
          const itemId = urlParts[urlParts.indexOf('items') + 1];

          const fileExtension: string = fileName.split('.').pop() || '';
          if (ALLOWED_EXTENSIONS.indexOf(fileExtension) < 0) {
            cannotConvert = true;
            fileExtensionNotAllowed = fileExtension;
            break;
          }

          console.log(fileExtensionNotAllowed);
          if (cannotConvert === false) {

            const chatProps: IDocumentChatProps = {

              context: this.context as ExtensionContext,
              isOpen: true,
              siteUrl: siteUrl,
              listName: listName,
              driveId: driveId,
              itemId: itemId,
              fileName: fileName,
              currentUser: currentUser,
              fileIcon: fileIcon

            } as IDocumentChatProps;           
            
            this._renderPanelComponent(chatProps);


            
          }         

        }        
        break;
      }

      
      default:
        throw new Error('Unknown command');
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const compareOneCommand: Command = this.tryGetCommand('DOCUMENT_ASSISTANT');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = this.context.listView.selectedRows?.length === 1;
    }

    // TODO: Add your logic here

    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
  }



  private _renderPanelComponent = (props: IDocumentChatProps): void => {
    const element: React.ReactElement<IDocumentChatProps> =
      React.createElement(DocumentChatPanel, props);
  // eslint-disable-next-line @microsoft/spfx/pair-react-dom-render-unmount
  ReactDom.render(element, this._panelPlaceHolder);
  }





}
