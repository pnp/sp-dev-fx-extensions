import { RowAccessor } from '@microsoft/sp-listview-extensibility';
import { DocumentInfo, SUPPORTED_FILE_EXTENSIONS } from '../models/RedactionModels';

export class FileValidationService {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit
  private static readonly MIN_FILE_SIZE = 1; // 1 byte minimum

  public static validateSelectedItems(selectedItems: readonly RowAccessor[]): DocumentInfo[] {
    return selectedItems.map(item => this.validateSingleItem(item));
  }

  private static validateSingleItem(item: RowAccessor): DocumentInfo {
    const name = item.getValueByName('FileLeafRef') || item.getValueByName('LinkFilename') || 'Unknown';
    const serverRelativeUrl = item.getValueByName('FileRef') || '';
    const size = parseInt(item.getValueByName('File_x0020_Size') || '0', 10);
    const fileExtension = this.getFileExtension(name);

    const documentInfo: DocumentInfo = {
      id: item.getValueByName('UniqueId') || item.getValueByName('GUID') || '',
      name,
      serverRelativeUrl,
      size,
      fileType: fileExtension,
      isSupported: true
    };

    // Validate file extension
    if (!this.isFileTypeSupported(fileExtension)) {
      documentInfo.isSupported = false;
      documentInfo.errorMessage = `File type '${fileExtension}' is not supported. Supported types: ${SUPPORTED_FILE_EXTENSIONS.join(', ')}`;
      return documentInfo;
    }

    // Validate file size
    if (size > this.MAX_FILE_SIZE) {
      documentInfo.isSupported = false;
      documentInfo.errorMessage = `File size (${this.formatFileSize(size)}) exceeds maximum limit of ${this.formatFileSize(this.MAX_FILE_SIZE)}`;
      return documentInfo;
    }

    if (size < this.MIN_FILE_SIZE) {
      documentInfo.isSupported = false;
      documentInfo.errorMessage = 'File appears to be empty or corrupted';
      return documentInfo;
    }

    // Check if it's actually a file (not a folder)
    if (!serverRelativeUrl || !name.includes('.')) {
      documentInfo.isSupported = false;
      documentInfo.errorMessage = 'Selected item is not a valid file';
      return documentInfo;
    }

    return documentInfo;
  }

  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
  }

  private static isFileTypeSupported(extension: string): boolean {
    return SUPPORTED_FILE_EXTENSIONS.indexOf(extension.toLowerCase()) > -1;
  }

  private static _formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public static formatFileSize(bytes: number): string {
    return this._formatFileSize(bytes);
  }

  public static getSupportedFilesCount(documents: DocumentInfo[]): number {
    return documents.filter(doc => doc.isSupported).length;
  }

  public static getUnsupportedFilesCount(documents: DocumentInfo[]): number {
    return documents.filter(doc => !doc.isSupported).length;
  }

  public static getTotalSize(documents: DocumentInfo[]): number {
    return documents
      .filter(doc => doc.isSupported)
      .reduce((total, doc) => total + doc.size, 0);
  }

  public static getValidationSummary(documents: DocumentInfo[]): string {
    const supported = this.getSupportedFilesCount(documents);
    const unsupported = this.getUnsupportedFilesCount(documents);
    const totalSize = this.formatFileSize(this.getTotalSize(documents));

    if (unsupported === 0) {
      return `${supported} file${supported !== 1 ? 's' : ''} ready for processing (${totalSize})`;
    } else {
      return `${supported} file${supported !== 1 ? 's' : ''} ready for processing, ${unsupported} file${unsupported !== 1 ? 's' : ''} skipped (${totalSize})`;
    }
  }
}