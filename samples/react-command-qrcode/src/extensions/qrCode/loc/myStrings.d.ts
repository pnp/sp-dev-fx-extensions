declare interface IQrCodeCommandSetStrings {
  CopyBtnTitle: string;
  CopyBtnLabel: string;
  DownloadButtonTitle: string;
  DownloadLabel: string;
  FileNameLabel: string;
  CloseLabel: string;
}

declare module 'QrCodeCommandSetStrings' {
  const strings: IQrCodeCommandSetStrings;
  export = strings;
}
