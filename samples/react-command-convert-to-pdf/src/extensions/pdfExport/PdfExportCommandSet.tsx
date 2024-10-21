import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import { BaseListViewCommandSet, IListViewCommandSetExecuteEventParameters, IListViewCommandSetListViewUpdatedParameters } from '@microsoft/sp-listview-extensibility';
import { SPPermission } from '@microsoft/sp-page-context';
import { AadHttpClient } from '@microsoft/sp-http';
import { saveAs } from 'file-saver';
import WaitDialog from './WaitDialog';
import * as strings from 'PdfExportCommandSetStrings';

export interface IPdfExportCommandSetProperties { }

const LOG_SOURCE: string = 'PdfExportCommandSet';
const GRAPH_API_BASE: string = 'https://graph.microsoft.com/v1.0';

export default class PdfExportCommandSet extends BaseListViewCommandSet<IPdfExportCommandSetProperties> {
  private aadHttpClient!: AadHttpClient;
  private readonly supportedFileTypes = new Set(['doc','docx', 'xlsx', 'pptx', 'csv', 'rtf']);

  @override
  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized PdfExportCommandSet');
    this.aadHttpClient = await this.context.aadHttpClientFactory.getClient('https://graph.microsoft.com');
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    this.toggleCommandVisibility(event, 'EXPORT');
    this.toggleCommandVisibility(event, 'SAVE_AS');
  }

  // Toggle visibility for export and save-as commands
  private toggleCommandVisibility(event: IListViewCommandSetListViewUpdatedParameters, commandName: string): void {
    const command = this.tryGetCommand(commandName);
    if (command) {
      const hasPermission = this.context.pageContext.web.permissions.hasPermission(SPPermission.addListItems);
      command.visible = event.selectedRows.length === 1 && hasPermission;
    }
  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    const siteId = this.context.pageContext.site.id;
    const selectedItem = event.selectedRows[0];
    const fileName = selectedItem.getValueByName('FileLeafRef');
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    // Extract the drive item path
    const spItemUrl = selectedItem.getValueByName('.spItemUrl');
    const driveItemPath = this.extractDriveItemPath(spItemUrl);

    if (!driveItemPath) {
      this.handleError(new Error('No match found in URL'), 'Invalid URL for selected item.');
      return;
    }

    // Validate file extension
    if (!fileExtension || !this.supportedFileTypes.has(fileExtension)) {
      Log.warn(LOG_SOURCE, `Unsupported file type: ${fileName}`);
      this.handleError(new Error('Unsupported file type'), 'This file type cannot be converted to PDF.');
      return;
    }
    else {

      try {
        if (event.itemId === 'EXPORT') {
          await this.handlePdfConversion(siteId, driveItemPath, fileName, true);  // Download PDF
        } else if (event.itemId === 'SAVE_AS') {
          const pdfBlob = await this.handlePdfConversion(siteId, driveItemPath, fileName, false);  // Get PDF blob
          if (pdfBlob) {
            await this.uploadPdfToLibrary(driveItemPath, this.removeFileExtension(fileName) + '.pdf', pdfBlob);
            window.location.reload();
          }
        }
      } catch (error) {
        this.handleError(error, 'An unexpected error occurred.');
      }
    }
  }

  // Extract drive and item part of the URL
  private extractDriveItemPath(spItemUrl: string): string | null {
    const match = spItemUrl.match(/drives\/[^\/]+\/items\/[^\/?]+/);
    return match ? match[0] : null;
  }

  // Handle PDF conversion: returns Blob or directly downloads PDF
  private async handlePdfConversion(siteId: any, drivePath: string, fileName: string, download: boolean): Promise<Blob | null> {
    WaitDialog.show(strings.DownloadAsPdf, strings.GeneratingFiles);

    try {
      const pdfUrl = `${GRAPH_API_BASE}/sites/${siteId}/${drivePath}/content?format=pdf`;
      const pdfBlob = await this.fetchPdfBlob(pdfUrl);

      if (download) {
        const fileNameWithoutExtension = this.removeFileExtension(fileName);
        saveAs(pdfBlob, `${fileNameWithoutExtension}.pdf`);
        WaitDialog.close();
        return null;  // Return null when downloading
      } else {
        return pdfBlob;  // Return Blob when saving to library
      }
    } catch (error) {
      this.handleError(error, 'Error converting document to PDF.');
      return null;
    }
  }

  // Upload PDF to document library
  private async uploadPdfToLibrary(drivePath: string, fileName: string, pdfBlob: Blob): Promise<void> {
    const pathSegments = drivePath.split('/');
    const driveId = pathSegments[1];
    const uploadUrl = `${GRAPH_API_BASE}/drives/${driveId}/root:/${fileName}:/content`;

    try {
      const response = await this.aadHttpClient.fetch(uploadUrl, AadHttpClient.configurations.v1, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: pdfBlob,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF to the document library.');
      }

      WaitDialog.close();
      Log.info(LOG_SOURCE, 'PDF successfully uploaded to the document library.');
    } catch (error) {
      this.handleError(error, 'Failed to upload PDF to the document library.');
    }
  }

  // Fetch the PDF blob using the constructed URL
  private async fetchPdfBlob(pdfUrl: string): Promise<Blob> {
    const response = await this.aadHttpClient.get(pdfUrl, AadHttpClient.configurations.v1);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from ${pdfUrl}`);
    }

    return await response.blob();
  }

  // Remove file extension
  private removeFileExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '');  // This regex removes the file extension
  }

  // Unified error handling and logging
  private handleError(error: unknown, userMessage: string): void {
    Log.error(LOG_SOURCE, error instanceof Error ? error : new Error('Unknown error'));
    WaitDialog.showError(strings.Error, error instanceof Error ? error.message : userMessage);
  }
}
