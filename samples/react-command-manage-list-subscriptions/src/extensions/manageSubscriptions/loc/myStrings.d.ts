declare interface IManageSubscriptionsCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'ManageSubscriptionsCommandSetStrings' {
  const strings: IManageSubscriptionsCommandSetStrings;
  export = strings;
}
