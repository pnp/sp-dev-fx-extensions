import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";

export interface IFolderHierarchyGeneratorProps {
  context: ListViewCommandSetContext;
  currentLocation: string;
  commandTitle: string;
  hideDialog: boolean;
  closeDialog: () => void;
}
