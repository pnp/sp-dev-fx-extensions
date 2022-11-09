export interface ICustomAction {
  Description: string;
  Group: string;
  HostProperties: string;
  Id: string;
  ImageUrl: string;
  Location: string;
  Name: string;
  RegistrationId: string;
  RegistrationType: number;
  Rights: {
    High: number;
    Low: number;
  };
  Scope: ICustomActionScope;
  ScriptBlock: string;
  ScriptSrc: string;
  Sequence: number;
  Title: string;
  Url: string;
  VersionOfUserCustomAction: string;
  '@odata.id': string;
}

export enum ICustomActionScope {
  Unknown = 0,
  Site = 2,
  Web = 3,
  List = 4
}
