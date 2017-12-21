declare interface ILockItemCommandSetStrings {
  LockItem: string;
  LockDocument: string;
  UniquePermissionsWarning: string;
  ErrorLocking: string;
  SuccessLocking: string;
  SuccessUnlocking: string;
}

declare module 'LockItemCommandSetStrings' {
  const strings: ILockItemCommandSetStrings;
  export = strings;
}
