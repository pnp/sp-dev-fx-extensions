declare interface IConvertToPdfCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'ConvertToPdfCommandSetStrings' {
  const strings: IConvertToPdfCommandSetStrings;
  export = strings;
}
