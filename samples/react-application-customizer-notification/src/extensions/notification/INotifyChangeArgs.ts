export interface INotifyChangeArgs {
  value: Value[];
}

export interface Value {
  subscriptionId:     string;
  clientState:        string;
  expirationDateTime: Date;
  resource:           string;
  tenantId:           string;
  siteUrl:            string;
  webId:              string;
}
