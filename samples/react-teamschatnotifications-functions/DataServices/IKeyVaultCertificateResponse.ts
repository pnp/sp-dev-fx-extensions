export interface IKeyVaultCertificateResponse{

  id: string;
  kid: string;
  sid: string;
  x5t: string;
  cer: string;
  attributes: Attributes;
  policy: Policy;
  pending: Pending;
}

interface Pending {
  id: string;
}

interface Policy {
  id: string;
  key_props: Keyprops;
  secret_props: Secretprops;
  x509_props: X509props;
  lifetime_actions: Lifetimeaction[];
  issuer: Issuer;
  attributes: PolicyAttributes;
}

interface PolicyAttributes {
  enabled: boolean;
  created: number;
  updated: number;
}

interface Issuer {
  name: string;
}

interface Lifetimeaction {
  trigger: Trigger;
  action: Action;
}

interface Action {
  action_type: string;
}

interface Trigger {
  lifetime_percentage: number;
}

interface X509props {
  subject: string;
  sans: Sans;
  ekus: string[];
  key_usage: string[];
  validity_months: number;
  basic_constraints: Basicconstraints;
}

interface Basicconstraints {
  ca: boolean;
}

interface Sans {
  dns_names: any[];
}

interface Secretprops {
  contentType: string;
}

interface Keyprops {
  exportable: boolean;
  kty: string;
  key_size: number;
  reuse_key: boolean;
}

interface Attributes {
  enabled: boolean;
  nbf: number;
  exp: number;
  created: number;
  updated: number;
  recoveryLevel: string;
}