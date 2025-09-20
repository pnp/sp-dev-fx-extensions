declare interface IRedactionCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'RedactionCommandSetStrings' {
  const strings: IRedactionCommandSetStrings;
  export = strings;
}
