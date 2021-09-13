declare interface ICopyMoveItemsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'CopyMoveItemsCommandSetStrings' {
  const strings: ICopyMoveItemsCommandSetStrings;
  export = strings;
}
