import IFolder from "../../../interfaces/IFolder";
import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";

export interface IFolderHierarchyGeneratorProps {
  context: ListViewCommandSetContext;
  batchStatus: IFolder[];
  handleAddFolder: (folders: IFolder[], nested: boolean) => void;
}
