declare interface ISpfxCloneCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'SpfxCloneCommandSetStrings' {
  const strings: ISpfxCloneCommandSetStrings;
  export = strings;
}
