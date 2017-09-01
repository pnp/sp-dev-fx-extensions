declare interface IDialogDemoCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'DialogDemoCommandSetStrings' {
  const strings: IDialogDemoCommandSetStrings;
  export = strings;
}
