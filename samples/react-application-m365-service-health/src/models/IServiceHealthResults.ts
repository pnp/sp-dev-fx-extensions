export interface IServiceHealthResults {
  '@odata.context': string;
  '@microsoft.graph.tips': string;
  value: IHealthServices[];
}

export interface IHealthServices {
  service: string;
  status: string;
  id: string;
  'issues@odata.context': string;
  issues: Issue[];
}

export interface Issue {
  startDateTime: string;
  endDateTime: string;
  lastModifiedDateTime: string;
  title: string;
  id: string;
  impactDescription: string;
  classification: string;
  origin: string;
  status: string;
  service: string;
  feature: string;
  featureGroup: string;
  isResolved: boolean;
  details: unknown[];
  posts: Post[];
}

export interface Post {
  createdDateTime: string;
  postType: string;
  description: Description;
}

export interface Description {
  contentType: string;
  content: string;
}