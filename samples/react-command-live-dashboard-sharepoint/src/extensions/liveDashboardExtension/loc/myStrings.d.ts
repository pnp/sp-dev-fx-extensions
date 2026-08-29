declare interface ILiveDashboardExtensionCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'LiveDashboardExtensionCommandSetStrings' {
  const strings: ILiveDashboardExtensionCommandSetStrings;
  export = strings;
}
