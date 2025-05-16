import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import { 
  BaseListViewCommandSet, 
  IListViewCommandSetExecuteEventParameters, 
  IListViewCommandSetListViewUpdatedParameters 
} from '@microsoft/sp-listview-extensibility';
import { SPPermission } from '@microsoft/sp-page-context';
import { AadHttpClient, SPHttpClient } from '@microsoft/sp-http';
import { saveAs } from 'file-saver';
import WaitDialog from './WaitDialog';
import * as strings from 'PdfExportCommandSetStrings';
import PdfOptionsDialog, { IPdfOptions } from './PdfOptionsDialog';
import { getRandomString } from "@pnp/core";

export interface IPdfExportCommandSetProperties {
}

const LOG_SOURCE: string = 'PdfExportCommandSet';
const GRAPH_API_BASE: string = 'https://graph.microsoft.com/v1.0';

// Local storage keys
const METADATA_PREFERENCE_KEY = 'pdfExport_metadataPreference';
const EMAIL_FORMAT_PREFERENCE_KEY = 'pdfExport_emailFormatPreference';
const EMAIL_BODY_PREFERENCE_KEY = 'pdfExport_emailBodyPreference';
const CUSTOM_FILENAME_PREFERENCE_KEY = 'pdfExport_customFilenamePreference';
const FILENAME_PATTERN_PREFERENCE_KEY = 'pdfExport_filenamePatternPreference';

export default class PdfExportCommandSet extends BaseListViewCommandSet<IPdfExportCommandSetProperties> {
  private aadHttpClient!: AadHttpClient;
  private readonly supportedFileTypes = new Set(['doc', 'docx', 'xlsx', 'pptx', 'csv', 'rtf', 'txt', 'pdf']);
  
  // Batch processing state
  private batchItems: any[] = [];
  private batchProcessingIndex: number = 0;
  private batchTotal: number = 0;
  private successCount: number = 0;
  private failureCount: number = 0;
  private failedItems: string[] = [];
  
  // Flag to track Graph API availability
  private graphApiAvailable: boolean = true;

  @override
  public async onInit(): Promise<void> {
    try {
      Log.info(LOG_SOURCE, 'Starting initialization...');
      console.log(`${LOG_SOURCE}: Starting initialization...`);
      
      // Initialize the AAD HTTP client for Graph API access
      try {
        console.log(`${LOG_SOURCE}: Attempting to get AadHttpClient...`);
        this.aadHttpClient = await this.context.aadHttpClientFactory.getClient('https://graph.microsoft.com');
        console.log(`${LOG_SOURCE}: AadHttpClient acquired successfully`);
        this.graphApiAvailable = true;
      } catch (graphError) {
        console.error(`${LOG_SOURCE}: Failed to acquire AadHttpClient`, graphError);
        Log.error(LOG_SOURCE, new Error(`Failed to initialize Graph client: ${graphError}`));
        this.graphApiAvailable = false;
      }
      
      Log.info(LOG_SOURCE, 'Initialized PdfExportCommandSet');
    } catch (error) {
      console.error(`${LOG_SOURCE}: Error during initialization`, error);
      Log.error(LOG_SOURCE, new Error(`Initialization error: ${error}`));
    }
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    try {
      console.log(`${LOG_SOURCE}: onListViewUpdated called with ${event.selectedRows.length} selected rows`);
      const selectedCount = event.selectedRows.length;
      
      // Toggle command visibility based on selection count
      this.toggleCommandVisibility(event, 'EXPORT', selectedCount === 1);
      this.toggleCommandVisibility(event, 'SAVE_AS', selectedCount === 1);
      this.toggleCommandVisibility(event, 'SEND_AS', selectedCount > 0);
      
      console.log(`${LOG_SOURCE}: onListViewUpdated completed successfully`);
    } catch (error) {
      console.error(`${LOG_SOURCE}: Error in onListViewUpdated`, error);
      Log.error(LOG_SOURCE, new Error(`onListViewUpdated error: ${error}`));
      // Attempt to recover by explicitly setting command visibility
      try {
        const exportCommand = this.tryGetCommand('EXPORT');
        const saveAsCommand = this.tryGetCommand('SAVE_AS');
        const sendAsCommand = this.tryGetCommand('SEND_AS');
        if (exportCommand) exportCommand.visible = event.selectedRows.length === 1;
        if (saveAsCommand) saveAsCommand.visible = event.selectedRows.length === 1;
        if (sendAsCommand) sendAsCommand.visible = event.selectedRows.length > 0;
      } catch (recoveryError) {
        console.error(`${LOG_SOURCE}: Failed to recover from error`, recoveryError);
      }
    }
  }

  private toggleCommandVisibility(
    _event: IListViewCommandSetListViewUpdatedParameters, 
    commandName: string, 
    hasSelection: boolean
  ): void {
    try {
      console.log(`${LOG_SOURCE}: toggleCommandVisibility for ${commandName}, hasSelection=${hasSelection}`);
      const command = this.tryGetCommand(commandName);
      if (!command) {
        console.error(`${LOG_SOURCE}: Command ${commandName} not found`);
        return;
      }
      
      const hasPermission = this.context.pageContext.web.permissions.hasPermission(SPPermission.addListItems);
      console.log(`${LOG_SOURCE}: User has addListItems permission: ${hasPermission}`);
      
      // (Optional) File type checks can be added here
      command.visible = hasSelection && hasPermission;
      console.log(`${LOG_SOURCE}: ${commandName} command visibility set to ${command.visible}`);
    } catch (error) {
      console.error(`${LOG_SOURCE}: Error in toggleCommandVisibility for ${commandName}`, error);
      Log.error(LOG_SOURCE, new Error(`toggleCommandVisibility error: ${error}`));
    }
  }
  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    try {
      console.log(`${LOG_SOURCE}: onExecute called with itemId=${event.itemId}`);
      // Initialize batch state
      this.batchItems = [...event.selectedRows];
      this.batchTotal = this.batchItems.length;
      this.batchProcessingIndex = 0;
      this.successCount = 0;
      this.failureCount = 0;
      this.failedItems = [];

      if (this.batchTotal === 0) {
        this.handleError(new Error(strings.NoItemsSelected), strings.NoItemsSelected);
        return;
      }

      // Load user preferences
      const savedPreserveMetadata = localStorage.getItem(METADATA_PREFERENCE_KEY) === 'true';
      const savedEmailBodyFormat = localStorage.getItem(EMAIL_FORMAT_PREFERENCE_KEY) || 'html';
      const savedCustomFilenamePreference = localStorage.getItem(CUSTOM_FILENAME_PREFERENCE_KEY) === 'true';
      const savedFilenamePattern = localStorage.getItem(FILENAME_PATTERN_PREFERENCE_KEY) || '{filename}';
      const savedEmailBody = localStorage.getItem(EMAIL_BODY_PREFERENCE_KEY) || '';
      
      switch (event.itemId) {
        case 'EXPORT': // Download as PDF
          await this.handleDownloadCommand();
          break;
        case 'SAVE_AS': // Convert to PDF and save
          await this.handleConvertCommand();
          break;
        case 'SEND_AS': // Send PDF as Email
          PdfOptionsDialog.show({
            preserveMetadata: savedPreserveMetadata,
            emailAfterConversion: true,
            useCustomFilename: savedCustomFilenamePreference,
            filenamePattern: savedFilenamePattern,
            emailBodyFormat: savedEmailBodyFormat as 'text' | 'html',
            emailBody: savedEmailBody
          }, this.processBatch.bind(this));
          break;
        default:
          this.handleError(new Error(`Unknown command: ${event.itemId}`), 'Unknown command');
          break;
      }
    } catch (error) {
      console.error(`${LOG_SOURCE}: Error in onExecute`, error);
      Log.error(LOG_SOURCE, new Error(`Execute error: ${error}`));
      this.handleError(error, strings.Error);
    }
  }
  private async handleDownloadCommand(): Promise<void> {
    const { fileName, siteId, driveItemPath, fileExtension } = this.getSelectedItemData(this.batchItems[0]);
    
    if (!driveItemPath) {
      this.handleError(new Error('No match found in URL'), 'Invalid URL for selected item.');
      return;
    }
    if (!fileExtension || !this.supportedFileTypes.has(fileExtension)) {
      this.handleError(new Error('Unsupported file type'), 'This file type cannot be converted to PDF.');
      return;
    }
    
    // Show progress dialog
    WaitDialog.show(strings.DownloadAsPdf || "Download as PDF", strings.GeneratingFiles || "Generating PDF files");

    try {
      const pdfUrl = `${GRAPH_API_BASE}/sites/${siteId}/${driveItemPath}/content?format=pdf`;
      console.log(`${LOG_SOURCE}: PDF URL: ${pdfUrl}`);
      
      const response = await this.aadHttpClient.get(pdfUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from ${pdfUrl}`);
      }
      
      const pdfBlob = await response.blob();
      const fileNameWithoutExtension = this.removeFileExtension(fileName);
      saveAs(pdfBlob, `${fileNameWithoutExtension}.pdf`);
      
      WaitDialog.close();
      WaitDialog.showSuccess(strings.Success || "Success", strings.DownloadComplete || "PDF download complete");
    } catch (error) {
      console.error(`${LOG_SOURCE}: Error downloading PDF`, error);
      this.handleError(error, 'Error converting document to PDF.');
    }
  }

  private async handleConvertCommand(): Promise<void> {
    const { fileName, siteId, driveItemPath, fileExtension } = this.getSelectedItemData(this.batchItems[0]);
    
    if (!driveItemPath) {
      this.handleError(new Error('No match found in URL'), 'Invalid URL for selected item.');
      return;
    }
    if (!fileExtension || !this.supportedFileTypes.has(fileExtension)) {
      this.handleError(new Error('Unsupported file type'), 'This file type cannot be converted to PDF.');
      return;
    }
    
    WaitDialog.show(strings.ConvertToPdfTitle || "Convert to PDF", strings.GeneratingFiles || "Generating PDF files");
    
    try {
      const pdfUrl = `${GRAPH_API_BASE}/sites/${siteId}/${driveItemPath}/content?format=pdf`;
      console.log(`${LOG_SOURCE}: PDF URL: ${pdfUrl}`);
      
      const response = await this.aadHttpClient.get(pdfUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from ${pdfUrl}`);
      }
      
      const pdfBlob = await response.blob();
      // Extract driveId from the driveItemPath (assumes path format: drives/{driveId}/items/{itemId})
      const driveId = driveItemPath.split('/')[1];
      const fileNameWithoutExtension = this.removeFileExtension(fileName);
      const newPdfFileName = `${fileNameWithoutExtension}.pdf`;
      const uploadUrl = `${GRAPH_API_BASE}/drives/${driveId}/root:/${newPdfFileName}:/content`;
      
      console.log(`${LOG_SOURCE}: Upload URL: ${uploadUrl}`);
      
      const uploadResponse = await this.aadHttpClient.fetch(
        uploadUrl, 
        AadHttpClient.configurations.v1, 
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/pdf' },
          body: pdfBlob
        }
      );
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload PDF to the document library.');
      }
      
      window.location.reload();
      
      WaitDialog.close();
      WaitDialog.showSuccess(strings.Success || "Success", strings.ConversionComplete || "PDF conversion complete");
    } catch (error) {
      console.error(`${LOG_SOURCE}: Error converting PDF`, error);
      this.handleError(error, 'Error converting and saving document to PDF.');
    }
  }
  private async processBatch(options: IPdfOptions): Promise<void> {
    // Save user preferences
    localStorage.setItem(METADATA_PREFERENCE_KEY, options.preserveMetadata.toString());
    localStorage.setItem(CUSTOM_FILENAME_PREFERENCE_KEY, options.useCustomFilename.toString());
    if (options.useCustomFilename && options.filenamePattern) {
      localStorage.setItem(FILENAME_PATTERN_PREFERENCE_KEY, options.filenamePattern);
    }
    // Always use HTML for email format
    options.emailBodyFormat = 'html';
    localStorage.setItem(EMAIL_FORMAT_PREFERENCE_KEY, 'html');
    if (options.emailBody) {
      localStorage.setItem(EMAIL_BODY_PREFERENCE_KEY, options.emailBody);
    }
    
    await this.processNextBatchItem(options);
  }

  private async processNextBatchItem(options: IPdfOptions): Promise<void> {
    if (this.batchProcessingIndex >= this.batchItems.length) {
      this.showBatchSummary();
      return;
    }

    const currentItem = this.batchItems[this.batchProcessingIndex];
    const { fileName, fileExtension } = this.getSelectedItemData(currentItem);
    const fileURL = currentItem.getValueByName('FileRef');
    const siteId = this.context.pageContext.site.id;
    const spItemUrl = currentItem.getValueByName('.spItemUrl');
    const driveItemPath = this.extractDriveItemPath(spItemUrl);

    // Update progress in the dialog
    WaitDialog.show(
      this.batchTotal > 1 
        ? this.formatString(strings.ProcessingFile, (this.batchProcessingIndex + 1).toString(), this.batchTotal.toString())
        : strings.ConvertingForEmail || "Converting document for email",
      this.formatString(strings.ConvertingToPdf, fileName)
    );

    // Validate drive path and file type
    if (!driveItemPath) {
      this.logBatchError(fileName, 'Invalid URL for selected item.');
      this.failureCount++;
      this.failedItems.push(fileName);
      this.batchProcessingIndex++;
      await this.processNextBatchItem(options);
      return;
    }
    if (!fileExtension || !this.supportedFileTypes.has(fileExtension)) {
      this.logBatchError(fileName, strings.UnsupportedFileType);
      this.failureCount++;
      this.failedItems.push(fileName);
      this.batchProcessingIndex++;
      await this.processNextBatchItem(options);
      return;
    }

    try {
      let pdfBlob: Blob;
      try {
        // Try primary conversion with Graph API if available
        if (this.graphApiAvailable && driveItemPath) {
          pdfBlob = await this.handlePdfConversionWithGraph(siteId, driveItemPath, fileName);
        } else {
          pdfBlob = await this.handlePdfConversionWithSPHttp(fileURL, fileName);
        }
      } catch (conversionError) {
        console.error(`${LOG_SOURCE}: Primary conversion method failed`, conversionError);
        pdfBlob = await this.handlePdfConversionWithSPHttp(fileURL, fileName);
      }
      
      if (pdfBlob) {
        const attachmentFilename = options.useCustomFilename && options.filenamePattern
          ? this.applyFilenamePattern(fileName, options.filenamePattern)
          : `${this.removeFileExtension(fileName)}.pdf`;
        
        WaitDialog.show(strings.SendingEmail, strings.SendingEmail);
        await this.sendEmailWithAttachment(
          pdfBlob, 
          attachmentFilename,
          options.emailRecipients || '',
          options.emailSubject || strings.EmailDefaultSubject,
          options.emailBody || '',
          options.emailBodyFormat || 'text'
        );
        this.successCount++;
      }
      this.batchProcessingIndex++;
      await this.processNextBatchItem(options);
    } catch (error) {
      console.error(`${LOG_SOURCE}: Error processing ${fileName}`, error);
      this.logBatchError(fileName, error instanceof Error ? error.message : strings.Error);
      this.failureCount++;
      this.failedItems.push(fileName);
      this.batchProcessingIndex++;
      await this.processNextBatchItem(options);
    }
  }

  private showBatchSummary(): void {
    WaitDialog.close();
    if (this.failureCount === 0) {
      WaitDialog.showSuccess(
        strings.Success, 
        this.batchTotal > 1 
          ? `${strings.EmailSendComplete || "Email sending complete"} ${this.successCount} ${this.batchTotal > 1 ? 'files' : 'file'} sent.`
          : strings.EmailSendComplete || "Email sending complete"
      );
    } else if (this.successCount === 0) {
      WaitDialog.showError(strings.Error, `Failed to send ${this.failureCount} ${this.batchTotal > 1 ? 'files' : 'file'}.`);
    } else {
      WaitDialog.showWarning(strings.Warning, `Sent ${this.successCount} of ${this.batchTotal} files. ${this.failureCount} files failed.`);
    }
  }

  private logBatchError(fileName: string, errorMessage: string): void {
    console.error(`${LOG_SOURCE}: Error processing ${fileName}: ${errorMessage}`);
    Log.error(LOG_SOURCE, new Error(`Error processing ${fileName}: ${errorMessage}`));
  }
  /**
   * Extract common properties from a selected item.
   */
  private getSelectedItemData(selectedItem: any): { 
    fileName: string; 
    siteId: string; 
    driveItemPath: string | null; 
    fileExtension: string | undefined; 
  } {
    const fileName = selectedItem.getValueByName('FileLeafRef');
    // Convert Guid to string
    const siteId = this.context.pageContext.site.id.toString();
    const spItemUrl = selectedItem.getValueByName('.spItemUrl');
    const driveItemPath = this.extractDriveItemPath(spItemUrl);
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    return { fileName, siteId, driveItemPath, fileExtension };
  }
  

  private formatString(template: string, ...args: string[]): string {
    return template.replace(/{(\d+)}/g, (match, index) => args[index] || match);
  }

  private extractDriveItemPath(spItemUrl: string): string | null {
    if (!spItemUrl) {
      console.warn(`${LOG_SOURCE}: spItemUrl is empty or undefined`);
      return null;
    }
    const match = spItemUrl.match(/drives\/[^\/]+\/items\/[^\/?]+/);
    return match ? match[0] : null;
  }

  private removeFileExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '');
  }

  private applyFilenamePattern(originalFileName: string, pattern: string): string {
    try {
      const fileNameWithoutExtension = this.removeFileExtension(originalFileName);
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const formattedTime = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
      const timestamp = Math.floor(now.getTime() / 1000);
      const guid = getRandomString(8);
      
      let result = pattern
        .replace(/{filename}/g, fileNameWithoutExtension)
        .replace(/{date}/g, formattedDate)
        .replace(/{time}/g, formattedTime)
        .replace(/{timestamp}/g, timestamp.toString())
        .replace(/{guid}/g, guid);
      
      result = this.sanitizeFileName(result);
      return `${result}.pdf`;
    } catch (error) {
      console.error(`${LOG_SOURCE}: Error applying filename pattern`, error);
      return `${this.removeFileExtension(originalFileName)}.pdf`;
    }
  }

  private sanitizeFileName(filename: string): string {
    return filename.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '_');
  }
  private async handlePdfConversionWithGraph(siteId: any, drivePath: string, fileName: string): Promise<Blob> {
    console.log(`${LOG_SOURCE}: Converting ${fileName} to PDF using Graph API`);
    try {
      const pdfUrl = `${GRAPH_API_BASE}/sites/${siteId}/${drivePath}/content?format=pdf`;
      console.log(`${LOG_SOURCE}: PDF conversion URL: ${pdfUrl}`);
      if (!this.aadHttpClient) {
        throw new Error('Graph client not initialized');
      }
      const response = await this.aadHttpClient.get(pdfUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      console.log(`${LOG_SOURCE}: PDF conversion successful using Graph API`);
      return await response.blob();
    } catch (error: unknown) {
      console.error(`${LOG_SOURCE}: PDF conversion error using Graph API`, error);
      this.graphApiAvailable = false;
      throw error;
    }
  }

  private async handlePdfConversionWithSPHttp(fileUrl: string, fileName: string): Promise<Blob> {
    console.log(`${LOG_SOURCE}: Converting ${fileName} to PDF using SharePoint API`);
    try {
      const sourceDocumentUrl = encodeURIComponent(fileUrl);
      const downloadUrl = `${this.context.pageContext.web.absoluteUrl}/_layouts/15/download.aspx?SourceUrl=${sourceDocumentUrl}&Format=pdf`;
      console.log(`${LOG_SOURCE}: Using download URL: ${downloadUrl}`);
      const response = await this.context.spHttpClient.get(downloadUrl, SPHttpClient.configurations.v1);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      console.log(`${LOG_SOURCE}: PDF conversion successful using SharePoint API`);
      return await response.blob();
    } catch (error) {
      console.error(`${LOG_SOURCE}: PDF conversion error using SharePoint API`, error);
      throw error;
    }
  }
  private async sendEmailWithAttachment(
    pdfBlob: Blob, 
    fileName: string,
    recipients: string, 
    subject: string,
    body: string,
    bodyFormat: 'text' | 'html'
  ): Promise<void> {
    console.log(`${LOG_SOURCE}: Sending email with attachment ${fileName}, format: ${bodyFormat}`);
    const emailSubject = subject || `PDF Document: ${fileName}`;
    const recipientList = recipients.split(';')
      .map(email => email.trim())
      .filter(email => email.length > 0)
      .map(email => ({ emailAddress: { address: email } }));
    
    if (recipientList.length === 0) {
      throw new Error(strings.InvalidEmailAddress);
    }
    
    try {
      const base64data = await this.blobToBase64(pdfBlob);
      if (!this.aadHttpClient || !this.graphApiAvailable) {
        throw new Error('Graph client not available');
      }
      const contentType = bodyFormat === 'html' ? 'HTML' : 'Text';
      const emailContent = body || (bodyFormat === 'html' 
        ? `<p>Please find attached the PDF document.</p>` 
        : `Please find attached the PDF document.`);
      
      const response = await this.aadHttpClient.post(
        `${GRAPH_API_BASE}/me/sendMail`,
        AadHttpClient.configurations.v1,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: {
              subject: emailSubject,
              body: { contentType, content: emailContent },
              toRecipients: recipientList,
              attachments: [
                {
                  "@odata.type": "#microsoft.graph.fileAttachment",
                  "name": fileName,
                  "contentType": "application/pdf",
                  "contentBytes": base64data
                }
              ]
            },
            saveToSentItems: true
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      console.log(`${LOG_SOURCE}: Email sent successfully`);
    } catch (error) {
      console.error(`${LOG_SOURCE}: Email error`, error);
      Log.error(LOG_SOURCE, new Error(`Error sending email: ${error}`));
      throw new Error(strings.EmailError);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert Blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private handleError(error: unknown, userMessage: string): void {
    console.error(`${LOG_SOURCE}: Error occurred`, error);
    Log.error(LOG_SOURCE, error instanceof Error ? error : new Error('Unknown error'));
    
    let displayMessage = userMessage;
    if (error instanceof Error) {
      console.log(`${LOG_SOURCE}: Error message: ${error.message}`);
      if (error.message.includes('Permission')) {
        displayMessage = strings.PermissionDenied;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        displayMessage = strings.NetworkError;
      } else if (error.message.includes('timeout')) {
        displayMessage = strings.Timeout;
      }
    }
    
    WaitDialog.showError(strings.Error, displayMessage);
  }
  //#endregion
}
