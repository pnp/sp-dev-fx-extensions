declare interface IMakeSinglePartAppPageCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'MakeSinglePartAppPageCommandSetStrings' {
  const strings: IMakeSinglePartAppPageCommandSetStrings;
  export = strings;
}
