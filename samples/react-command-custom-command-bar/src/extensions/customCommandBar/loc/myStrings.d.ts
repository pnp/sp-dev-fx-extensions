declare interface ICustomCommandBarStrings {
  Command1: string;
  Command2: string;
}

declare module 'customCommandBarStrings' {
  const strings: ICustomCommandBarStrings;
  export = strings;
}
