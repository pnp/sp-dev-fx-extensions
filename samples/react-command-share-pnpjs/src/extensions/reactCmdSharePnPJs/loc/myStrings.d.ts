declare interface IReactCmdSharePnPJsCommandSetStrings {  
  MultiShareDialogTitle: string;
  MultiShareDialogDescription: string;

  MultiShareDialogSharingItems: string;
  MultiShareDialogSelectShareType: string;
  MultiShareDialogReadRole: string;
  MultiShareDialogEditRole: string;

  MultiShareDialogAddMessageHere: string;
  MultiShareDialogSendEmail: string;
  MultiShareDialogShare: string;
  MultiShareDialogSuggested: string;
  MultiShareDialogNoResults: string;
  MultiShareDialogLoading: string;
  MultiShareDialogSearch: string;
  MultiShareDialogSharingSuccess: string;
  MultiShareDialogSharingError: string;
  MultiShareDialogSharingErrorMsgs: string;


}

declare module 'ReactCmdSharePnPJsCommandSetStrings' {
  const strings: IReactCmdSharePnPJsCommandSetStrings;
  export = strings;
}
