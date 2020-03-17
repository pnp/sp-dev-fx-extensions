import { IBreadcrumbItem, IOverflowSetItemProps } from "office-ui-fabric-react";
import { FolderStatus } from "../constants/FolderStatus";

export default interface ICustomItem extends IBreadcrumbItem, IOverflowSetItemProps {
  status: FolderStatus;
  hidden: boolean;
  value: string;
}
