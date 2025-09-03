import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import { BaseListViewCommandSet, IListViewCommandSetExecuteEventParameters, IListViewCommandSetListViewUpdatedParameters } from '@microsoft/sp-listview-extensibility';
import { SPPermission } from '@microsoft/sp-page-context';
import { AadHttpClient } from '@microsoft/sp-http';
import { saveAs } from 'file-saver';
import WaitDialog from './WaitDialog';
import ProgressDialog from './ProgressDialog';
import * as strings from 'PdfExportCommandSetStrings';
import JSZip from 'jszip';
import { RowAccessor } from '@microsoft/sp-listview-extensibility';

export interface IPdfExportCommandSetProperties { }

interface IBatchConversionResult {
  fileName: string;
  success: boolean;
  error?: string;
  pdfBlob?: Blob;
}


const LOG_SOURCE: string = 'PdfExportCommandSet';
const GRAPH_API_BASE: string = 'https://graph.microsoft.com/v1.0';

export default class PdfExportCommandSet extends BaseListViewCommandSet<IPdfExportCommandSetProperties> {
  private aadHttpClient!: AadHttpClient;
  private readonly supportedFileTypes = new Set([
    'csv', 'doc', 'docx', 'odp', 'ods', 'odt', 'pot', 'potm', 'potx', 
    'pps', 'ppsx', 'ppsm', 'ppt', 'pptm', 'pptx', 'rtf', 'xls', 'xlsx', 'html'
  ]);
  
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
      const selectedCount = event.selectedRows.length;
      
      // Allow single or multiple selections for both commands
      command.visible = selectedCount >= 1 && hasPermission;
      
      // Update command titles based on selection count
      if (selectedCount > 1) {
        if (commandName === 'EXPORT') {
          command.title = strings.DownloadMultipleAsPdf.replace('{0}', selectedCount.toString());
        } else if (commandName === 'SAVE_AS') {
          command.title = strings.ConvertMultipleToPdf.replace('{0}', selectedCount.toString());
        }
      } else {
        if (commandName === 'EXPORT') {
          command.title = strings.DownloadAsPdf;
        } else if (commandName === 'SAVE_AS') {
          command.title = strings.SaveAsPdf;
        }
      }
    }
  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    const siteId = this.context.pageContext.site.id;
    const selectedItems = event.selectedRows;

    // Validate all selected files
    const validItems = this.validateSelectedItems(selectedItems);
    if (validItems.length === 0) {
      this.handleError(new Error('No valid files selected'), strings.NoValidFiles);
      return;
    }

    if (validItems.length < selectedItems.length) {
      const skippedCount = selectedItems.length - validItems.length;
      Log.warn(LOG_SOURCE, `${skippedCount} files skipped due to unsupported format`);
    }

    try {
      if (event.itemId === 'EXPORT') {
        await this.handleBatchDownload(siteId, validItems);
      } else if (event.itemId === 'SAVE_AS') {
        await this.handleBatchSaveAs(siteId, validItems);
      }
    } catch (error) {
      this.handleError(error, strings.OperationFailed);
    }
  }

  // Validate selected items and return only supported files
  private validateSelectedItems(selectedItems: readonly RowAccessor[]): RowAccessor[] {
    return selectedItems.filter(item => {
      const fileName = item.getValueByName('FileLeafRef');
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const spItemUrl = item.getValueByName('.spItemUrl');
      const driveItemPath = this.extractDriveItemPath(spItemUrl);
      
      return fileExtension && 
             this.supportedFileTypes.has(fileExtension) && 
             driveItemPath;
    });
  }

  // Extract drive and item part of the URL
  private extractDriveItemPath(spItemUrl: string): string | null {
    const match = spItemUrl.match(/drives\/[^\/]+\/items\/[^\/?]+/);
    return match ? match[0] : null;
  }

  // Handle batch download operation
  private async handleBatchDownload(siteId: any, selectedItems: RowAccessor[]): Promise<void> {
    if (selectedItems.length === 1) {
      // Single file - use existing logic
      const item = selectedItems[0];
      const fileName = item.getValueByName('FileLeafRef');
      const spItemUrl = item.getValueByName('.spItemUrl');
      const driveItemPath = this.extractDriveItemPath(spItemUrl);
      
      if (driveItemPath) {
        await this.handlePdfConversion(siteId, driveItemPath, fileName, true);
      }
      return;
    }

    // Multiple files - batch processing
    ProgressDialog.show(strings.Processing, strings.GeneratingFiles, selectedItems.length);
    
    const results: IBatchConversionResult[] = [];
    
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      const fileName = item.getValueByName('FileLeafRef');
      const spItemUrl = item.getValueByName('.spItemUrl');
      const driveItemPath = this.extractDriveItemPath(spItemUrl);
      
      ProgressDialog.updateProgress(i + 1, selectedItems.length, fileName, 'processing');
      
      try {
        if (driveItemPath) {
          const pdfBlob = await this.handlePdfConversion(siteId, driveItemPath, fileName, false);
          if (pdfBlob) {
            results.push({
              fileName: this.removeFileExtension(fileName) + '.pdf',
              success: true,
              pdfBlob
            });
            ProgressDialog.updateProgress(i + 1, selectedItems.length, fileName, 'completed');
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        Log.error(LOG_SOURCE, new Error(errorMessage));
        results.push({
          fileName: fileName,
          success: false,
          error: errorMessage
        });
        ProgressDialog.updateProgress(i + 1, selectedItems.length, fileName, 'error');
      }
      
      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    ProgressDialog.close();
    
    // Create and download ZIP file
    await this.createAndDownloadZip(results);
  }

  // Handle batch save-as operation
  private async handleBatchSaveAs(siteId: any, selectedItems: RowAccessor[]): Promise<void> {
    if (selectedItems.length === 1) {
      // Single file - use existing logic
      const item = selectedItems[0];
      const fileName = item.getValueByName('FileLeafRef');
      const spItemUrl = item.getValueByName('.spItemUrl');
      const driveItemPath = this.extractDriveItemPath(spItemUrl);
      
      if (driveItemPath) {
        const pdfBlob = await this.handlePdfConversion(siteId, driveItemPath, fileName, false);
        if (pdfBlob) {
          await this.uploadPdfToLibrary(driveItemPath, this.removeFileExtension(fileName) + '.pdf', pdfBlob);
          window.location.reload();
        }
      }
      return;
    }

    // Multiple files - batch processing
    ProgressDialog.show(strings.Processing, strings.GeneratingFiles, selectedItems.length);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      const fileName = item.getValueByName('FileLeafRef');
      const spItemUrl = item.getValueByName('.spItemUrl');
      const driveItemPath = this.extractDriveItemPath(spItemUrl);
      
      ProgressDialog.updateProgress(i + 1, selectedItems.length, fileName, 'processing');
      
      try {
        if (driveItemPath) {
          const pdfBlob = await this.handlePdfConversion(siteId, driveItemPath, fileName, false);
          if (pdfBlob) {
            const pdfFileName = this.removeFileExtension(fileName) + '.pdf';
            await this.uploadPdfToLibrary(driveItemPath, pdfFileName, pdfBlob);
            successCount++;
            ProgressDialog.updateProgress(i + 1, selectedItems.length, fileName, 'completed');
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        Log.error(LOG_SOURCE, new Error(errorMessage));
        errorCount++;
        ProgressDialog.updateProgress(i + 1, selectedItems.length, fileName, 'error');
      }
      
      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    ProgressDialog.close();
    
    // Show summary
    const summaryMessage = strings.BatchConversionComplete
      .replace('{0}', successCount.toString())
      .replace('{1}', errorCount.toString());
    
    WaitDialog.show(strings.BatchConversionSummary, summaryMessage);
    
    // Refresh the page after a short delay
    setTimeout(() => {
      WaitDialog.close();
      window.location.reload();
    }, 3000);
  }

  // Create ZIP file and download
  private async createAndDownloadZip(results: IBatchConversionResult[]): Promise<void> {
    const zip = new JSZip();
    let hasValidFiles = false;
    
    for (const result of results) {
      if (result.success && result.pdfBlob) {
        zip.file(result.fileName, result.pdfBlob);
        hasValidFiles = true;
      }
    }
    
    if (!hasValidFiles) {
      this.handleError(new Error('No files were successfully converted'), strings.NoFilesConverted);
      return;
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    saveAs(zipBlob, `PDFs_${timestamp}.zip`);
    
    // Show summary of results
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    if (errorCount > 0) {
      const summaryMessage = strings.BatchDownloadComplete
        .replace('{0}', successCount.toString())
        .replace('{1}', errorCount.toString());
      WaitDialog.show(strings.BatchDownloadSummary, summaryMessage);
    }
  }

  // Handle PDF conversion: returns Blob or directly downloads PDF
  private async handlePdfConversion(siteId: any, drivePath: string, fileName: string, download: boolean): Promise<Blob | null> {
    WaitDialog.show(strings.DownloadAsPdf, strings.GeneratingFiles);
    WaitDialog.updateProgress(10, fileName, 'Estimated time: ~30 seconds');

    try {
      WaitDialog.updateProgress(25, fileName, 'Estimated time: ~20 seconds');
      const pdfUrl = `${GRAPH_API_BASE}/sites/${siteId}/${drivePath}/content?format=pdf`;
      WaitDialog.updateProgress(50, fileName, 'Estimated time: ~15 seconds');
      const pdfBlob = await this.fetchPdfBlob(pdfUrl);
      WaitDialog.updateProgress(85, fileName, 'Estimated time: ~5 seconds');

      if (download) {
        const fileNameWithoutExtension = this.removeFileExtension(fileName);
        WaitDialog.updateProgress(95, fileName, 'Estimated time: ~2 seconds');
        saveAs(pdfBlob, `${fileNameWithoutExtension}.pdf`);
        WaitDialog.updateProgress(100, fileName, 'Completed!');
        setTimeout(() => WaitDialog.close(), 1000);
        return null;  // Return null when downloading
      } else {
        WaitDialog.updateProgress(100, fileName, 'Completed!');
        setTimeout(() => WaitDialog.close(), 500);
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
