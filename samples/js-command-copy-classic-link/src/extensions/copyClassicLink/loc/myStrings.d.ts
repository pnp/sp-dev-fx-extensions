declare interface ICopyClassicLinkCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'CopyClassicLinkCommandSetStrings' {
  const strings: ICopyClassicLinkCommandSetStrings;
  export = strings;
}
