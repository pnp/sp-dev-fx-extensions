declare interface IGroupingCommandSetStrings {
  StatusGroup: string;
  ShareGroup: string;
  ApproveCommand: string;
  RejectCommand: string;
  CopyLinkCommand: string;
  ErrorTitle: string;
  UpdateFailed: string;
  CopySuccess: string;
  CopyFailed: string;
  ClipboardFallbackPrompt: string;
}

declare module 'GroupingCommandSetStrings' {
  const strings: IGroupingCommandSetStrings;
  export = strings;
}
