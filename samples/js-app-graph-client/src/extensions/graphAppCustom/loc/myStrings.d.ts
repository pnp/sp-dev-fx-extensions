declare interface IGraphAppCustomStrings {
  Title: string;
}

declare module 'graphAppCustomStrings' {
  const strings: IGraphAppCustomStrings;
  export = strings;
}
