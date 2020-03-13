export interface IKeyVaultSecretResponse {
  value: string;
  id: string;
  attributes: Attributes;
}

export interface Attributes {
  enabled: boolean;
  created: number;
  updated: number;
  recoveryLevel: string;
}