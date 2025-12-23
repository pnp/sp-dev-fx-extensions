declare interface IDocumentTranslationCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'DocumentTranslationCommandSetStrings' {
  const strings: IDocumentTranslationCommandSetStrings;
  export = strings;
}
