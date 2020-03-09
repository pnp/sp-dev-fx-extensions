declare interface IDocumentPreviewCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'DocumentPreviewCommandSetStrings' {
  const strings: IDocumentPreviewCommandSetStrings;
  export = strings;
}
