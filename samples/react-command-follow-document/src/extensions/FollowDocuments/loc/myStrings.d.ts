declare interface IFollowDocumentsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'FollowDocumentsCommandSetStrings' {
  const strings: IFollowDocumentsCommandSetStrings;
  export = strings;
}
