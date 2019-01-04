declare interface IJustALinkCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'JustALinkCommandSetStrings' {
  const strings: IJustALinkCommandSetStrings;
  export = strings;
}
