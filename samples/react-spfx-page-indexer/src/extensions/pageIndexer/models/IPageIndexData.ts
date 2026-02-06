export interface IPageIndexData {
  pageId: string;  // Unique identifier for the page (hash-based)
  pageUrl: string;
  pageTitle: string;
  pageContent: string;
  totalWordCount: number;
  webParts: IWebPartInfo[];
}

export interface IWebPartInfo {
  webPartId: string;
  webPartTitle: string;
  webPartType: string;
  instanceId: string;
  content: string;
  data: any;
}

export interface IPageIndexerEvent extends CustomEvent {
  detail: IWebPartInfo;
}

export const PAGE_INDEXER_EVENT = 'PageIndexerData';