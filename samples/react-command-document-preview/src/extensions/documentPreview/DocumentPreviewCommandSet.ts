import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import PreviewPanel from './PreviewPanel';
import { fileTypes, imageTypes, videoTypes, officeFileTypes, otherFileTypes } from './common';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IDocumentPreviewCommandSetProperties {

}

export interface IFileProps {
  FileName?: string;
  FileURL?: string;
  FileType?: string;
  IsFile?: boolean;
  ID?: string;
  UniqueID?: any;
  ValidFileType?: boolean;
}

const LOG_SOURCE: string = 'DocumentPreviewCommandSet';

export default class DocumentPreviewCommandSet extends BaseListViewCommandSet<IDocumentPreviewCommandSetProperties> {
  private fileInfo: IFileProps = {};

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized DocumentPreviewCommandSet');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    let showCommand: boolean = false;
    if (event.selectedRows.length > 0) {
      this.fileInfo = {
        FileType: event.selectedRows[0].getValueByName('File_x0020_Type'),
        IsFile: event.selectedRows[0].getValueByName('FSObjType') == "0",
        ID: event.selectedRows[0].getValueByName('ID'),
        UniqueID: event.selectedRows[0].getValueByName('UniqueId'),
        FileName: event.selectedRows[0].getValueByName('FileLeafRef'),
        FileURL: event.selectedRows[0].getValueByName('FileRef')
      };
      this.fileInfo.ValidFileType = fileTypes.filter((element, index, array) => { return element.toLocaleLowerCase() === this.fileInfo.FileType.toLocaleLowerCase(); }).length > 0;
      if (event.selectedRows.length === 1 && this.fileInfo.ValidFileType && this.fileInfo.IsFile) showCommand = true;
    }
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = showCommand;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_1':
        let finalUrl: string = "";
        if (imageTypes.filter((element, index, array) => { return element.toLocaleLowerCase() == this.fileInfo.FileType.toLocaleLowerCase(); }).length > 0)
          finalUrl = this.fileInfo.FileURL;
        else if (videoTypes.filter((element, index, array) => { return element.toLocaleLowerCase() == this.fileInfo.FileType.toLocaleLowerCase(); }).length > 0)
          finalUrl = `${window.location.origin + this.context.pageContext.legacyPageContext.webServerRelativeUrl}/_layouts/15/embed.aspx?UniqueId=${this.fileInfo.UniqueID}&client_id=FileViewerWebPart&embed={"af":false,"id":"${this.fileInfo.ID}","o":"${window.location.origin}","p":1,"z":"width"}`;
        else if (officeFileTypes.filter((element, index, array) => { return element.toLocaleLowerCase() == this.fileInfo.FileType.toLocaleLowerCase(); }).length > 0)
          finalUrl = `${window.location.origin}/:w:/r${this.context.pageContext.legacyPageContext.webServerRelativeUrl}/_layouts/15/Doc.aspx?sourcedoc=${this.fileInfo.UniqueID}&file=${encodeURI(this.fileInfo.FileName)}&action=default&mobileredirect=true`;
        else if (otherFileTypes.filter((element, index, array) => { return element.toLocaleLowerCase() == this.fileInfo.FileType.toLocaleLowerCase(); }).length > 0)
          finalUrl = this.fileInfo.FileURL;
        const dialog: PreviewPanel = new PreviewPanel();
        dialog.filename = this.fileInfo.FileName;
        dialog.filetype = this.fileInfo.FileType;
        dialog.url = finalUrl;
        dialog.show();
        break;
      default:
        throw new Error('Unknown command');
    }
  }
}
