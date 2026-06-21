declare interface IGroupingCommandSetStrings {
  StatusGroup: string;
  ApproveCommand: string;
  RejectCommand: string;
  ErrorTitle: string;
  UpdateFailed: string;
}

declare module 'GroupingCommandSetStrings' {
  const strings: IGroupingCommandSetStrings;
  export = strings;
}
