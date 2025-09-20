declare interface IPdfExportCommandSetStrings {
    DownloadAsPdf: string;
    SaveAsPdf: string;
    DownloadMultipleAsPdf: string;
    ConvertMultipleToPdf: string;
    ExtSupport: string;
    CurrentExtSupport: string;
    Processing: string;
    GeneratingFiles: string;
    FailedToProcess: string;
    Exists: string;
    Error: string;
    Completed: string;
    OperationFailed: string;
    FailedToGenerateUrls: string;
    NoValidFiles: string;
    NoFilesConverted: string;
    BatchConversionComplete: string;
    BatchConversionSummary: string;
    BatchDownloadComplete: string;
    BatchDownloadSummary: string;
    Of: string;
    FilesProcessed: string;
    CurrentFile: string;
}

declare module 'PdfExportCommandSetStrings' {
    const strings: IPdfExportCommandSetStrings;
    export = strings;
}
