export interface ISubAddResult {
  '@odata.context': string;
  id: string;
  resource: string;
  applicationId: string;
  changeType: string;
  clientState: string;
  notificationUrl: string;
  lifecycleNotificationUrl?: string;
  expirationDateTime: string;
  creatorId: string;
  includeProperties: boolean;
  includeResourceData: boolean;
  encryptionCertificate: string;
  encryptionCertificateId: string;
}
