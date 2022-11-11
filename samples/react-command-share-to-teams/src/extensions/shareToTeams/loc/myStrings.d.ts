declare interface IShareToTeamsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'ShareToTeamsCommandSetStrings' {
  const strings: IShareToTeamsCommandSetStrings;
  export = strings;
}
