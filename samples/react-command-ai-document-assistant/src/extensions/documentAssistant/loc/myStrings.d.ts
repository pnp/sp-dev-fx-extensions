declare interface IDocumentAssitantCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'DocumentAssitantCommandSetStrings' {
  const strings: IDocumentAssitantCommandSetStrings;
  export = strings;
}
