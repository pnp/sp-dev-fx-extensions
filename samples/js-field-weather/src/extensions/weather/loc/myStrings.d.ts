declare interface IWeatherStrings {
  Title: string;
}

declare module 'weatherStrings' {
  const strings: IWeatherStrings;
  export = strings;
}
