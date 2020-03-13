export interface IUser {
  '@odata.context': string;
  businessPhones: string[];
  displayName: string;
  givenName: string;
  jobTitle: string;
  mail: string;
  mobilePhone: string;
  officeLocation?: any;
  preferredLanguage: string;
  surname: string;
  userPrincipalName: string;
  id: string;
}
