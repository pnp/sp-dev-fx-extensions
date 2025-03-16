declare interface IPdfExportCommandSetStrings {
  // Command titles
  DownloadAsPdfTitle: string;
  ConvertToPdfTitle: string;
  SendAsPdfEmailTitle: string;
  
  // Dialog titles and messages
  DownloadAsPdf: string;
  GeneratingFiles: string;
  Error: string;
  Success: string;
  Warning: string;
  
  // PDF Options Dialog
  PdfOptionsTitle: string;
  PdfOptionsSubtext: string;
  PreserveMetadataLabel: string;
  
  // Email options
  EmailAfterConversionLabel: string;
  EmailRecipientsLabel: string;
  EmailSubjectLabel: string;
  EmailDefaultSubject: string;
  EmailBodyLabel: string;
  EmailRecipientsRequired: string;
  
  // Email specific dialog titles and messages
  EmailPdfTitle: string;
  EmailPdfSubtext: string;
  SendEmailButton: string;
  ConvertingForEmail: string;
  EmailSendComplete: string;
  
  // Email format options
  EmailFormatLabel: string;
  EmailFormatPlainText: string;
  EmailFormatHtml: string;
  
  // Custom filename pattern options
  UseCustomFilenameLabel: string;
  FilenamePatternLabel: string;
  FilenamePatternHelp: string;
  InvalidFilenamePattern: string;
  
  // Buttons
  ConvertButton: string;
  CancelButton: string;
  SendButton: string;
  
  // Progress and status messages
  Processing: string;
  ProcessingFile: string;
  ConvertingToPdf: string;
  Converting: string;
  Saving: string;
  SavingPdf: string;
  SendingEmail: string;
  
  // Success messages
  ConversionComplete: string;
  DownloadComplete: string;
  EmailSent: string;
  
  // Error messages
  UnsupportedFileType: string;
  PermissionDenied: string;
  NetworkError: string;
  Timeout: string;
  EmailError: string;
  InvalidEmailAddress: string;
  NoItemsSelected: string;
  UploadError: string;
}

declare module 'PdfExportCommandSetStrings' {
  const strings: IPdfExportCommandSetStrings;
  export = strings;
}