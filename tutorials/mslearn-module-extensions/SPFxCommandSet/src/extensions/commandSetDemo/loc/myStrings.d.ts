declare interface ICommandSetDemoCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'CommandSetDemoCommandSetStrings' {
  const strings: ICommandSetDemoCommandSetStrings;
  export = strings;
}
