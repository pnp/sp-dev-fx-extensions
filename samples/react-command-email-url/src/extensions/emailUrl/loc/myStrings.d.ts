declare interface IEmailUrlStrings {
  Command1: string;
  Command2: string;
}

declare module 'emailUrlStrings' {
  const strings: IEmailUrlStrings;
  export = strings;
}
