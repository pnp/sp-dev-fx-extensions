declare interface IHideCommandsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'HideCommandsCommandSetStrings' {
  const strings: IHideCommandsCommandSetStrings;
  export = strings;
}
