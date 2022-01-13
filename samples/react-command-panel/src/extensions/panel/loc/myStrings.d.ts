declare interface IPanelCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'PanelCommandSetStrings' {
  const strings: IPanelCommandSetStrings;
  export = strings;
}
