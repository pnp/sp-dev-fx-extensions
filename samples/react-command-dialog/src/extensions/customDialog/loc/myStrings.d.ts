declare interface ICustomDialogStrings {
  Command1: string;
  Command2: string;
}

declare module 'customDialogStrings' {
  const strings: ICustomDialogStrings;
  export = strings;
}
