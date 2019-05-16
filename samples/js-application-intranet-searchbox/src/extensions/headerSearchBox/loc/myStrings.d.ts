declare interface IHeaderSearchBoxApplicationCustomizerStrings {
  Title: string;
  FormLabel: string;
  InputLabel: string;
  InputPlaceholder: string;
  PanelTextPrefix: string;
  ButtonTitleClear: string;
  ButtonTitleMagnify: string;
  ButtonTitleSearch: string;
  
  LogWebPropertiesNotFound: string;
  LogRedirectingTo: string;
  LogElementNotFound: string;
}

declare module 'HeaderSearchBoxApplicationCustomizerStrings' {
  const strings: IHeaderSearchBoxApplicationCustomizerStrings;
  export = strings;
}
