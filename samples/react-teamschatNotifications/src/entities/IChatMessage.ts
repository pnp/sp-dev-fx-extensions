export interface IChatMessage {
  '@odata.context': string;
  id: string;
  replyToId?: any;
  etag: string;
  messageType: string;
  createdDateTime: string;
  lastModifiedDateTime?: any;
  deletedDateTime?: any;
  subject?: any;
  summary?: any;
  importance: string;
  locale: string;
  policyViolation?: any;
  from: From;
  body: Body;
  attachments: IAttachment[];
  mentions: any[];
  reactions: any[];
  deleted: boolean;
}

export interface IAttachment {
  id: string;
  contentType: string;
  contentUrl?: any;
  content: string;
  name?: any;
  thumbnailUrl?: any;
}

interface Body {
  contentType: string;
  content: string;
}

interface From {
  device?: any;
  user?: userIdentity;
  conversation?: any;
  application: Application;
}

interface Application {
  id: string;
  displayName: string;
  applicationIdentityType: string;
}

interface userIdentity {
  displayName: string;
  id: string;
  userIdentityType: string;
}
