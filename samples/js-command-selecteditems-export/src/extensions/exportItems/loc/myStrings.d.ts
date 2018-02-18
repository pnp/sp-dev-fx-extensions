declare interface IExportItemsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'ExportItemsCommandSetStrings' {
  const strings: IExportItemsCommandSetStrings;
  export = strings;
}
