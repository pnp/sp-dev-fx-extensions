declare interface IGetThumbnailCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'GetThumbnailCommandSetStrings' {
  const strings: IGetThumbnailCommandSetStrings;
  export = strings;
}
