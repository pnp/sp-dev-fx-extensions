declare interface ISendToTeamsCommandSetStrings {
  CancelButtonLabel: string;
  Command1: string;
  Command2: string;
ErrorMessageOnSendingMessage: string;
SendButtonLabel: string;
}

declare module 'SendToTeamsCommandSetStrings' {
  const strings: ISendToTeamsCommandSetStrings;
  export = strings;
}
