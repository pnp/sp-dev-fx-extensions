declare interface ISpfxCloneStrings {
  Command1: string;
  Command2: string;
}

declare module 'spfxCloneStrings' {
  const strings: ISpfxCloneStrings;
  export = strings;
}
