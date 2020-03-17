import IFolder from "../../../interfaces/IFolder";
import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import ICustomItem from "../../../interfaces/ICustomItem";
import { TaskState } from "../../../constants/TaskState";
import { IBreadcrumbItem } from "office-ui-fabric-react";

export interface IFolderHierarchyGeneratorProps {
  context: ListViewCommandSetContext;
  batchStatus: IFolder[];
  folderLocation: string;
  folders: ICustomItem[];
  handleAddFolder: (folders: IFolder[], nested: boolean) => void;
  handleUpdateFolders: (folders: ICustomItem[])=> void;
  taskStatus: TaskState;
  updateTaskStatus: (task: TaskState) => void;
  nested: boolean;
  handleNested: (isNested: boolean) => void;
  overflowFolders: IBreadcrumbItem[];
  handleOverflowFolders: (overflowFolders: IBreadcrumbItem[]) => void;
}
