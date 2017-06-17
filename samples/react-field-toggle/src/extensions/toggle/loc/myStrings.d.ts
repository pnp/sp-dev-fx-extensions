declare interface IToggleStrings {
  Title: string;
}

declare module 'toggleStrings' {
  const strings: IToggleStrings;
  export = strings;
}
