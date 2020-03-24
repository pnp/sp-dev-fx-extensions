declare interface IJumpToFolderCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'JumpToFolderCommandSetStrings' {
  const strings: IJumpToFolderCommandSetStrings;
  export = strings;
}
