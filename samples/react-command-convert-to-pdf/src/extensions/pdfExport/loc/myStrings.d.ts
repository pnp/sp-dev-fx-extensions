declare interface IPdfExportCommandSetStrings {
    DownloadAsPdf: string;
    SaveAsPdf: string;
    ExtSupport: string;
    CurrentExtSupport: string;
    Processing: string;
    GeneratingFiles: string;
    FailedToProcess: string;
    Exists: string;
}

declare module 'PdfExportCommandSetStrings' {
    const strings: IPdfExportCommandSetStrings;
    export = strings;
}
