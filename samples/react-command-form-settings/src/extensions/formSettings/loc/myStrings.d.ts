declare interface IFormSettingsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'FormSettingsCommandSetStrings' {
  const strings: IFormSettingsCommandSetStrings;
  export = strings;
}
