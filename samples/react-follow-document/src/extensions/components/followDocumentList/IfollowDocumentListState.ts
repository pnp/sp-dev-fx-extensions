import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";

export interface IfollowDocumentListState {
  isOpen: boolean;
  fileList: MicrosoftGraph.DriveItem[];

  SiteID?: string;
  ListID?: string;

  visible?:boolean;

}
