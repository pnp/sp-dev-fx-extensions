declare interface IAddFoldersCommandSetStrings {
  CommandAddFolders: string;
  ButtonGlobalClose: string;
  FolderMenuRetry: string;
  OverflowSuffixFolderStatusSuccess: string;
  OverflowSuffixFolderStatusFailure: string;
  TooltipFolderAdd: string;
  TooltipFolderDelete: string;
  TooltipFolderStatusSuccess: string;
  TooltipFolderStatusProgress: string;
  TooltipFolderStatusFailure: string;
  TooltipOverflowSuffixFoldersToCreate: string;
  TooltipOverflowSuffixFoldersCreated: string;
  MessageBarTooManyCharacters: string;
  MessageBarMaxFoldersBatch: string;
  LabelCurrentLocation: string;
  TextFieldLabel: string;
  TextFieldDescription: string;
  ButtonClearSelection: string;
  ButtonCreateFolders: string;
  ToggleSelectFoldersCreationMode: string;
  CalloutBannedCharacters: string;
  CalloutBannedWords: string;
  CalloutBannedPrefixCharacters: string;
  CalloutBannedFormsWordAtRoot: string;
  CalloutBannedAttachmentsWordAtRoot: string;
  CalloutBannedCharactersUrl: string;
  CalloutBannedCharactersUrlLink: string;
}

declare module 'AddFoldersCommandSetStrings' {
  const strings: IAddFoldersCommandSetStrings;
  export = strings;
}
