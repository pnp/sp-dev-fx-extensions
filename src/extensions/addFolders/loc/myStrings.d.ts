declare interface IAddFoldersCommandSetStrings {
  CommandAddFolders: string;
  ButtonGlobalClose: string;
  FolderMenuRetry: string;
  OverflowSuffixFolderStatusSuccess: string;
  OverflowSuffixFolderStatusFailure: string;
  TooltipFolderDelete: string;
  TooltipFolderStatusSuccess: string;
  TooltipFolderStatusProgress: string;
  TooltipFolderStatusFailure: string;
  TooltipOverflowSuffixFoldersToCreate: string;
  TooltipOverflowSuffixFoldersCreated: string;
  MessageBarTooManyCharacters: string;
  MessageBarMaxFoldersBatch: string;
  TextFieldLabel: string;
  ButtonClearSelection: string;
  ButtonCreateFolders: string;
  ToggleSelectFoldersCreationMode: string;
  CalloutBannedCharacters: string;
  CalloutBannedWords: string;
  CalloutBannedPrefixCharacters: string;
  CalloutBannedCharactersUrl: string;
  CalloutBannedCharactersUrlLink: string;
}

declare module 'AddFoldersCommandSetStrings' {
  const strings: IAddFoldersCommandSetStrings;
  export = strings;
}
