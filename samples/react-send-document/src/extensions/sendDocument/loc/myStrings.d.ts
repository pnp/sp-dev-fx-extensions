declare interface ISendDocumentCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'SendDocumentCommandSetStrings' {
  const strings: ISendDocumentCommandSetStrings;
  export = strings;
}
