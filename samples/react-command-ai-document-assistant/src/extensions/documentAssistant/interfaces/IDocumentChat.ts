import { ExtensionContext } from "@microsoft/sp-extension-base";

export interface IDocumentChatProps {  
  context: ExtensionContext;
  siteUrl: string;
  listName: string;
  driveId: string;
  itemId: string;
  fileName: string;
  currentUser: string;
  fileIcon: string;

}