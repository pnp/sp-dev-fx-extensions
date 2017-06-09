declare interface IAnalyticsStrings {
  Title: string;
}

declare module 'analyticsStrings' {
  const strings: IAnalyticsStrings;
  export = strings;
}
