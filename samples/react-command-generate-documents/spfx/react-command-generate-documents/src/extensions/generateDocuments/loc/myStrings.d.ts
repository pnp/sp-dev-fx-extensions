declare interface IGenerateDocumentsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'GenerateDocumentsCommandSetStrings' {
  const strings: IGenerateDocumentsCommandSetStrings;
  export = strings;
}
