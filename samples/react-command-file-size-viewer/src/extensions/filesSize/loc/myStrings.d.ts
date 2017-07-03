declare interface IFilesSizeStrings {
  FilesSize: string;
}

declare module 'filesSizeStrings' {
  const strings: IFilesSizeStrings;
  export = strings;
}
