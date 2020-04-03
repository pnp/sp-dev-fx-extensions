import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import { AadHttpClient } from '@microsoft/sp-http';

import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters
} from '@microsoft/sp-listview-extensibility';
import DocumentGenerator from '../../DocumentGenerator';
import { sp, Web } from "@pnp/sp";
import ProcessingDialog from './ProcessingDialog';
import ProcessingProgressDialog from './ProcessingProgressDialog';
import { SPPermission } from '@microsoft/sp-page-context';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */

export interface IGenerateDocumentsCommandSetProperties {
  azureFunctionBaseUrl: string;
  azureFunctionGenerateDocumentMethod: string;
  azureFunctionGetPDFPreviewUrlMethod: string;
  templateServerRelativeUrl: string;
  temporaryFolderServerRelativeUrl: string;
  webServerRelativeUrl: string;
  destinationFolderServerRelativeUrl: string;
  saveAsFormat: string;
  taskListId: string;

}

const LOG_SOURCE: string = 'GenerateDocumentsCommandSet';

export default class GenerateDocumentsCommandSet extends BaseListViewCommandSet<IGenerateDocumentsCommandSetProperties> {
  private web: Web;
  private aadHttpClient: AadHttpClient;
  @override
  public onInit(): Promise<void> {
  
    Log.info(LOG_SOURCE, 'Initialized GenerateDocumentsCommandSet');
    return super.onInit().then(_ => {
      sp.setup({
        spfxContext: this.context
      });
       return this.context.aadHttpClientFactory
        .getClient(this.properties.azureFunctionBaseUrl)
        .then((client: AadHttpClient): void => {
          this.aadHttpClient = client;
          });
    });
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {

    let currentPermission = this.context.pageContext.web.permissions;
    const generatePDFCommand: Command = this.tryGetCommand('COMMAND_GENERATE_PDF');
    if (generatePDFCommand) {
      // This command should be shown only to people with manage list permission on the selected list when one item is selected
      generatePDFCommand.visible = event.selectedRows.length === 1
        && this.context.pageContext.list.id.toString() === this.properties.taskListId
        && currentPermission.hasPermission(SPPermission.manageLists);
    }
    const generateDOCXCommand: Command = this.tryGetCommand('COMMAND_GENERATE_DOCX');
    if (generatePDFCommand) {
      // This command should be shown only to people with manage list permission on the selected list when one item is selected
      generateDOCXCommand.visible = this.context.pageContext.list.id.toString() === this.properties.taskListId
        && currentPermission.hasPermission(SPPermission.manageLists);
    }
    const PreViewPDFCommand: Command = this.tryGetCommand('COMMAND_PREVIEW_PDF');
    if (PreViewPDFCommand) {
      PreViewPDFCommand.visible = event.selectedRows.length === 1
        && this.context.pageContext.list.id.toString() === this.properties.taskListId
        && currentPermission.hasPermission(SPPermission.manageLists);
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    var id: number = event.selectedRows[0].getValueByName("ID");
    var reportType: string = event.selectedRows[0].getValueByName("ReportType");
    switch (event.itemId) {
      case 'COMMAND_GENERATE_PDF':
        this.generatePDF(event.selectedRows[0].getValueByName("ID"));
        break;
      case 'COMMAND_GENERATE_DOCX':
        this.generateDocx(event);
        break;
      case 'COMMAND_PREVIEW_PDF':
        this.previewPDF(id);
        break;

      default:
        throw new Error('Unknown command');
    }
  }

  private previewPDF(id: number) {
    const dialog: ProcessingDialog = new ProcessingDialog();
    dialog.title = "Generating pdf Preview";
    dialog.message = "Please wait while your temporary pdf is being generated. It will open in a new window once it's ready";
    dialog.Process = async (): Promise<void> => {
      var pdfUrl = await DocumentGenerator.PreviewPDF(this.aadHttpClient, sp.web, this.context.pageContext.list.id, id, this.properties.azureFunctionBaseUrl + "/api/" + this.properties.azureFunctionGetPDFPreviewUrlMethod, this.properties.templateServerRelativeUrl, this.properties.destinationFolderServerRelativeUrl, this.properties.temporaryFolderServerRelativeUrl, this.properties.webServerRelativeUrl, this.properties.saveAsFormat);
      if (pdfUrl != null){
      window.open(pdfUrl, "_blank");
      }
      dialog.close();
      return;
    };
    dialog.show();
  }

  private generateDocx(event: IListViewCommandSetExecuteEventParameters) {
    const dialogGenDocx: ProcessingProgressDialog = new ProcessingProgressDialog();
    dialogGenDocx.title = "Creating Documents";
    dialogGenDocx.message = "Please wait while your Files are being generated and published.";
    dialogGenDocx.totDocs = event.selectedRows.length;
    dialogGenDocx.Process = async (): Promise<void> => {
      var promises: Promise<any>[] = [];
      for (var selectedRow of event.selectedRows) {
        var rowId = selectedRow.getValueByName("ID");
        // dont just await, generate the docs in paralell, should spin up new azure functions as needed!
        promises.push(DocumentGenerator.generateDocument(this.aadHttpClient, sp.web, this.context.pageContext.list.id, rowId, this.properties.azureFunctionBaseUrl + "/api/" + this.properties.azureFunctionGenerateDocumentMethod, this.properties.templateServerRelativeUrl, this.properties.destinationFolderServerRelativeUrl, this.properties.temporaryFolderServerRelativeUrl, this.properties.webServerRelativeUrl, "DOCX")
          .then(() => {
            dialogGenDocx.component.incrementCount();
          })
          .catch((err) => {
            debugger;
            alert(err);
          }));
      }
      Promise.all(promises).then(()=>{
        dialogGenDocx.close();
      }).catch((err)=>{
        alert(`an error occurred generating thse documents`);
      });
      
      return;
    };
    dialogGenDocx.show();
  }

  private generatePDF(id: number) {
    var destinationFolderServerRelativeURL = this.properties.destinationFolderServerRelativeUrl;
    var siteServerRelativeUrl = this.context.pageContext.site.serverRelativeUrl;
    const dialogGenPdf: ProcessingDialog = new ProcessingDialog();
    dialogGenPdf.title = "Publishing new  pdf";
    dialogGenPdf.message = "Please wait while your pdf is being generated and published. It will open in a new window once it's ready";
    dialogGenPdf.Process = async (): Promise<void> => {
      var fileUrl = await DocumentGenerator.generateDocument(this.aadHttpClient, sp.web, this.context.pageContext.list.id, id, this.properties.azureFunctionBaseUrl + "/api/" + this.properties.azureFunctionGenerateDocumentMethod, this.properties.templateServerRelativeUrl, destinationFolderServerRelativeURL, this.properties.temporaryFolderServerRelativeUrl, this.properties.webServerRelativeUrl, "PDF");
      if (fileUrl !== null){
        window.open(fileUrl, "_blank");
      }
      dialogGenPdf.close();
      return;
    };
    dialogGenPdf.show();
    return siteServerRelativeUrl;
  }
}
