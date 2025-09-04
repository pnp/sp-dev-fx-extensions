import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IArchiveOverviewProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  siteUrl: string;
  context: WebPartContext;
}

export interface IArchivedDocument {
  documentId: string;
  title: string;
  description?: string;
  originalUrl: string;
  blobUrl: string;
  containerName: string;
  libraryName: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  archivedDate: string;
  archivedBy: string;
  siteUrl: string;
  listId: string;
  itemId: string;
  metadata?: Record<string, unknown>;
}

export interface IDocumentLibrary {
  id: string;
  title: string;
  webUrl: string;
  itemCount: number;
  rootFolderName: string;
}

export interface IArchivedDocumentsResponse {
  siteUrl: string;
  movedDocuments: IArchivedDocument[];
  documentLibraries: IDocumentLibrary[];
  timestamp: string;
}
