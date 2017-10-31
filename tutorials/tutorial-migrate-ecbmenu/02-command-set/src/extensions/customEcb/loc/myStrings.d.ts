declare interface ICustomEcbCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'CustomEcbCommandSetStrings' {
  const strings: ICustomEcbCommandSetStrings;
  export = strings;
}
