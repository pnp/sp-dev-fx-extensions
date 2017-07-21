declare interface ISpfxToastrStrings {
  Title: string;
  FailedToLoad: string;
}

declare module 'spfxToastrStrings' {
  const strings: ISpfxToastrStrings;
  export = strings;
}
