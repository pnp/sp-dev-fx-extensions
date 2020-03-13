export interface IChatNotificationMessage {
  subscriptionId: string;
  changeType: string;
  tenantId: string;
  clientState: string;
  subscriptionExpirationDateTime: string;
  resource: string;
  resourceData: ResourceData;
  encryptedContent: EncryptedContent;
}

interface EncryptedContent {
  data: string;
  dataSignature: string;
  dataKey: string;
  encryptionCertificateId: string;
  encryptionCertificateThumbprint: string;
}

interface ResourceData {
  id: string;
  '@odata.type': string;
  '@odata.id': string;
}
